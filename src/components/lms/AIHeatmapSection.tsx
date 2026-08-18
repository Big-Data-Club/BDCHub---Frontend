"use client";

/**
 * AIHeatmapSection.tsx
 * Knowledge-gap heatmap powered by AI.
 * Works for both student (my-heatmap) and teacher (class heatmap) views.
 *
 * Usage:
 *   <AIHeatmapSection courseId={123} role="student" />
 *   <AIHeatmapSection courseId={123} role="teacher" />
 */

import { useEffect, useState, useMemo } from "react";
import { RefreshCw, Sparkles, AlertCircle, Users, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import aiService, { HeatmapNode } from "@/services/ai/aiService";
import { cn } from "@/lib/utils";

interface Props {
  courseId: number;
  role: "student" | "teacher";
}

function getMasteryColor(rate: number): string {
  // rate = wrong_rate (0-100), lower = better
  if (rate <= 10) return "bg-emerald-500 dark:bg-emerald-600";
  if (rate <= 25) return "bg-emerald-400 dark:bg-emerald-500";
  if (rate <= 40) return "bg-amber-400 dark:bg-amber-500";
  if (rate <= 60) return "bg-orange-500 dark:bg-orange-600";
  return "bg-rose-500 dark:bg-rose-600";
}

function getMasteryLabel(rate: number): string {
  if (rate <= 10) return "Rất tốt";
  if (rate <= 25) return "Tốt";
  if (rate <= 40) return "Trung bình";
  if (rate <= 60) return "Yếu";
  return "Cần cải thiện";
}

function getMasteryTextColor(rate: number): string {
  if (rate <= 10) return "text-emerald-700 dark:text-emerald-300";
  if (rate <= 25) return "text-emerald-600 dark:text-emerald-400";
  if (rate <= 40) return "text-amber-700 dark:text-amber-300";
  if (rate <= 60) return "text-orange-700 dark:text-orange-300";
  return "text-rose-700 dark:text-rose-300";
}

const formatPercent = (val: number | null | undefined) => {
  if (val == null || isNaN(val) || !isFinite(val)) return 0;
  return Number(Number(val).toFixed(2));
};

function HeatCell({ node }: { node: HeatmapNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="article"
      aria-label={`${node.name_vi ?? node.node_name}: ${node.total_attempts === 0 ? "Chưa có tương tác" : `${formatPercent(node.wrong_rate)}% sai`}`}
    >
      <div className={cn(
        "rounded-xl p-3 cursor-default transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none",
        getMasteryColor(node.wrong_rate),
        hovered && "scale-105 shadow-lg z-10"
      )}>
        <p className="text-white font-semibold text-xs leading-tight truncate">
          {node.name_vi ?? node.node_name}
        </p>
        <p className="text-white/90 text-xs mt-1 font-mono">
          {node.total_attempts === 0 ? "Chưa có TT" : `${formatPercent(node.wrong_rate)}% sai`}
        </p>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700 pointer-events-none">
          <p className="font-semibold mb-1">{node.name_vi ?? node.node_name}</p>
          <div className="space-y-0.5 text-slate-300">
            <p>{node.total_wrong}/{node.total_attempts} câu sai</p>
            {node.student_count > 0 && <p className="flex items-center gap-1"><Users className="w-3 h-3" />{node.student_count} học viên</p>}
            <p className={cn("font-medium", getMasteryTextColor(node.wrong_rate))}>
              {getMasteryLabel(node.wrong_rate)}
            </p>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

export function AIHeatmapSection({ courseId, role }: Props) {
  const [nodes, setNodes] = useState<HeatmapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default to save initial page load space

  const fetch = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = role === "teacher"
        ? await aiService.getClassHeatmap(courseId)
        : await aiService.getStudentHeatmap(courseId);
      setNodes(data);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Không thể tải heatmap. Dịch vụ AI tạm thời gián đoạn.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, [courseId, role]);

  const weakest = useMemo(() => {
    return [...nodes].sort((a, b) => b.wrong_rate - a.wrong_rate).slice(0, 3);
  }, [nodes]);

  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
      if (a.total_attempts === 0 && b.total_attempts === 0) return 0;
      if (a.total_attempts === 0) return 1;
      if (b.total_attempts === 0) return -1;
      return b.wrong_rate - a.wrong_rate;
    });
  }, [nodes]);

  return (
    <div className="bg-white dark:bg-[#0F1E35] rounded-3xl border border-slate-200/80 dark:border-blue-500/15 p-5 md:p-6 shadow-xs space-y-4 transition-all duration-300">
      {/* Header with Expand / Collapse Trigger */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/10 pb-4 flex-wrap gap-3">
        <button 
          onClick={() => setIsExpanded(prev => !prev)}
          className="flex items-center gap-3 text-left group focus:outline-none focus:ring-2 focus:ring-blue-500/40 rounded-2xl p-1 -ml-1 transition-all"
          type="button"
          aria-expanded={isExpanded}
          aria-controls="heatmap-content-area"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-cyan-950/40 flex items-center justify-center border border-blue-200/60 dark:border-cyan-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors flex-wrap">
              {role === "teacher" ? "Bản đồ điểm yếu lớp học" : "Điểm yếu của tôi"}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-cyan-950/50 text-blue-700 dark:text-cyan-300 border border-blue-200/60 dark:border-cyan-500/20">
                {nodes.length} chủ đề
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {role === "teacher"
                ? "Tỉ lệ sai theo chủ đề — màu đỏ phản ánh nội dung sinh viên cần chú ý nhất"
                : "AI phân tích lỗi sai của bạn theo từng chủ đề"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetch(true)}
            disabled={refreshing}
            className="p-2.5 min-w-[44px] min-h-[44px] rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-blue-500/15 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
            title="Làm mới Heatmap"
            aria-label="Làm mới Heatmap"
            type="button"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin text-blue-600 dark:text-cyan-400")} />
          </button>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            type="button"
            aria-expanded={isExpanded}
            aria-controls="heatmap-content-area"
            className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#0D192E] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-blue-500/20 rounded-xl transition-all active:scale-95 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <span>{isExpanded ? "Thu gọn" : "Xem bản đồ"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <div className="w-5 h-5 border-2 border-blue-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI đang tính toán bản đồ kiến thức…</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Dịch vụ AI tạm thời gián đoạn</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 font-medium">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && nodes.length === 0 && (
        <div className="py-8 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Chưa có đủ dữ liệu học tập. Hãy tiếp tục làm bài luyện tập để AI phân tích!
          </p>
        </div>
      )}

      {!loading && !error && nodes.length > 0 && (
        <div className="space-y-4" id="heatmap-content-area">
          {/* Collapsible Content Area */}
          {isExpanded && (
            <div className="space-y-4 animate-fadeIn motion-reduce:animate-none duration-200">
              {/* Heatmap grid with bounded max height scroll container */}
              <div className="max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {sortedNodes.map((n) => <HeatCell key={n.node_id} node={n} />)}
                </div>
              </div>

              {/* Legend & Stats Footer */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-blue-500/10">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Mức độ:</span>
                  {[
                    { color: "bg-emerald-500 dark:bg-emerald-600", label: "Rất tốt" },
                    { color: "bg-amber-400 dark:bg-amber-500", label: "Trung bình" },
                    { color: "bg-orange-500 dark:bg-orange-600", label: "Yếu" },
                    { color: "bg-rose-500 dark:bg-rose-600", label: "Cần cải thiện" },
                  ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span className={cn("w-3 h-3 rounded-md shadow-2xs", l.color)} />
                      {l.label}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  Hiển thị tất cả {nodes.length} Knowledge Nodes
                </span>
              </div>
            </div>
          )}

          {/* Top weak spots alert (Always visible if critical weak spots exist) */}
          {weakest.some((n) => n.wrong_rate > 30) && (
            <div className="bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-500/30 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                  <p className="text-xs font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                    Top 3 chủ đề cần ưu tiên củng cố
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {weakest.filter((n) => n.wrong_rate > 30).map((n) => (
                  <div key={n.node_id} className="flex items-center justify-between p-2.5 bg-white/80 dark:bg-[#0D192E]/80 rounded-xl border border-rose-200/50 dark:border-rose-500/20">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                      {n.name_vi ?? n.node_name}
                    </span>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap font-mono">
                      {n.total_attempts === 0 ? "Chưa làm" : `${formatPercent(n.wrong_rate)}% sai`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

