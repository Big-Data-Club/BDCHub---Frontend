"use client";

/**
 * Student Course — Stats Page
 * Route: /lms/student/courses/[courseId]/stats
 *
 * Displays:
 *  1. KPI cards (progress, mandatory, quiz pass rate, avg score)
 *  2. Progress detail list with mark-complete
 *  3. Quiz scores
 *  4. Weakness tracker (AI-powered)
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  HelpCircle, CheckCircle2, AlertCircle, Lock,
} from "lucide-react";

import analyticsService, { StudentQuizScore } from "@/services/analyticsService";

import { useStudentCourse } from "@/components/lms/student/StudentCourseContext";
import { WeaknessTracker } from "@/components/lms/student/WeaknessTracker";
import { cn } from "@/lib/utils";

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, accent, pct,
}: {
  label: string; value: string; sub?: string; accent: string; pct?: number;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
      {pct !== undefined && (
        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-700", accent)} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── Progress Item Row ────────────────────────────────────────────────────────

function ProgressItemRow({
  item, onMarkComplete,
}: {
  item: { content_id: number; content_title: string; section_title: string; is_mandatory: boolean; is_completed: boolean };
  onMarkComplete: (id: number) => Promise<void>;
}) {
  const [marking, setMarking] = useState(false);

  const handleMark = async () => {
    setMarking(true);
    try { await onMarkComplete(item.content_id); } finally { setMarking(false); }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
      item.is_completed
        ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50"
        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
    )}>
      <div className="flex-shrink-0">
        {item.is_completed
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          : item.is_mandatory
            ? <Lock className="w-4 h-4 text-orange-400" />
            : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.content_title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{item.section_title}</p>
      </div>
      {item.is_mandatory && !item.is_completed && (
        <button
          onClick={handleMark}
          disabled={marking}
          className={cn(
            "flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95",
            marking
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          )}
        >
          {marking ? "Đang lưu..." : "Đánh dấu xong"}
        </button>
      )}
    </div>
  );
}

// ─── Quiz Score Card ──────────────────────────────────────────────────────────

const STATUS_CFG = {
  not_started: { label: "Chưa làm",  cls: "bg-slate-100 dark:bg-slate-800 text-slate-500" },
  in_progress: { label: "Đang làm",  cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" },
  submitted:   { label: "Đã nộp",    cls: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" },
  passed:      { label: "Đã đạt",    cls: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" },
  failed:      { label: "Chưa đạt",  cls: "bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400" },
};

function QuizScoreCard({ score, courseId }: { score: StudentQuizScore; courseId: number }) {
  const router = useRouter();
  const cfg    = STATUS_CFG[score.status] ?? STATUS_CFG.not_started;
  const pct    = score.best_percentage ?? 0;
  const barColor =
    score.status === "passed"  ? "bg-emerald-500" :
    score.status === "failed"  ? "bg-red-400"     :
    score.status === "not_started" ? "bg-slate-200 dark:bg-slate-700" : "bg-blue-400";

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
      onClick={() => router.push(`/lms/student/courses/${courseId}/quiz/${score.quiz_id}/history`)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate flex-1">{score.quiz_title}</p>
        <span className={cn("flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full", cfg.cls)}>
          {cfg.label}
        </span>
      </div>
      {score.status !== "not_started" && (
        <>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-10 text-right flex-shrink-0">
              {pct.toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {score.attempts_count} lần làm
            {score.passing_score != null && ` · Chuẩn: ${score.passing_score}%`}
          </p>
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  const {
    sectionContents,
    completedIds, handleMarkComplete,
    progress, progressDetail,
  } = useStudentCourse();

  // ── Quiz scores state ──
  const [quizScores,    setQuizScores]    = useState<StudentQuizScore[]>([]);
  const [statsLoading,  setStatsLoading]  = useState(true);

  // ── Load quiz scores ──
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await analyticsService.getMyQuizScores(id);
      setQuizScores(Array.isArray(res?.data) ? res.data : (res as any) ?? []);
    } catch {
      // fail silently
    } finally {
      setStatsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ── Derived progress numbers ──
  const totalMandatory = progress?.total_mandatory
    ?? Object.values(sectionContents).flat().filter(c => c.is_mandatory).length;
  const completedCount = progress?.completed_count ?? completedIds.size;
  const progressPct    = totalMandatory > 0 ? Math.round((completedCount / totalMandatory) * 100) : 0;

  const passedQuizzes = quizScores.filter(q => q.is_passed).length;
  const avgPct        = quizScores.length > 0
    ? quizScores.reduce((s, q) => s + (q.best_percentage ?? 0), 0) / quizScores.length
    : null;

  // ── Progress list (mandatory items) ──
  const mandatory = progressDetail.filter(i => i.is_mandatory);
  const pending   = mandatory.filter(i => !i.is_completed);
  const done      = mandatory.filter(i => i.is_completed);
  const displayed = [...pending, ...done].slice(0, 8);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl space-y-8">
      {/* Section title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Thống kê của tôi</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Tổng quan tiến độ và kết quả học tập trong khóa học này
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Tiến độ"
          value={`${progressPct}%`}
          sub={`${completedCount}/${totalMandatory} bài`}
          accent="bg-blue-500"
          pct={progressPct}
        />
        <KpiCard
          label="Bài bắt buộc xong"
          value={String(completedCount)}
          sub={totalMandatory > 0 ? `trong ${totalMandatory} bài` : "Không có bài bắt buộc"}
          accent="bg-emerald-500"
          pct={totalMandatory > 0 ? (completedCount / totalMandatory) * 100 : 0}
        />
        <KpiCard
          label="Quiz đã đạt"
          value={quizScores.length > 0 ? `${passedQuizzes}/${quizScores.length}` : "—"}
          sub={quizScores.length > 0 ? `${((passedQuizzes / quizScores.length) * 100).toFixed(0)}% tỷ lệ` : "Chưa có quiz"}
          accent="bg-violet-500"
          pct={quizScores.length > 0 ? (passedQuizzes / quizScores.length) * 100 : 0}
        />
        <KpiCard
          label="Điểm TB quiz"
          value={avgPct != null ? `${avgPct.toFixed(1)}%` : "—"}
          sub={avgPct != null ? (avgPct >= 70 ? "Tốt" : "Cần cải thiện") : "Chưa làm quiz"}
          accent={avgPct != null && avgPct >= 70 ? "bg-amber-400" : "bg-red-400"}
          pct={avgPct ?? 0}
        />
      </div>

      {/* Progress section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Tiến độ học tập</h3>
          {pending.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {pending.length} bài còn lại
            </span>
          )}
        </div>

        {/* Overall bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm mb-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">{progressPct}%</span>
            <span className="text-xs text-slate-500">{completedCount}/{totalMandatory} bài bắt buộc</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
          {progressPct === 100 && totalMandatory > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Hoàn thành tất cả nội dung bắt buộc!
            </p>
          )}
        </div>

        {/* Progress items */}
        {progressDetail.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">Không có dữ liệu tiến độ.</p>
        ) : (
          <div className="space-y-2">
            {displayed.map(item => (
              <ProgressItemRow key={item.content_id} item={item} onMarkComplete={handleMarkComplete} />
            ))}
            {mandatory.length > 8 && (
              <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                +{mandatory.length - 8} nội dung khác
              </p>
            )}
          </div>
        )}
      </section>

      {/* Quiz scores section */}
      <section>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-4">Kết quả Quiz</h3>
        {statsLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : quizScores.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
            <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có quiz nào trong khóa học.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quizScores.map(score => (
              <QuizScoreCard key={score.quiz_id} score={score} courseId={id} />
            ))}
          </div>
        )}
      </section>

      {/* Weakness Tracker */}
      <WeaknessTracker courseId={id} />
    </div>
  );
}
