"use client";

/**
 * StatsHeroCards.tsx
 * Top KPI summary cards: tiến độ %, quiz đã qua, điểm trung bình
 */

import { TrendingUp, CheckCircle2, Award, BookOpen } from "lucide-react";
import { CourseProgress } from "@/services/progressService";
import { cn } from "@/lib/utils";

interface Props {
  progress:      CourseProgress | null;
  passedQuizzes: number;
  totalQuizzes:  number;
  avgPct:        number | null;
}

interface KpiCardProps {
  icon:      React.ReactNode;
  iconColor: string;
  iconBg:    string;
  label:     string;
  value:     string;
  sub?:      string;
  accent?:   string; // progress bar fill color class
  pct?:      number; // 0–100
}

function KpiCard({ icon, iconColor, iconBg, label, value, sub, accent, pct }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <span className={cn("w-5 h-5", iconColor)}>{icon}</span>
        </div>
        {pct !== undefined && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {pct.toFixed(0)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
          {value}
        </p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {accent && pct !== undefined && (
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", accent)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function StatsHeroCards({ progress, passedQuizzes, totalQuizzes, avgPct }: Props) {
  const progressPct = progress?.progress_percent ?? 0;
  const completedCount = progress?.completed_count ?? 0;
  const totalMandatory = progress?.total_mandatory ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tiến độ tổng thể */}
      <KpiCard
        icon={<TrendingUp className="w-5 h-5" />}
        iconColor="text-blue-600 dark:text-blue-400"
        iconBg="bg-blue-50 dark:bg-blue-950/30"
        label="Tiến độ khóa học"
        value={`${progressPct.toFixed(0)}%`}
        sub={`${completedCount}/${totalMandatory} bài bắt buộc`}
        accent="bg-blue-500"
        pct={progressPct}
      />

      {/* Bài bắt buộc đã xong */}
      <KpiCard
        icon={<CheckCircle2 className="w-5 h-5" />}
        iconColor="text-emerald-600 dark:text-emerald-400"
        iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        label="Bài bắt buộc xong"
        value={`${completedCount}`}
        sub={totalMandatory > 0 ? `trong ${totalMandatory} bài` : "Không có bài bắt buộc"}
        accent="bg-emerald-500"
        pct={totalMandatory > 0 ? (completedCount / totalMandatory) * 100 : 0}
      />

      {/* Quiz đã qua */}
      <KpiCard
        icon={<Award className="w-5 h-5" />}
        iconColor="text-violet-600 dark:text-violet-400"
        iconBg="bg-violet-50 dark:bg-violet-950/30"
        label="Quiz đã đạt"
        value={totalQuizzes > 0 ? `${passedQuizzes}/${totalQuizzes}` : "—"}
        sub={
          totalQuizzes > 0
            ? `${((passedQuizzes / totalQuizzes) * 100).toFixed(0)}% tỷ lệ đạt`
            : "Chưa có quiz"
        }
        accent="bg-violet-500"
        pct={totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0}
      />

      {/* Điểm trung bình */}
      <KpiCard
        icon={<BookOpen className="w-5 h-5" />}
        iconColor="text-amber-600 dark:text-amber-400"
        iconBg="bg-amber-50 dark:bg-amber-950/30"
        label="Điểm TB quiz"
        value={avgPct !== null ? `${avgPct.toFixed(1)}%` : "—"}
        sub={avgPct !== null ? (avgPct >= 70 ? "Trên mức trung bình" : "Cần cải thiện") : "Chưa làm quiz"}
        accent={avgPct !== null ? (avgPct >= 70 ? "bg-amber-500" : "bg-red-400") : "bg-slate-300"}
        pct={avgPct ?? 0}
      />
    </div>
  );
}