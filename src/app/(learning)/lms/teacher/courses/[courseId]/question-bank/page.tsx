"use client";

/**
 * Question Bank (Thư viện đề thi) — /lms/teacher/courses/[courseId]/question-bank
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
} from "lucide-react";
import { DataTable } from "@/components/lms/shared/DataTable";
import { SearchBar, FilterDropdown } from "@/components/lms/shared";
import type { ColumnDef } from "@/components/lms/shared/DataTable";
import { QuizSmartImportModal } from "@/components/lms/teacher/modals/QuizSmartImportModal";
import quizService from "@/services/lms/quizService";
import lmsService from "@/services/lms/lmsService";
import aiService from "@/services/ai/aiService";
import { cn } from "@/lib/utils";

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
  { value: "MANUAL", label: "Thủ công" },
];

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  HARD: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuestionBankPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = Number(params.courseId);

  // Data state
  const [items, setItems] = useState<BankItem[]>([]);
  const [stats, setStats] = useState<BankStats | null>(null);
  const [nodes, setNodes] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  const [showImport, setShowImport] = useState(false);
  const [showGenDialog, setShowGenDialog] = useState(false);
  const [genCount, setGenCount] = useState(10);
  const [genBlooms, setGenBlooms] = useState<string[]>(["remember", "understand", "apply"]);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Create-from-selected dialog
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
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

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allVisibleSelected =
    items.length > 0 && items.every((it) => selectedIds.has(it.id));

  const handleCreateQuiz = async () => {
    if (!sectionId || !quizTitle.trim() || creating || selectedIds.size === 0) return;
    setCreating(true);
    try {
      // Mirror the QuizCreationWizard finalize sequence:
      // content (QUIZ) inside the chosen section -> quiz from bank items.
      const existing = await lmsService.listContent(sectionId);
      const nextOrder = ((existing?.data ?? []).length ?? 0) + 1;
      const contentRes = await lmsService.createContent(sectionId, {
        type: "QUIZ",
        title: quizTitle.trim(),
        description: `Từ Thư viện đề thi — ${selectedIds.size} câu hỏi`,
        order_index: nextOrder,
        is_mandatory: true,
      });
      const contentId = contentRes?.data?.id;
      if (!contentId) throw new Error("Không tạo được nội dung quiz.");

      const res = await quizService.createQuizFromBank({
        content_id: contentId,
        title: quizTitle.trim(),
        item_ids: Array.from(selectedIds),
        max_attempts: 3,
        auto_grade: true,
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
                {item.source === "AI_GENERATED" ? "AI" : item.source === "IMPORT" ? "Nhập" : "Thủ công"}
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
        width: "60px",
        cell: (item) => (
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
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, selectedIds, allVisibleSelected, deletingId, loadItems]
  );

  return (
    <div className="space-y-6 animate-fadeIn">
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
              Ngân hàng câu hỏi của khóa học — nhập bằng AI, sinh đề tự động, ghép thành quiz nhanh.
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder="Tìm trong câu hỏi..."
          size="sm"
        />
        <div className="flex flex-wrap gap-2">
          <FilterDropdown
            value={difficulty}
            onValueChange={setDifficulty}
            options={[{ value: "", label: "Mọi mức độ" }, ...DIFFICULTY_OPTIONS]}
          />
          <FilterDropdown
            value={bloom}
            onValueChange={setBloom}
            options={[{ value: "", label: "Mọi cấp Bloom" }, ...BLOOM_OPTIONS]}
          />
          <FilterDropdown
            value={source}
            onValueChange={setSource}
            options={[{ value: "", label: "Mọi nguồn" }, ...SOURCE_OPTIONS]}
          />
          <FilterDropdown
            value={nodeFilter}
            onValueChange={setNodeFilter}
            options={[
              { value: "", label: "Mọi node" },
              { value: "dangling", label: "Chưa gắn node" },
              ...nodes.map((n) => ({ value: String(n.id), label: n.name })),
            ]}
          />
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
          <button
            onClick={refreshAll}
            className="p-2 rounded-xl border border-slate-200 dark:border-blue-500/15 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
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
              onClick={() => {
                setQuizTitle(`Quiz từ ngân hàng (${new Date().toLocaleDateString("vi-VN")})`);
                setShowCreateQuiz(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo quiz từ mục đã chọn
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
        emptyState={
          <div className="py-12 text-center">
            <Layers className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-700 opacity-60" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {q || difficulty || bloom || source || nodeFilter
                ? "Không có câu hỏi nào khớp bộ lọc."
                : "Ngân hàng còn trống — hãy Nhập từ tệp hoặc Sinh đề bằng AI."}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0F1E35] rounded-2xl shadow-2xl border border-slate-200 dark:border-blue-500/15 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">Sinh đề vào Thư viện</h3>
                <p className="text-xs text-slate-500">AI tự quét knowledge graph + tránh trùng câu đã có.</p>
              </div>
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
              Mức độ (Dễ/Trung/Khó) được suy ra chuẩn từ cấp độ Bloom — không phụ thuộc model AI.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0F1E35] rounded-2xl shadow-2xl border border-slate-200 dark:border-blue-500/15 p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Tạo quiz từ {selectedIds.size} câu đã chọn
            </h3>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Tiêu đề quiz
              </label>
              <input
                autoFocus
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="VD: Giữa kỳ - Đề 1"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Đặt vào chương
              </label>
              <select
                value={sectionId ?? ""}
                onChange={(e) => setSectionId(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] text-sm focus:outline-none"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              {sections.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">Khóa học chưa có chương nào.</p>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Câu hỏi được <strong>sao chép</strong> vào quiz — bản gốc vẫn giữ nguyên trong thư viện.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCreateQuiz}
                disabled={creating || !quizTitle.trim() || !sectionId || sections.length === 0}
                className="flex-1 h-11 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo...
                  </>
                ) : (
                  "Tạo quiz & mở quản lý"
                )}
              </button>
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
