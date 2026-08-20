"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Target,
  Brain,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import personalizedLearningService, { DailyRecommendationsResponse } from "@/services/lms/personalizedLearningService";

interface Props {
  studentId: string | number;
  onNavigateToLesson?: (lessonId: number) => void;
}

const PRIORITY_CONFIG = {
  1: {
    label: "Ưu tiên cao",
    color: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
    icon: AlertCircle,
  },
  2: {
    label: "Quan trọng",
    color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    icon: Target,
  },
  3: {
    label: "Gợi ý",
    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    icon: Zap,
  },
};

export function PersonalizedLearningDashboard({ studentId, onNavigateToLesson }: Props) {
  const [data, setData] = useState<DailyRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isMounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await personalizedLearningService.getDailyRecommendations(studentId);
      if (isMounted.current) {
        setData(result.data.data);
        setError("");
      }
    } catch (e: any) {
      if (isMounted.current) {
        setError(e?.message || "Không thể tải dữ liệu gợi ý");
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-1/3 bg-slate-200 dark:bg-[#0D192E] rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-24 bg-slate-100 dark:bg-[#0D192E]/60 rounded-xl"></div>
          <div className="h-24 bg-slate-100 dark:bg-[#0D192E]/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  if (!data.priority_recommendations || data.priority_recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">
          Bạn đã hoàn thành mục tiêu hôm nay!
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tuyệt vời! Hãy nghỉ ngơi hoặc khám phá thêm nội dung mới.
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
            <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            Gợi ý học tập hôm nay
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
            {data.motivational_message}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900 dark:text-slate-50 leading-none">
            {data.priority_recommendations.reduce((total, recommendation) => total + recommendation.estimated_minutes, 0)}
          </div>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Phút
          </div>
        </div>
      </div>

      {/* Recommendations list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-450/10">
        {data.priority_recommendations.map((rec, index) => {
          const priorityConfig = PRIORITY_CONFIG[rec.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG[3];
          const PriorityIcon = priorityConfig.icon;

          return (
            <div
              key={rec.content_id}
              className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 dark:hover:bg-[#162644] transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-black text-sm border border-blue-200/50 dark:border-cyan-500/20">
                    {index + 1}
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-base flex-1">
                    {rec.content_title}
                  </h4>
                  <span
                    className={cn(
                      "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border flex items-center gap-1",
                      priorityConfig.color
                    )}
                  >
                    <PriorityIcon className="w-3 h-3" />
                    {priorityConfig.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-2">
                  {rec.skill_name}
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{rec.reason}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{rec.estimated_minutes}</strong> phút
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span className="px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 font-semibold">{rec.skill_name}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => onNavigateToLesson?.(rec.content_id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border bg-blue-600 hover:bg-blue-700 text-white active:scale-95 duration-200 shadow-xs transition-all cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <ChevronRight className="w-4 h-4" />
                  Học ngay
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
