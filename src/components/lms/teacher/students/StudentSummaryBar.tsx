"use client";

/**
 * StudentSummaryBar.tsx
 * Thanh tổng hợp: số học viên, tiến độ TB, % đã qua 50%
 */

import { Users, TrendingUp, Award, AlertTriangle } from "lucide-react";
import { CourseStudentProgress } from "@/services/analyticsService";

interface Props {
  students: CourseStudentProgress[];
}

export function StudentSummaryBar({ students }: Props) {
  const total       = students.length;
  const avgProgress = total > 0
    ? students.reduce((s, st) => s + st.progress_percent, 0) / total
    : 0;
  const above50     = students.filter(s => s.progress_percent >= 50).length;
  const atRisk      = students.filter(s => s.progress_percent < 20 && s.total_mandatory > 0).length;
  const avgQuiz     = (() => {
    const withQuiz = students.filter(s => s.quiz_avg_score != null);
    if (!withQuiz.length) return null;
    return withQuiz.reduce((s, st) => s + (st.quiz_avg_score ?? 0), 0) / withQuiz.length;
  })();

  const cards = [
    {
      icon: <Users className="w-5 h-5" />,
      iconBg: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      label: "Tổng học viên",
      value: `${total}`,
      sub: "đã đăng ký",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      label: "Tiến độ trung bình",
      value: `${avgProgress.toFixed(0)}%`,
      sub: `${above50}/${total} học viên ≥50%`,
    },
    {
      icon: <Award className="w-5 h-5" />,
      iconBg: "bg-violet-50 dark:bg-violet-950/30",
      iconColor: "text-violet-600 dark:text-violet-400",
      label: "Điểm quiz TB",
      value: avgQuiz != null ? `${avgQuiz.toFixed(1)}%` : "—",
      sub: avgQuiz != null ? (avgQuiz >= 70 ? "Tốt" : "Cần chú ý") : "Chưa có dữ liệu",
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      iconBg: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      label: "Học viên cần chú ý",
      value: `${atRisk}`,
      sub: "tiến độ <20%",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
            <span className={card.iconColor}>{card.icon}</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.label}</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">{card.value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
