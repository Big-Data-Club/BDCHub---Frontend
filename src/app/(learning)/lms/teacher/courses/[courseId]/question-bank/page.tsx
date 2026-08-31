"use client";

/**
 * Question Bank (Thư viện đề thi) - /lms/teacher/courses/[courseId]/question-bank
 *
 * Per-course reusable question library:
 *  - Facet stats (difficulty / bloom / source / dangling / month clusters)
 *  - Filter + full-text search + server-side pagination
 *  - AI generation INTO the bank (knowledge-graph aware, dedup vs existing)
 *  - Smart import from any document / pasted text
 *  - Assemble quizzes by copying selected items
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LibraryBig,
  Sparkles,
  UploadCloud,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Layers,
  PlusCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { DataTable } from "@/components/lms/shared/DataTable";
import { SearchBar, FilterDropdown } from "@/components/lms/shared";
import type { ColumnDef } from "@/components/lms/shared/DataTable";
import { QuizSmartImportModal } from "@/components/lms/teacher/modals/QuizSmartImportModal";
import BaseModal from "@/components/lms/shared/BaseModal";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import quizService from "@/services/lms/quizService";
import lmsService from "@/services/lms/lmsService";
import aiService from "@/services/ai/aiService";
import { cn } from "@/lib/utils";
import AIRevisionPanel from "@/components/lms/teacher/AIRevisionPanel";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankItem {
  id: number;
  question_type: string;
  question_text: string;
  points: number;
  bloom_level?: string;
  difficulty: string;
  node_id?: number | null;
  source: string;
  status: string;
  created_at: string;
  explanation?: string;
  answer_options?: { option_text: string; is_correct: boolean; order_index: number }[];
  correct_answers?: { answer_text?: string; blank_id?: number | null }[];
}

interface BankStats {
  total: number;
  dangling_count: number;
  by_difficulty: Record<string, number>;
  by_source: Record<string, number>;
  by_month: { month: string; count: number }[];
}

const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Dễ" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HARD", label: "Khó" },
];

const BLOOM_OPTIONS = [
  { value: "remember", label: "Nhớ" },
  { value: "understand", label: "Hiểu" },
  { value: "apply", label: "Áp dụng" },
  { value: "analyze", label: "Phân tích" },
  { value: "evaluate", label: "Đánh giá" },
  { value: "create", label: "Sáng tạo" },
];

const SOURCE_OPTIONS = [
  { value: "AI_GENERATED", label: "AI sinh" },
  { value: "IMPORT", label: "Nhập từ tài liệu" },
  { value: "QUIZ", label: "Từ quiz" },
  { value: "MANUAL", label: "Thủ công" },
];

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  HARD: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "Trắc nghiệm 1 đáp án",
  MULTIPLE_CHOICE: "Trắc nghiệm nhiều đáp án",
  SHORT_ANSWER: "Tự luận ngắn",
  ESSAY: "Tự luận dài",
  FILE_UPLOAD: "Nộp file",
  FILL_BLANK_TEXT: "Điền từ (text)",
  FILL_BLANK_DROPDOWN: "Điền từ (dropdown)",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuestionBankPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = Number(params.courseId);

  // Data state
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<BankItem[]>([]);
  const [stats, setStats] = useState<BankStats | null>(null);
  const [nodes, setNodes] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filters + pagination (server-side)
  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [bloom, setBloom] = useState("");
  const [source, setSource] = useState("");
  const [nodeFilter, setNodeFilter] = useState(""); // "" | "dangling" | nodeId
  const [month, setMonth] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selection & dialogs
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [previewItem, setPreviewItem] = useState<BankItem | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showGenDialog, setShowGenDialog] = useState(false);
  const [genCount, setGenCount] = useState(10);
  const [genBlooms, setGenBlooms] = useState<string[]>(["remember", "understand", "apply"]);
  const [genNodeIds, setGenNodeIds] = useState<number[]>([]);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Create-from-selected dialog
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizInstructions, setQuizInstructions] = useState("");
  const [quizTimeLimit, setQuizTimeLimit] = useState(30);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState(3);
  const [quizPassingScore, setQuizPassingScore] = useState(80);
  const [quizAvailableFrom, setQuizAvailableFrom] = useState("");
  const [quizAvailableUntil, setQuizAvailableUntil] = useState("");
  const [quizShuffleQuestions, setQuizShuffleQuestions] = useState(true);
  const [quizShuffleAnswers, setQuizShuffleAnswers] = useState(true);
  const [quizPublished, setQuizPublished] = useState(false);
  const [quizWizardStep, setQuizWizardStep] = useState<"preview" | "settings">("preview");
  const [suggestingQuiz, setSuggestingQuiz] = useState(false);
  const [sections, setSections] = useState<{ id: number; title: string }[]>([]);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await quizService.getBankStats(courseId);
      setStats(res?.data ?? null);
    } catch {}
  }, [courseId]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const timeFrom = month ? `${month}-01` : undefined;
      const res = await quizService.getQuestionBank(courseId, {
        page,
        page_size: pageSize,
        q: q || undefined,
        difficulty: difficulty || undefined,
        bloom_level: bloom || undefined,
        source: source || undefined,
        dangling: nodeFilter === "dangling" ? true : undefined,
        node_id: nodeFilter && nodeFilter !== "dangling" ? Number(nodeFilter) : undefined,
        time_from: timeFrom,
        sort,
        order,
      });
      setItems(res?.data?.items ?? []);
      setTotal(res?.data?.total ?? 0);
      setTotalPages(res?.data?.total_pages ?? 1);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không tải được ngân hàng đề thi.");
    } finally {
      setLoading(false);
    }
  }, [courseId, page, pageSize, q, difficulty, bloom, source, nodeFilter, month, sort, order]);

  useEffect(() => {
    loadStats();
    aiService.listKnowledgeNodes(courseId)
      .then((ns) => setNodes(ns.map((n) => ({ id: n.id, name: n.name_vi ?? n.name }))))
      .catch(() => {});
    lmsService.listSections(courseId)
      .then((res) => {
        const list = (res?.data ?? []).map((s: any) => ({ id: s.id, title: s.title }));
        setSections(list);
        if (list.length > 0) setSectionId(list[0].id);
      })
      .catch(() => {});
  }, [courseId, loadStats]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [q, difficulty, bloom, source, nodeFilter, month, sort, order]);

  const refreshAll = () => {
    loadItems();
    loadStats();
    setSelectedIds(new Set());
  };

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      await quizService.generateBankQuestions(courseId, {
        count: genCount,
        bloom_levels: genBlooms.length > 0 ? genBlooms : undefined,
        node_ids: genNodeIds.length > 0 ? genNodeIds : undefined,
        language: "vi",
      });
      setShowGenDialog(false);
      refreshAll();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? err?.response?.data?.detail ?? "Không thể sinh câu hỏi. Kiểm tra dịch vụ AI.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa câu hỏi này khỏi ngân hàng?")) return;
    setDeletingId(id);
    try {
      await quizService.deleteBankItem(id);
      refreshAll();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Xóa thất bại.");
    } finally {
      setDeletingId(null);
    }
  };

  const applyQuestionRevision = async (proposal: Record<string, unknown>) => {
    if (!previewItem) return;
    try {
      await quizService.updateBankItem(previewItem.id, proposal);
      setPreviewItem({ ...previewItem, ...proposal } as BankItem);
      await loadItems();
      toast.success("Đã áp dụng bản chỉnh sửa AI vào câu hỏi.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Không thể lưu bản chỉnh sửa câu hỏi.");
    }
  };

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const allVisibleSelected =
    items.length > 0 && items.every((it) => selectedIds.has(it.id));

  const selectedBankItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  const openQuizWizard = async () => {
    const itemIds = Array.from(selectedIds);
    if (itemIds.length === 0) return;
    setQuizWizardStep("preview");
    setQuizTitle(`Bài kiểm tra kiến thức (${itemIds.length} câu)`);
    setQuizDescription("Bài kiểm tra được tổng hợp từ ngân hàng câu hỏi của khóa học.");
    setQuizInstructions("Đọc kỹ từng câu hỏi và chọn đáp án phù hợp nhất.");
    setQuizTimeLimit(30);
    setQuizMaxAttempts(3);
    setQuizPassingScore(80);
    setQuizAvailableFrom("");
    setQuizAvailableUntil("");
    setQuizShuffleQuestions(true);
    setQuizShuffleAnswers(true);
    setQuizPublished(false);
    setShowCreateQuiz(true);
    setSuggestingQuiz(true);
    try {
      const response = await quizService.suggestQuizFromBank(courseId, itemIds);
      const suggestion = response?.data;
      if (suggestion?.title) setQuizTitle(suggestion.title);
      if (suggestion?.description) setQuizDescription(suggestion.description);
      if (suggestion?.instructions) setQuizInstructions(suggestion.instructions);
    } catch {
      // Deterministic defaults above keep the wizard usable if AI is busy.
    } finally {
      setSuggestingQuiz(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!sectionId || !quizTitle.trim() || creating || selectedIds.size === 0) return;
    if (quizAvailableFrom && quizAvailableUntil && new Date(quizAvailableUntil) <= new Date(quizAvailableFrom)) {
      alert("Thời gian đóng phải sau thời gian mở.");
      return;
    }
    setCreating(true);
    try {
      const res = await quizService.createQuizFromBank(courseId, {
        section_id: sectionId,
        title: quizTitle.trim(),
        description: quizDescription.trim(),
        instructions: quizInstructions.trim(),
        item_ids: Array.from(selectedIds),
        time_limit_minutes: quizTimeLimit > 0 ? quizTimeLimit : null,
        max_attempts: quizMaxAttempts,
        passing_score: quizPassingScore,
        available_from: quizAvailableFrom ? new Date(quizAvailableFrom).toISOString() : null,
        available_until: quizAvailableUntil ? new Date(quizAvailableUntil).toISOString() : null,
        shuffle_questions: quizShuffleQuestions,
        shuffle_answers: quizShuffleAnswers,
        auto_grade: true,
        is_published: quizPublished,
      });
      const quizId = res?.data?.quiz_id;
      setShowCreateQuiz(false);
      if (quizId) {
        router.push(`/lms/teacher/quiz/${quizId}/manage`);
      } else {
        refreshAll();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Tạo quiz thất bại.");
    } finally {
      setCreating(false);
    }
  };

  const columns: ColumnDef<BankItem>[] = useMemo(
    () => [
      {
        key: "select",
        header: () => (
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={() =>
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (allVisibleSelected) items.forEach((it) => next.delete(it.id));
                else items.forEach((it) => next.add(it.id));
                return next;
              })
            }
            className="w-4 h-4 cursor-pointer"
          />
        ),
        width: "40px",
        cell: (item) => (
          <input
            type="checkbox"
            checked={selectedIds.has(item.id)}
            onChange={() => toggleSelect(item.id)}
            className="w-4 h-4 cursor-pointer"
          />
        ),
      },
      {
        key: "question_text",
        header: "Câu hỏi",
        minWidth: "320px",
        cell: (item) => (
          <div className="max-w-[420px]">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2">
              {item.question_text.replace(/[#*`_[\]]/g, "")}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                {item.source === "AI_GENERATED" ? "AI" : item.source === "IMPORT" ? "Nhập" : item.source === "QUIZ" ? "Từ quiz" : "Thủ công"}
              </span>
              {!item.node_id && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300">
                  Chưa gắn node
                </span>
              )}
              {item.bloom_level && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300">
                  {item.bloom_level}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "difficulty",
        header: "Mức độ",
        sortable: true,
        sortKey: "difficulty",
        width: "110px",
        cell: (item) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = item.difficulty === "EASY" ? "MEDIUM" : item.difficulty === "MEDIUM" ? "HARD" : "EASY";
              quizService.updateBankItem(item.id, { difficulty: next }).then(loadItems).catch(() => {});
            }}
            title="Bấm để đổi mức độ"
            className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity",
              DIFFICULTY_BADGE[item.difficulty]
            )}
          >
            {DIFFICULTY_OPTIONS.find((d) => d.value === item.difficulty)?.label ?? item.difficulty}
          </button>
        ),
      },
      {
        key: "points",
        header: "Điểm",
        sortable: true,
        sortKey: "points",
        width: "70px",
        cell: (item) => <span className="text-sm font-mono">{item.points}</span>,
      },
      {
        key: "created_at",
        header: "Ngày tạo",
        sortable: true,
        sortKey: "created_at",
        width: "110px",
        cell: (item) => (
          <span className="text-xs text-slate-500">
            {new Date(item.created_at).toLocaleDateString("vi-VN")}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        width: "84px",
        cell: (item) => (
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewItem(item);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              title="Xem trước câu hỏi"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
              disabled={deletingId === item.id}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Xóa"
            >
              {deletingId === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, selectedIds, allVisibleSelected, deletingId, loadItems]
  );

  if (!mounted) {
    return (
      <div className="p-12 text-center flex items-center justify-center gap-2 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Đang tải thư viện đề thi...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-24 lg:pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/40 flex items-center justify-center">
            <LibraryBig className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Thư viện đề thi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ngân hàng câu hỏi của khóa học - nhập bằng AI, sinh đề tự động, ghép thành quiz nhanh.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenDialog(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Sinh đề bằng AI
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Nhập từ tệp / văn bản
          </button>
        </div>
      </div>

      {/* Stats chips */}
      {stats && stats.total > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 font-semibold text-slate-700 dark:text-slate-200">
            Tổng: <strong>{stats.total}</strong>
          </span>
          {Object.entries(stats.by_difficulty).map(([k, v]) => (
            <span
              key={k}
              className={cn("px-3 py-1.5 rounded-xl border font-semibold", DIFFICULTY_BADGE[k])}
            >
              {DIFFICULTY_OPTIONS.find((d) => d.value === k)?.label}: <strong>{v}</strong>
            </span>
          ))}
          <button
            onClick={() => {
              setNodeFilter(nodeFilter === "dangling" ? "" : "dangling");
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl border font-semibold cursor-pointer transition-colors",
              nodeFilter === "dangling"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-orange-50 dark:bg-orange-950/25 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-800/60 hover:bg-orange-100"
            )}
          >
            Chưa gắn node: <strong>{stats.dangling_count}</strong>
          </button>
          {stats.by_month.slice(-6).map((m) => (
            <button
              key={m.month}
              onClick={() => setMonth(month === m.month ? "" : m.month)}
              title={`Lọc theo tháng ${m.month}`}
              className={cn(
                "px-3 py-1.5 rounded-xl border font-mono font-semibold cursor-pointer transition-colors",
                month === m.month
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-50 dark:bg-[#0F1E35] text-slate-500 border-slate-200 dark:border-blue-500/15 hover:border-blue-400"
              )}
            >
              {m.month} · {m.count}
            </button>
          ))}
        </div>
      )}

      {/* Filters - responsive: search grows, dropdowns keep intrinsic width */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 min-w-0">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="Tìm trong câu hỏi...  (nhập để lọc tức thì)"
            size="sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-[150px]">
            <FilterDropdown
              value={difficulty}
              onValueChange={setDifficulty}
              options={[{ value: "", label: "Mọi mức độ" }, ...DIFFICULTY_OPTIONS]}
            />
          </div>
          <div className="w-[160px]">
            <FilterDropdown
              value={bloom}
              onValueChange={setBloom}
              options={[{ value: "", label: "Mọi cấp Bloom" }, ...BLOOM_OPTIONS]}
            />
          </div>
          <div className="w-[160px]">
            <FilterDropdown
              value={source}
              onValueChange={setSource}
              options={[{ value: "", label: "Mọi nguồn" }, ...SOURCE_OPTIONS]}
            />
          </div>
          <div className="w-[185px] max-w-full">
            <FilterDropdown
              value={nodeFilter}
              onValueChange={setNodeFilter}
              options={[
                { value: "", label: "Mọi node" },
                { value: "dangling", label: "Chưa gắn node" },
                ...nodes.map((n) => ({ value: String(n.id), label: n.name })),
              ]}
            />
          </div>
          <div className="w-[170px]">
            <FilterDropdown
              value={`${sort}:${order}`}
              onValueChange={(v) => {
                const [s, o] = v.split(":");
                setSort(s);
                setOrder(o as "asc" | "desc");
              }}
              options={[
                { value: "created_at:desc", label: "Mới nhất" },
                { value: "created_at:asc", label: "Cũ nhất" },
                { value: "points:desc", label: "Điểm cao → thấp" },
                { value: "difficulty:asc", label: "Dễ → khó" },
                { value: "difficulty:desc", label: "Khó → dễ" },
              ]}
            />
          </div>
          <button
            onClick={refreshAll}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-blue-500/15 text-slate-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-cyan-500/40 transition-colors cursor-pointer shrink-0"
            title="Làm mới"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-cyan-500/20">
          <span className="text-sm font-semibold text-blue-700 dark:text-cyan-300">
            Đã chọn {selectedIds.size} câu hỏi
          </span>
          <div className="flex gap-2">
            <button
              onClick={openQuizWizard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Tổng hợp thành quiz
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-300 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Table */}
      <DataTable<BankItem>
        data={items}
        columns={columns}
        keyExtractor={(it) => String(it.id)}
        loading={loading}
        onRowClick={(it) => setPreviewItem(it)}
        renderMobileCard={(item) => (
          <button
            type="button"
            onClick={() => setPreviewItem(item)}
            className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-blue-500/15 bg-white dark:bg-[#0F1E35] space-y-2 cursor-pointer hover:border-blue-400 dark:hover:border-cyan-500/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", DIFFICULTY_BADGE[item.difficulty])}>
                {DIFFICULTY_OPTIONS.find((d) => d.value === item.difficulty)?.label ?? item.difficulty}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                {item.source === "AI_GENERATED" ? "AI" : item.source === "IMPORT" ? "Nhập" : item.source === "QUIZ" ? "Từ quiz" : "Thủ công"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono ml-auto">{item.points}đ</span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-3">
              {item.question_text.replace(/[#*`_[\]]/g, "")}
            </p>
          </button>
        )}
        emptyState={
          <div className="py-12 text-center">
            <Layers className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-700 opacity-60" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {q || difficulty || bloom || source || nodeFilter
                ? "Không có câu hỏi nào khớp bộ lọc."
                : "Ngân hàng còn trống - hãy Nhập từ tệp hoặc Sinh đề bằng AI."}
            </p>
          </div>
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Trang {page}/{totalPages} · {total} câu hỏi
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-blue-500/15 disabled:opacity-40 enabled:hover:border-blue-400 text-slate-600 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-blue-500/15 disabled:opacity-40 enabled:hover:border-blue-400 text-slate-600 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Question preview modal */}
      <BaseModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Xem trước câu hỏi
            </span>
          </div>
        }
        description="Toàn bộ nội dung sẽ được dùng nguyên vẹn khi đưa vào quiz."
        size="xl"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <button
              onClick={() => setPreviewItem(null)}
              className="px-5 h-11 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-all"
            >
              Đóng
            </button>
          </div>
        }
      >
        {previewItem && (
          <div className="space-y-5">
            <AIRevisionPanel
              kind="question"
              label="AI chỉnh sửa câu hỏi"
              source={{
                question_text: previewItem.question_text, explanation: previewItem.explanation ?? "",
                answer_options: previewItem.answer_options ?? [], correct_answers: previewItem.correct_answers ?? [],
                difficulty: previewItem.difficulty, bloom_level: previewItem.bloom_level ?? "", points: previewItem.points,
              }}
              onApply={applyQuestionRevision}
            />
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", DIFFICULTY_BADGE[previewItem.difficulty])}>
                {DIFFICULTY_OPTIONS.find((d) => d.value === previewItem.difficulty)?.label ?? previewItem.difficulty}
              </span>
              {previewItem.bloom_level && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300">
                  Bloom: {previewItem.bloom_level}
                </span>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {QUESTION_TYPE_LABELS[previewItem.question_type] ?? previewItem.question_type}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">{previewItem.points} điểm</span>
              {!previewItem.node_id && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300">
                  Chưa gắn node
                </span>
              )}
            </div>

            {/* Question body */}
            <div className="rounded-xl border border-slate-200 dark:border-blue-500/15 p-4 bg-white dark:bg-[#0B1830]">
              <MarkdownRenderer content={previewItem.question_text} />
            </div>

            {/* Options */}
            {!!previewItem.answer_options?.length && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Các đáp án</p>
                {previewItem.answer_options.map((opt, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-2.5 px-4 py-2.5 rounded-xl text-sm border",
                      opt.is_correct
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-medium"
                        : "border-slate-200 dark:border-blue-500/10 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <span className="font-bold shrink-0 mt-0.5">
                      {opt.is_correct ? "✓" : String.fromCharCode(65 + i) + "."}
                    </span>
                    <div className="min-w-0 flex-1">
                      <MarkdownRenderer content={opt.option_text} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Correct answers (fill-blank / short answer) */}
            {!!previewItem.correct_answers?.length && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Đáp án đúng</p>
                {previewItem.correct_answers.map((ans, i) => (
                  <div key={i} className="px-4 py-2 rounded-xl text-sm bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                    {ans.blank_id != null && <span className="font-bold mr-2">Ô {ans.blank_id}:</span>}
                    {ans.answer_text}
                  </div>
                ))}
              </div>
            )}

            {/* Explanation */}
            {previewItem.explanation && (
              <div className="rounded-xl bg-blue-50/80 dark:bg-cyan-950/20 border border-blue-200/70 dark:border-cyan-500/20 p-4 text-sm text-blue-900 dark:text-cyan-200">
                <p className="font-bold text-xs uppercase tracking-wider mb-1.5 text-blue-600 dark:text-cyan-400">Giải thích</p>
                <MarkdownRenderer content={previewItem.explanation} />
              </div>
            )}
          </div>
        )}
      </BaseModal>

      {/* Import modal (target = bank) */}
      {showImport && (
        <QuizSmartImportModal
          courseId={courseId}
          target="bank"
          onClose={() => setShowImport(false)}
          onImported={refreshAll}
        />
      )}

      {/* AI generation dialog */}
      {showGenDialog && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0F1E35] rounded-2xl shadow-2xl border border-slate-200 dark:border-blue-500/15 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">Sinh đề vào Thư viện</h3>
                <p className="text-xs text-slate-500">Chọn phần kiến thức cần kiểm tra hoặc để AI quét toàn khóa.</p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Node kiến thức
                </label>
                <button
                  type="button"
                  onClick={() => setGenNodeIds([])}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Toàn khóa
                </button>
              </div>
              <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 p-2 space-y-1">
                {nodes.length === 0 ? (
                  <p className="px-2 py-3 text-xs text-slate-500">Khóa học chưa có node kiến thức.</p>
                ) : nodes.map((node) => {
                  const checked = genNodeIds.includes(node.id);
                  return (
                    <label
                      key={node.id}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm cursor-pointer transition-colors",
                        checked
                          ? "bg-blue-50 text-blue-800 dark:bg-cyan-950/40 dark:text-cyan-200"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setGenNodeIds((current) =>
                          checked ? current.filter((id) => id !== node.id) : [...current, node.id]
                        )}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="min-w-0 truncate">{node.name}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {genNodeIds.length > 0
                  ? `Đã chọn ${genNodeIds.length} node. AI chỉ dùng nội dung thuộc các node này.`
                  : "Chưa chọn node: AI phân bổ câu hỏi trên toàn bộ knowledge graph."}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Số câu muốn sinh
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={genCount}
                onChange={(e) => setGenCount(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Cấp độ Bloom (bỏ trống = tất cả)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BLOOM_OPTIONS.map((b) => {
                  const active = genBlooms.includes(b.value);
                  return (
                    <button
                      key={b.value}
                      onClick={() =>
                        setGenBlooms((prev) =>
                          active ? prev.filter((x) => x !== b.value) : [...prev, b.value]
                        )
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                        active
                          ? "border-blue-500 bg-blue-50 dark:bg-cyan-950/40 text-blue-700 dark:text-cyan-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Mức độ (Dễ/Trung/Khó) được suy ra chuẩn từ cấp độ Bloom - không phụ thuộc model AI.
              Câu trùng với ngân hàng hiện có sẽ bị loại tự động.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 h-11 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang sinh... (có thể mất ~1 phút)
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Sinh {genCount} câu hỏi
                  </>
                )}
              </button>
              <button
                onClick={() => !generating && setShowGenDialog(false)}
                className="px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create-quiz-from-selected dialog */}
      {showCreateQuiz && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#0F1E35] rounded-2xl shadow-2xl border border-slate-200 dark:border-blue-500/15 p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  Tổng hợp {selectedIds.size} câu thành quiz
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {quizWizardStep === "preview" ? "Bước 1/2 · Kiểm tra câu hỏi" : "Bước 2/2 · Cấu hình và xuất bản"}
                </p>
              </div>
              <div className="flex gap-1">
                <span className={cn("h-1.5 w-10 rounded-full", quizWizardStep === "preview" ? "bg-blue-600" : "bg-blue-200 dark:bg-blue-900")} />
                <span className={cn("h-1.5 w-10 rounded-full", quizWizardStep === "settings" ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700")} />
              </div>
            </div>

            {quizWizardStep === "preview" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-950/25 px-4 py-3 text-sm">
                  <span className="font-semibold text-blue-800 dark:text-cyan-200">Preview đề · {selectedBankItems.length} câu · {selectedBankItems.reduce((sum, item) => sum + item.points, 0)} điểm</span>
                  {suggestingQuiz && <span className="flex items-center gap-1.5 text-xs text-blue-600"><Loader2 className="h-3.5 w-3.5 animate-spin" /> AI đang đề xuất tên</span>}
                </div>
                <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
                  {selectedBankItems.map((item, index) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-bold text-blue-600">Câu {index + 1}</span>
                        <span>·</span><span>{QUESTION_TYPE_LABELS[item.question_type] ?? item.question_type}</span>
                        <span>·</span><span>{item.points} điểm</span>
                      </div>
                      <MarkdownRenderer content={item.question_text} />
                      {(item.answer_options?.length ?? 0) > 0 && (
                        <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                          {item.answer_options!.map((option, optionIndex) => (
                            <div key={optionIndex} className={cn("rounded-lg border px-3 py-2 text-xs", option.is_correct ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/25 dark:text-emerald-200" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300")}>
                              {String.fromCharCode(65 + optionIndex)}. {option.option_text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">Câu hỏi được sao chép; bản gốc luôn còn trong ngân hàng để tái sử dụng.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-violet-200 bg-violet-50/60 dark:border-violet-900 dark:bg-violet-950/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                    <Sparkles className="h-4 w-4" /> AI đề xuất · giảng viên có thể sửa
                  </div>
                  <input autoFocus maxLength={255} value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-violet-200 dark:border-violet-800 bg-white dark:bg-[#0D192E] text-sm font-semibold outline-none" placeholder="Tên bài kiểm tra" />
                  <textarea value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} className="mt-2 min-h-20 w-full resize-y px-4 py-2.5 rounded-xl border border-violet-200 dark:border-violet-800 bg-white dark:bg-[#0D192E] text-sm outline-none" placeholder="Mô tả ngắn" />
                  <textarea value={quizInstructions} onChange={(e) => setQuizInstructions(e.target.value)} className="mt-2 min-h-20 w-full resize-y px-4 py-2.5 rounded-xl border border-violet-200 dark:border-violet-800 bg-white dark:bg-[#0D192E] text-sm outline-none" placeholder="Hướng dẫn làm bài" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="text-xs font-bold text-slate-500">THỜI GIAN (PHÚT)<input type="number" min={0} value={quizTimeLimit} onChange={(e) => setQuizTimeLimit(Math.max(0, Number(e.target.value)))} className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] px-3 py-2.5 text-sm" /></label>
                  <label className="text-xs font-bold text-slate-500">SỐ LẦN LÀM<input type="number" min={1} value={quizMaxAttempts} onChange={(e) => setQuizMaxAttempts(Math.max(1, Number(e.target.value)))} className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] px-3 py-2.5 text-sm" /></label>
                  <label className="text-xs font-bold text-slate-500">ĐIỂM ĐẠT (%)<input type="number" min={0} max={100} value={quizPassingScore} onChange={(e) => setQuizPassingScore(Math.min(100, Math.max(0, Number(e.target.value))))} className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] px-3 py-2.5 text-sm" /></label>
                  <label className="text-xs font-bold text-slate-500">MỞ TỪ<input type="datetime-local" value={quizAvailableFrom} onChange={(e) => setQuizAvailableFrom(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] px-3 py-2.5 text-sm" /></label>
                  <label className="text-xs font-bold text-slate-500">ĐÓNG LÚC<input type="datetime-local" value={quizAvailableUntil} onChange={(e) => setQuizAvailableUntil(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] px-3 py-2.5 text-sm" /></label>
                  <label className="text-xs font-bold text-slate-500">CHƯƠNG<select value={sectionId ?? ""} onChange={(e) => setSectionId(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] px-3 py-2.5 text-sm"><option value="" disabled>Chọn chương</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}</select></label>
                </div>
                {sections.length === 0 && <p className="text-xs text-amber-600">Khóa học chưa có chương; hãy tạo chương trước khi lưu quiz.</p>}

                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm"><input type="checkbox" checked={quizShuffleQuestions} onChange={(e) => setQuizShuffleQuestions(e.target.checked)} /> Trộn câu hỏi</label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm"><input type="checkbox" checked={quizShuffleAnswers} onChange={(e) => setQuizShuffleAnswers(e.target.checked)} /> Trộn đáp án</label>
                  <label className={cn("flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold", quizPublished ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/25 dark:text-emerald-200" : "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-200")}><input type="checkbox" checked={quizPublished} onChange={(e) => setQuizPublished(e.target.checked)} /> {quizPublished ? "Xuất bản ngay" : "Lưu bản nháp"}</label>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {quizWizardStep === "preview" ? (
                <button onClick={() => setQuizWizardStep("settings")} className="flex-1 h-11 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer"><Eye className="h-4 w-4" /> Tiếp tục cấu hình</button>
              ) : (
                <>
                  <button onClick={() => setQuizWizardStep("preview")} disabled={creating} className="px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold cursor-pointer">Xem lại</button>
                  <button onClick={handleCreateQuiz} disabled={creating || !quizTitle.trim() || !sectionId || sections.length === 0} className="flex-1 h-11 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                    {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo...</> : quizPublished ? "Tạo và xuất bản ngay" : "Tạo quiz bản nháp"}
                  </button>
                </>
              )}
              <button
                onClick={() => setShowCreateQuiz(false)}
                disabled={creating}
                className="px-4 h-11 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
