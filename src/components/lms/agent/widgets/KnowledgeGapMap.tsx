"use client";

/**
 * KnowledgeGapMap - visualizes student knowledge weaknesses.
 * Shows mastery bars and prerequisite chains.
 */
import { cn } from "@/lib/utils";

interface Gap {
  name: string;
  mastery: number;
  wrong_count?: number;
}

interface Prerequisite {
  weak_node: string;
  related_concepts: string[];
}

interface KnowledgeGapMapProps {
  props: {
    gaps: Gap[];
    prerequisites?: Prerequisite[];
    message?: string;
  };
}

function masteryColor(m: number): string {
  if (m >= 0.7) return "bg-green-500";
  if (m >= 0.4) return "bg-yellow-500";
  return "bg-red-500";
}

export function KnowledgeGapMap({ props }: KnowledgeGapMapProps) {
  const { gaps, prerequisites, message } = props;

  if (!gaps || gaps.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-500">
        {message || "Chưa có dữ liệu phân tích."}
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-2">
      <div className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
        Phân tích Lỗ hổng Kiến thức
      </div>

      {/* Mastery bars */}
      <div className="space-y-2">
        {gaps.map((g, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-white dark:bg-[#0F1E35] border border-slate-200/80 dark:border-blue-500/15 shadow-xs dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {g.name}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
                {Math.round(g.mastery * 100)}%
                {g.wrong_count !== undefined && (
                  <span className="text-rose-500 dark:text-rose-400 ml-1">({g.wrong_count} sai)</span>
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#070E1C] rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", masteryColor(g.mastery))}
                style={{ width: `${Math.max(g.mastery * 100, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Prerequisite chains */}
      {prerequisites && prerequisites.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Chuỗi tiên quyết cần ôn lại:
          </div>
          {prerequisites.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-350"
            >
              <span className="font-semibold text-rose-500 dark:text-rose-400">{p.weak_node}</span>
              <span className="text-slate-300 dark:text-slate-600">←</span>
              <span className="font-medium">{p.related_concepts.join(", ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
