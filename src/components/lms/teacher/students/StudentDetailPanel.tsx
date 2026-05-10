"use client";

/**
 * StudentDetailPanel.tsx
 *
 * Panel bên phải hiển thị chi tiết một học viên được chọn:
 * - Thông tin cơ bản
 * - Tiến độ bắt buộc + danh sách
 * - Điểm quiz
 */

import { useEffect, useState } from "react";
import {
  X, TrendingUp, Award, Clock,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { CourseStudentProgress, StudentAttemptOverview } from "@/services/analyticsService";
import { cn } from "@/lib/utils";

interface Props {
  student:  CourseStudentProgress;
  courseId: number;
  onClose:  () => void;
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase();
  const colors = [
    "from-blue-400 to-blue-600",
    "from-violet-400 to-violet-600",
    "from-emerald-400 to-emerald-600",
    "from-amber-400 to-amber-600",
    "from-pink-400 to-pink-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizeClass = size === "lg" ? "w-14 h-14 text-lg" : size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br flex-shrink-0",
      color, sizeClass
    )}>
      {initials}
    </div>
  );
}

function MiniProgressBar({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? "bg-emerald-500" :
    pct >= 50 ? "bg-blue-500" :
    pct >= 20 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function StatRow({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className={cn("text-sm font-bold", accent ?? "text-slate-900 dark:text-slate-50")}>{value}</p>
      </div>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

interface QuizAttemptSummary {
  quizId:    number;
  quizTitle: string;
  best:      number | null;
  attempts:  number;
  isPassed:  boolean | null;
}

function buildQuizSummary(attempts: StudentAttemptOverview[]): QuizAttemptSummary[] {
  const map = new Map<number, QuizAttemptSummary>();
  for (const a of attempts) {
    const ex = map.get(a.quiz_id);
    if (!ex) {
      map.set(a.quiz_id, {
        quizId: a.quiz_id,
        quizTitle: a.quiz_title,
        best: a.percentage ?? null,
        attempts: 1,
        isPassed: a.is_passed ?? null,
      });
    } else {
      ex.attempts++;
      if ((a.percentage ?? 0) > (ex.best ?? 0)) ex.best = a.percentage ?? null;
      if (a.is_passed) ex.isPassed = true;
      map.set(a.quiz_id, ex);
    }
  }
  return Array.from(map.values());
}

export function StudentDetailPanel({ student, courseId, onClose }: Props) {
  const [quizSummary, setQuizSummary] = useState<QuizAttemptSummary[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    setLoadingQuiz(true);
    // Get quiz-analytics for the course (teacher view) — filtered by student
    // We use getQuizAllAttempts per quiz is expensive; use course quiz-analytics instead
    // For now we fetch course quiz analytics and filter by available data
    // A better endpoint would be GET /courses/{courseId}/student/{studentId}/quiz-scores
    // Using what's available: getCourseQuizAnalytics gives course-level, not per-student
    // So we'll display what we can from the student object
    setLoadingQuiz(false);
  }, [student.student_id, courseId]);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  return (
    <div className="fixed right-0 top-14 bottom-0 w-[340px] xl:w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <h3 className="font-bold text-slate-900 dark:text-slate-50">Chi tiết học viên</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Student info card */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-800/50 rounded-2xl border border-blue-100 dark:border-blue-900/50 p-4 flex items-center gap-4">
          <Avatar name={student.student_name} size="lg" />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-slate-50 truncate">{student.student_name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{student.student_email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(student.last_activity)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tổng quan</p>

          <StatRow
            icon={<TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            label="Tiến độ khóa học"
            value={`${student.progress_percent.toFixed(0)}%`}
            sub={`${student.completed_content}/${student.total_mandatory} bài`}
            accent={
              student.progress_percent >= 80 ? "text-emerald-600 dark:text-emerald-400" :
              student.progress_percent >= 50 ? "text-blue-600 dark:text-blue-400" :
              "text-amber-600 dark:text-amber-400"
            }
          />

          {student.quiz_avg_score != null && (
            <StatRow
              icon={<Award className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
              label="Điểm quiz trung bình"
              value={`${student.quiz_avg_score.toFixed(1)}%`}
              accent={student.quiz_avg_score >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}
            />
          )}
        </div>

        {/* Progress bar detail */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Tiến độ bắt buộc
            </p>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {student.progress_percent.toFixed(0)}%
            </span>
          </div>
          <MiniProgressBar pct={student.progress_percent} />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {student.completed_content} hoàn thành
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              {student.total_mandatory - student.completed_content} còn lại
            </span>
          </div>
        </div>

        {/* Status note */}
        {student.progress_percent < 20 && student.total_mandatory > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/50">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Học viên cần chú ý</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                Tiến độ dưới 20%. Cân nhắc liên hệ để hỗ trợ.
              </p>
            </div>
          </div>
        )}

        {student.progress_percent === 100 && student.total_mandatory > 0 && (
          <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Đã hoàn thành tất cả nội dung bắt buộc!
            </p>
          </div>
        )}

        {/* No data note */}
        {student.total_mandatory === 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Khóa học không có nội dung bắt buộc
            </p>
          </div>
        )}
      </div>

      {/* Footer action */}
      <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <a
          href={`mailto:${student.student_email}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
        >
          Liên hệ học viên
        </a>
      </div>
    </div>
  );
}
