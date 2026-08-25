"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  RefreshCw, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertCircle,
  Layers, Filter, ArrowUpDown
} from "lucide-react";
import aiService, { GeneratedQuestion, KnowledgeNode, KnowledgeGraphEdge } from "@/services/ai/aiService";
import { cn } from "@/lib/utils";
import { TabBar } from "@/components/lms/shared/TabBar";
import { SearchBar } from "@/components/lms/shared";

// ─── Lazy-loaded heavy sub-components ─────────────────────────────────────────

const AINodeManager = dynamic(
  () => import("@/components/lms/teacher/ai/AINodeManager").then(m => ({ default: m.AINodeManager })),
  { ssr: false, loading: () => <div className="py-8 text-center text-xs text-slate-400">Đang tải quản lý nodes…</div> },
);

const QuizSelectorModal = dynamic(
  () => import("@/components/lms/teacher/modals/QuizSelectorModal").then(m => ({ default: m.QuizSelectorModal })),
  { ssr: false },
);

interface Props {
  courseId: number;
}

const BLOOM_LEVELS = [
  { id: "remember",   label: "Nhớ",       emoji: "🔵" },
  { id: "understand", label: "Hiểu",      emoji: "🟢" },
  { id: "apply",      label: "Áp dụng",   emoji: "🟡" },
  { id: "analyze",    label: "Phân tích", emoji: "🟠" },
  { id: "evaluate",   label: "Đánh giá",  emoji: "🔴" },
  { id: "create",     label: "Sáng tạo",  emoji: "🟣" },
];

