"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import analyticsService, { WeaknessOverviewResponse, WeakNode } from "@/services/lms/analyticsService";

interface Props {
  courseId: number;
}

const LEVEL_COLORS = {
  "Rất tốt": "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  "TB": "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  "Yếu": "bg-orange-50 dark:bg-orange-950/30 text-orange-650 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
  "Cần cải thiện": "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
};

const formatPercent = (val: number | null | undefined) => {
  if (val == null || isNaN(val) || !isFinite(val)) return 0;
  return Number(Number(val).toFixed(2));
};

export function WeaknessTracker({ courseId }: Props) {
  const [data, setData] = useState<WeaknessOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [visibleCount, setVisibleCount] = useState(5);

  const isMounted = useRef(true);

  const sortedNodes = useMemo(() => {
    if (!data?.weak_nodes) return [];
    return [...data.weak_nodes].sort((a, b) => {
      const getRate = (n: WeakNode) => n.total_attempt === 0 ? -1 : (n.wrong_count / n.total_attempt) * 100;
      return getRate(b) - getRate(a);
    });
  }, [data?.weak_nodes]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getMyWeaknesses(courseId);
      if (isMounted.current) {
        setData(res.data);
        setError("");
      }
    } catch (e: any) {
      if (isMounted.current) {
        setError(e?.response?.data?.message || "Không thể tải dữ liệu điểm yếu.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [courseId]);

  useEffect(() => {
    isMounted.current = true;
    load();
    return () => {
      isMounted.current = false;
    };
  }, [load]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-1/3 bg-slate-200 dark:bg-[#0D192E] rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-slate-100 dark:bg-[#0D192E]/60 rounded-xl"></div>
          <div className="h-16 bg-slate-100 dark:bg-[#0D192E]/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // hide entirely if there's no data / error
  }

  if (!data.weak_nodes || data.weak_nodes.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <TrendingDown className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">Không có điểm yếu!</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tuyệt vời! Bạn đang làm chủ kiến thức rất tốt.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
      {/* Header */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-400/8 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 leading-tight">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Điểm yếu của tôi
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
            AI phân tích lỗi sai của bạn theo từng chủ đề
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900 dark:text-slate-50 leading-none">
            {formatPercent(data.total_wrong_percent)}%
          </div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
            Sai sót chung
          </div>
        </div>
      </div>

      {/* Nodes list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-450/10">
        {sortedNodes.slice(0, visibleCount).map((node) => {
          const colorClass = LEVEL_COLORS[node.mastery_level] || LEVEL_COLORS["TB"];
          const errorRate = node.total_attempt === 0 ? NaN : (node.wrong_count / node.total_attempt) * 100;


          return (
            <div key={node.node_id} className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 dark:hover:bg-[#162644] transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-base">
                    {node.node_name}
                  </h4>
                  <span className={cn("text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border", colorClass)}>
                    {node.status_level}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{node.wrong_count}</strong> {node.total_attempt === 0 ? "lỗi (Chưa kiểm tra)" : "lỗi sai"}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{isNaN(errorRate) ? "Chưa có TT" : `${formatPercent(errorRate)}%`}</strong> {isNaN(errorRate) ? "" : "tỷ lệ sai"}
                  </span>

                </div>
              </div>


            </div>
          );
        })}
      </div>

      {/* Load more button */}
      {sortedNodes.length > visibleCount && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 5)}
          className="w-full py-3.5 text-sm font-bold text-blue-600 dark:text-cyan-400 bg-slate-50/30 dark:bg-[#0F1E35]/30 hover:bg-slate-100/50 dark:hover:bg-[#162644]/50 border-t border-slate-100/80 dark:border-slate-450/10 flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.99] cursor-pointer"
        >
          Xem thêm ({sortedNodes.length - visibleCount} chủ đề)
        </button>
      )}


    </div>
  );
}
