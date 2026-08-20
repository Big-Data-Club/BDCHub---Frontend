"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Target,
  TrendingUp,
  Award,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface SkillState {
  skill_id: number;
  skill_name: string;
  mastery_level: string;
  mastery_percentage: number;
  progress_indicator: string;
  next_action: string;
  last_practiced?: string;
}

interface SkillsOverviewResponse {
  student_id: number;
  total_skills: number;
  struggling_count: number;
  developing_count: number;
  advancing_count: number;
  mastered_count: number;
  overall_progress_percentage: number;
  skills: SkillState[];
}

interface Props {
  studentId: number;
}

const MASTERY_CONFIG = {
  struggling: {
    label: "Cần cải thiện",
    color: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
    icon: AlertTriangle,
    barColor: "bg-red-500 dark:bg-red-450",
  },
  developing: {
    label: "Đang phát triển",
    color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    icon: TrendingUp,
    barColor: "bg-amber-500 dark:bg-amber-450",
  },
  advancing: {
    label: "Khá tốt",
    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    icon: Target,
    barColor: "bg-blue-500 dark:bg-cyan-500",
  },
  mastered: {
    label: "Thành thạo",
    color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    icon: Award,
    barColor: "bg-emerald-500 dark:bg-emerald-450",
  },
};

export function SkillMasteryOverview({ studentId }: Props) {
  const [data, setData] = useState<SkillsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const isMounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lms/personalized-learning/students/${studentId}/skills/overview`);
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu kỹ năng");
      }
      const result = await response.json();
      if (isMounted.current) {
        setData(result.data);
        setError("");
      }
    } catch (e: any) {
      if (isMounted.current) {
        setError(e?.message || "Không thể tải dữ liệu kỹ năng");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [studentId]);

  useEffect(() => {
    isMounted.current = true;
    load();
    return () => {
      isMounted.current = false;
    };
  }, [load]);

  const sortedSkills = useMemo(() => {
    if (!data?.skills) return [];
    // Sort by mastery level priority: struggling > developing > advancing > mastered
    const levelOrder = { struggling: 0, developing: 1, advancing: 2, mastered: 3 };
    return [...data.skills].sort((a, b) => {
      const orderA = levelOrder[a.mastery_level as keyof typeof levelOrder] ?? 999;
      const orderB = levelOrder[b.mastery_level as keyof typeof levelOrder] ?? 999;
      return orderA - orderB;
    });
  }, [data?.skills]);

  const displayedSkills = expanded ? sortedSkills : sortedSkills.slice(0, 5);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-1/3 bg-slate-200 dark:bg-[#0D192E] rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-slate-100 dark:bg-[#0D192E]/60 rounded-xl"></div>
          <div className="h-20 bg-slate-100 dark:bg-[#0D192E]/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  if (!data.skills || data.skills.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">
          Bắt đầu hành trình học tập!
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hoàn thành bài học đầu tiên để theo dõi tiến độ kỹ năng của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
      {/* Header */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-400/8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 leading-tight">
              <Target className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              Kỹ năng của tôi
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              Theo dõi tiến độ thành thạo từng kỹ năng
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-50 leading-none">
              {Math.round(data.overall_progress_percentage)}%
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
              Tổng thể
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/30 dark:border-red-500/10">
            <div className="text-lg font-black text-red-600 dark:text-red-400">{data.struggling_count}</div>
            <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cần cải thiện
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/30 dark:border-amber-500/10">
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">{data.developing_count}</div>
            <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Đang PT
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-500/10">
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">{data.advancing_count}</div>
            <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Khá tốt
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-500/10">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{data.mastered_count}</div>
            <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Thành thạo
            </div>
          </div>
        </div>
      </div>

      {/* Skills list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-450/10">
        {displayedSkills.map((skill) => {
          const config = MASTERY_CONFIG[skill.mastery_level as keyof typeof MASTERY_CONFIG] || MASTERY_CONFIG.developing;
          const MasteryIcon = config.icon;

          return (
            <div key={skill.skill_id} className="p-5 hover:bg-slate-50 dark:hover:bg-[#162644] transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <MasteryIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-base">
                    {skill.skill_name}
                  </h4>
                </div>
                <span
                  className={cn(
                    "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border flex-shrink-0",
                    config.color
                  )}
                >
                  {config.label}
                </span>
              </div>

              {/* Progress bar */}
              <TooltipProvider delayDuration={55}>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div className="h-2 bg-slate-200 dark:bg-[#0D192E] rounded-full overflow-hidden mb-2 cursor-pointer group/progress">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500 group-hover/progress:brightness-110",
                          config.barColor
                        )}
                        style={{ width: `${skill.mastery_percentage}%` }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-white rounded-xl shadow-lg px-3 py-1.5 text-xs font-semibold">
                    {skill.progress_indicator}
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{skill.next_action}</span>
                <span className="text-slate-900 dark:text-slate-50 font-bold">
                  {Math.round(skill.mastery_percentage)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand/Collapse button */}
      {sortedSkills.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3.5 text-sm font-bold text-blue-600 dark:text-cyan-400 bg-slate-50/30 dark:bg-[#0F1E35]/30 hover:bg-slate-100/50 dark:hover:bg-[#162644]/50 border-t border-slate-100/80 dark:border-slate-450/10 flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.99] cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Thu gọn
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Xem thêm ({sortedSkills.length - 5} kỹ năng)
            </>
          )}
        </button>
      )}
    </div>
  );
}