const STATUS_CFG = {
  DRAFT:     { label: "Chờ duyệt", cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800" },
  APPROVED:  { label: "Đã duyệt",  cls: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" },
  REJECTED:  { label: "Từ chối",   cls: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800" },
  PUBLISHED: { label: "Đã xuất bản", cls: "bg-blue-50 dark:bg-cyan-950/30 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-800" },
};

function DraftCard({
  q,
  onApproveClick,
  onReject,
}: {
  q: GeneratedQuestion;
  onApproveClick: (id: number) => void;
  onReject: (id: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  const bloomEmoji = BLOOM_LEVELS.find((b) => b.id === q.bloom_level)?.emoji ?? "⚪";
  const bloomLabel = BLOOM_LEVELS.find((b) => b.id === q.bloom_level)?.label ?? q.bloom_level;
  const statusCfg = STATUS_CFG[q.status] ?? STATUS_CFG.DRAFT;

  const handleApprove = () => {
    onApproveClick(q.id);
  };

  const handleReject = async () => {
    if (!note.trim()) { alert("Vui lòng nhập lý do từ chối."); return; }
    setRejecting(true);
    try { await onReject(q.id); } finally { setRejecting(false); }
  };

  return (
    <div className="bg-white dark:bg-[#0D192E] rounded-2xl border border-slate-200/80 dark:border-blue-500/15 overflow-hidden shadow-xs hover:shadow-md transition-all">
      {/* Header row */}
      <button
        type="button"
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-lg flex-shrink-0">{bloomEmoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{q.question_text}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">{bloomLabel}</span>
            {q.node_name && (
              <>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{q.node_name}</span>
              </>
            )}
          </div>
        </div>
        <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0", statusCfg.cls)}>
          {statusCfg.label}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {/* Expanded */}
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-blue-500/10 pt-4">
          {/* Answer options */}
          <div className="space-y-2">
            {q.answer_options.map((opt, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border",
                  opt.is_correct
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                )}
              >
                <span className="flex-shrink-0 mt-0.5 font-bold">{opt.is_correct ? "✓" : String.fromCharCode(65 + i) + "."}</span>
                <div className="flex-1">
                  <p>{opt.text}</p>
                  {opt.is_correct && opt.explanation && (
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 opacity-90">{opt.explanation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Explanation & source */}
          {q.explanation && (
            <div className="bg-blue-50/80 dark:bg-cyan-950/20 border border-blue-200/80 dark:border-cyan-500/20 rounded-xl p-3 text-xs text-blue-900 dark:text-cyan-200">
              <p className="font-bold text-xs uppercase tracking-wider mb-1 text-blue-600 dark:text-cyan-400">Giải thích</p>
              {q.explanation}
            </div>
          )}
          {q.source_quote && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 italic">
              <p className="font-semibold not-italic mb-1 text-slate-500 dark:text-slate-400">Trích từ tài liệu:</p>
              {q.source_quote}
            </div>
          )}

          {/* Actions (only for DRAFT) */}
          {q.status === "DRAFT" && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleApprove}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <CheckCircle2 className="w-4 h-4" />
                Duyệt câu hỏi
              </button>
              <div className="flex-1 flex gap-2">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Lý do từ chối…"
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                />
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={rejecting}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <XCircle className="w-4 h-4" />
                  {rejecting ? "…" : "Từ chối"}
                </button>
              </div>
            </div>
          )}
          {q.review_note && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">Ghi chú: {q.review_note}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function AIQuizGenPanel({ courseId }: Props) {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<KnowledgeGraphEdge[]>([]);
  const [drafts, setDrafts] = useState<GeneratedQuestion[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [error, setError] = useState("");
  // Quiz authoring moved to the question-bank tab; this panel keeps the
  // knowledge-tree manager and the draft review queue only.
  const [activeSection, setActiveSection] = useState<"nodes" | "drafts">("nodes");

  // Quiz selector modal states
  const [isQuizSelectorOpen, setIsQuizSelectorOpen] = useState(false);
  const [pendingQuestionId, setPendingQuestionId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  
  // Filtering & Sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBloom, setFilterBloom] = useState<string>("all");
  const [filterNode, setFilterNode]   = useState<string>("all");
  const [sortBy, setSortBy]           = useState<"newest" | "oldest" | "bloom" | "node">("newest");

  const loadNodes = useCallback(async () => {
    try {
      const data = await aiService.listKnowledgeNodes(courseId);
      setNodes(data);
    } catch {
      // nodes might not be configured yet
    }
  }, [courseId]);

  const loadGraph = useCallback(async () => {
    try {
      const graph = await aiService.getKnowledgeGraph(courseId);
      setGraphEdges(graph.edges ?? []);
    } catch {
      // graph endpoint may not be available
    }
  }, [courseId]);

  const loadDrafts = useCallback(async () => {
    setLoadingDrafts(true);
    try {
      const data = await aiService.listDraftQuestions(courseId);
      
      const formattedDrafts = data.map((q: any) => ({
        ...q,
        answer_options: typeof q.answer_options === 'string' 
          ? JSON.parse(q.answer_options) 
          : q.answer_options
      }));
      setDrafts(formattedDrafts);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Không tải được danh sách câu hỏi.");
    } finally {
      setLoadingDrafts(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadNodes();
    loadGraph();
    loadDrafts();
  }, [loadNodes, loadGraph, loadDrafts]);

  const handleApproveClick = (questionId: number) => {
    setPendingQuestionId(questionId);
    setIsQuizSelectorOpen(true);
  };

  const handleQuizSelected = async (quizId: number) => {
    if (!pendingQuestionId) return;
    
    setApprovingId(pendingQuestionId);
    try {
      await aiService.approveQuestion(pendingQuestionId, quizId);
      await loadDrafts();
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? "Lỗi khi duyệt câu hỏi");
    } finally {
      setApprovingId(null);
      setPendingQuestionId(null);
    }
  };

  const handleRejectQuestion = async (id: number) => {
    await aiService.rejectQuestion(id, "Câu hỏi không phù hợp");
    await loadDrafts();
  };

  const uniqueNodes = useMemo(() => {
    const nodesInDrafts = drafts
      .map(d => d.node_name)
      .filter((name): name is string => !!name);
    return Array.from(new Set(nodesInDrafts)).sort();
  }, [drafts]);

  const filteredDrafts = useMemo(() => {
    let result = [...drafts];
    result = result.filter(d => d.status === "DRAFT");

    if (filterBloom !== "all") {
      result = result.filter(d => d.bloom_level === filterBloom);
    }
    if (filterNode !== "all") {
      result = result.filter(d => d.node_name === filterNode);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.question_text.toLowerCase().includes(q) || 
        d.node_name?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest": return a.id - b.id;
        case "bloom": {
          const idxA = BLOOM_LEVELS.findIndex(bl => bl.id === a.bloom_level);
          const idxB = BLOOM_LEVELS.findIndex(bl => bl.id === b.bloom_level);
          return idxA - idxB;
        }
        case "node": return (a.node_name || "").localeCompare(b.node_name || "");
        case "newest":
        default:
          return b.id - a.id;
      }
    });

    return result;
  }, [drafts, filterBloom, filterNode, searchQuery, sortBy]);

  const draftCount = drafts.filter((d) => d.status === "DRAFT").length;

  return (
    <div className="bg-white dark:bg-[#0F1E35] rounded-3xl border border-slate-200/80 dark:border-blue-500/15 p-5 md:p-6 shadow-xs space-y-5">
      {/* System Tab Bar Navigation */}
      <div className="border-b border-slate-100 dark:border-blue-500/10 pb-3">
        <TabBar
          tabs={[
            { id: "nodes", label: "Cây kiến thức (Nodes)", badge: nodes.length },
            { id: "drafts", label: "Chờ duyệt", badge: draftCount },
          ]}
          active={activeSection}
          onChange={(id) => setActiveSection(id as any)}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-[#FFF1F2] dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
          {error}
        </div>
      )}

      {/* Drafts tab */}
      {activeSection === "drafts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {filteredDrafts.length === draftCount 
                ? `${draftCount} chờ duyệt` 
                : `${filteredDrafts.length} / ${draftCount} kết quả`
              }
            </p>
            <button 
              type="button"
              onClick={loadDrafts} 
              disabled={loadingDrafts}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-40 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-xl"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loadingDrafts && "animate-spin")} />
              Làm mới
            </button>
          </div>

          {/* Filter Bar */}
          <div className="space-y-2">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm nội dung câu hỏi..."
              size="md"
            />
            
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl min-h-[44px]">
                <Filter className="w-3.5 h-3.5" />
                <span className="font-bold uppercase tracking-wider text-xs">Bloom:</span>
                <select
                  value={filterBloom}
                  onChange={e => setFilterBloom(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 cursor-pointer font-semibold p-0 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">Tất cả</option>
                  {BLOOM_LEVELS.map(b => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>

              {uniqueNodes.length > 0 && (
                <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl min-h-[44px]">
                  <Filter className="w-3.5 h-3.5" />
                  <span className="font-bold uppercase tracking-wider text-xs">Node:</span>
                  <select
                    value={filterNode}
                    onChange={e => setFilterNode(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 cursor-pointer font-semibold p-0 max-w-[120px] text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">Tất cả</option>
                    {uniqueNodes.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl min-h-[44px] ml-auto">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="font-bold uppercase tracking-wider text-xs">Xếp:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none focus:ring-0 cursor-pointer font-semibold p-0 text-slate-800 dark:text-slate-200"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="bloom">Bloom</option>
                  <option value="node">Node</option>
                </select>
              </div>
            </div>
          </div>

          {loadingDrafts ? (
            <div className="flex items-center justify-center py-8 gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Đang tải câu hỏi…</p>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/50">
              <Layers className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {searchQuery || filterBloom !== "all" || filterNode !== "all" 
                  ? "Không tìm thấy câu hỏi phù hợp."
                  : "Chưa có câu hỏi nào chờ duyệt. Sinh đề bằng AI tại tab Thư viện đề thi."}
              </p>
            </div>
          ) : (
            filteredDrafts.map((q) => (
              <div key={q.id} className={approvingId === q.id ? "opacity-50 pointer-events-none" : ""}>
                <DraftCard
                  q={q}
                  onApproveClick={handleApproveClick}
                  onReject={handleRejectQuestion}
                />
                {approvingId === q.id && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-600 dark:text-cyan-400">
                    <div className="w-3 h-3 border-2 border-blue-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    Đang duyệt…
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeSection === "nodes" && (
        <AINodeManager
          courseId={courseId}
          nodes={nodes}
          graphEdges={graphEdges}
          onNodesChange={() => { loadNodes(); loadGraph(); }}
        />
      )}

      {/* Quiz Selector Modal */}
      <QuizSelectorModal
        courseId={courseId}
        isOpen={isQuizSelectorOpen}
        onClose={() => setIsQuizSelectorOpen(false)}
        onSelect={handleQuizSelected}
      />
    </div>
  );
}

