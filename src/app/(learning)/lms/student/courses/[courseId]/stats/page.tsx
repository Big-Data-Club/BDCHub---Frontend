"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { HelpCircle, CheckCircle2, AlertCircle, Lock, BookOpen, Award, Target, BarChart2 } from "lucide-react";
import dynamic from "next/dynamic";

import analyticsService, { StudentQuizScore } from "@/services/lms/analyticsService";
import { useStudentCourse } from "@/components/lms/student/StudentCourseContext";
import { StatCard, ProgressBar } from "@/components/lms/shared";
import { cn } from "@/lib/utils";

const WeaknessTracker = dynamic(
  () => import("@/components/lms/student/WeaknessTracker").then((m) => m.WeaknessTracker),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-6 animate-pulse" />
    ),
  }
);

// ─── Progress Item Row ────────────────────────────────────────────────────────

function ProgressItemRow({
  item,
  onMarkComplete,
}: {
  item: { content_id: number; content_title: string; section_title: string; is_mandatory: boolean; is_completed: boolean };
  onMarkComplete: (id: number) => Promise<void>;
}) {
  const [marking, setMarking] = useState(false);

  const handleMark = async () => {
    setMarking(true);
    try {
      await onMarkComplete(item.content_id);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border",
        item.is_completed
          ? "bg-emerald-50/20 dark:bg-[#0F1E35] border-emerald-200/50 dark:border-emerald-500/20"
          : "bg-white dark:bg-[#0F1E35] border-slate-200 dark:border-blue-500/10 hover:border-slate-300 dark:hover:border-blue-500/25"
      )}
    >
      <div className="flex-shrink-0">
        {item.is_completed ? (
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
        ) : item.is_mandatory ? (
          <Lock className="w-4.5 h-4.5 text-orange-400" />
        ) : (
          <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.content_title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.section_title}</p>
      </div>
      {item.is_mandatory && !item.is_completed && (
        <button
          onClick={handleMark}
          disabled={marking}
          className={cn(
            "flex-shrink-0 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-xs",
            marking
              ? "bg-slate-100 dark:bg-[#0D192E] text-slate-400 dark:text-slate-500 cursor-not-allowed"
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
  not_started: { label: "Chưa làm", cls: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" },
  in_progress: {
    label: "Đang làm",
    cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
  },
  submitted: {
    label: "Đã nộp",
    cls: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
  },
  passed: {
    label: "Đã đạt",
    cls: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
  },
  failed: {
    label: "Chưa đạt",
    cls: "bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20",
  },
};

type StatusKey = "not_started" | "in_progress" | "submitted" | "passed" | "failed";

function QuizScoreCard({ score, courseId }: { score: StudentQuizScore; courseId: number }) {
  const router = useRouter();
  const statusKey = (score.status || "not_started") as StatusKey;
  const cfg = STATUS_CFG[statusKey] ?? STATUS_CFG.not_started;
  const pct = score.best_percentage ?? 0;

  return (
    <div
      className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/30 dark:hover:border-cyan-500/35 transition-all duration-300 cursor-pointer group"
      onClick={() => router.push(`/lms/student/courses/${courseId}/quiz/${score.quiz_id}/history`)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate flex-1">{score.quiz_title}</p>
        <span className={cn("flex-shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider", cfg.cls)}>
          {cfg.label}
        </span>
      </div>
      {score.status !== "not_started" && (
        <>
          <ProgressBar value={pct} max={100} showPercent={false} color={score.status === "passed" ? "green" : score.status === "failed" ? "orange" : "blue"} />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
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

  const { sectionContents, completedIds, handleMarkComplete, progress, progressDetail } = useStudentCourse();

  const [quizScores, setQuizScores] = useState<StudentQuizScore[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

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

  const totalMandatory =
    progress?.total_mandatory ?? Object.values(sectionContents).flat().filter((c) => c.is_mandatory).length;
  const completedCount = progress?.completed_count ?? completedIds.size;
  const progressPct = totalMandatory > 0 ? Math.round((completedCount / totalMandatory) * 100) : 0;

  const passedQuizzes = quizScores.filter((q) => q.is_passed).length;
  const avgPct =
    quizScores.length > 0 ? quizScores.reduce((s, q) => s + (q.best_percentage ?? 0), 0) / quizScores.length : null;

  const mandatory = progressDetail.filter((i) => i.is_mandatory);
  const pending = mandatory.filter((i) => !i.is_completed);
  const done = mandatory.filter((i) => i.is_completed);
  const displayed = [...pending, ...done].slice(0, 8);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">Thống kê của tôi</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
          Tổng quan tiến độ và kết quả học tập trong khóa học này
        </p>
      </div>

      {/* KPI Cards using shared StatCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tiến độ"
          value={`${progressPct}%`}
          sub={`${completedCount}/${totalMandatory} bài`}
          icon={<BookOpen className="w-5 h-5" />}
          accent="blue"
          progress={progressPct}
          variant="progress"
        />
        <StatCard
          label="Bài bắt buộc xong"
          value={String(completedCount)}
          sub={totalMandatory > 0 ? `trong ${totalMandatory} bài` : "Không có bài"}
          icon={<Target className="w-5 h-5" />}
          accent="green"
          progress={totalMandatory > 0 ? (completedCount / totalMandatory) * 100 : 0}
          variant="progress"
        />
        <StatCard
          label="Quiz đã đạt"
          value={quizScores.length > 0 ? `${passedQuizzes}/${quizScores.length}` : "-"}
          sub={quizScores.length > 0 ? `${((passedQuizzes / quizScores.length) * 100).toFixed(0)}% tỷ lệ` : "Chưa có quiz"}
          icon={<Award className="w-5 h-5" />}
          accent="purple"
          progress={quizScores.length > 0 ? (passedQuizzes / quizScores.length) * 100 : 0}
          variant="progress"
        />
        <StatCard
          label="Điểm TB quiz"
          value={avgPct != null ? `${avgPct.toFixed(1)}%` : "-"}
          sub={avgPct != null ? (avgPct >= 70 ? "Tốt" : "Cần cải thiện") : "Chưa làm quiz"}
          icon={<BarChart2 className="w-5 h-5" />}
          accent={avgPct != null && avgPct >= 70 ? "orange" : "red"}
          progress={avgPct ?? 0}
          variant="progress"
        />
      </div>

      {/* Progress Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">Tiến độ học tập</h3>
          {pending.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              {pending.length} bài còn lại
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-6 shadow-sm dark:shadow-none mb-4">
          <ProgressBar value={completedCount} max={totalMandatory} label="Tổng quan hoàn thành" />
          {progressPct === 100 && totalMandatory > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Hoàn thành tất cả nội dung bắt buộc!
            </p>
          )}
        </div>

        {progressDetail.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">Không có dữ liệu tiến độ.</p>
        ) : (
          <div className="space-y-2">
            {displayed.map((item) => (
              <ProgressItemRow key={item.content_id} item={item} onMarkComplete={handleMarkComplete} />
            ))}
            {mandatory.length > 8 && (
              <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2 font-medium">
                +{mandatory.length - 8} nội dung khác
              </p>
            )}
          </div>
        )}
      </section>

      {/* Quiz Scores Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 leading-tight">Kết quả Quiz</h3>
        {statsLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-[#0D192E]/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : quizScores.length === 0 ? (
          <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-8 text-center">
            <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có quiz nào trong khóa học.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quizScores.map((score) => (
              <QuizScoreCard key={score.quiz_id} score={score} courseId={id} />
            ))}
          </div>
        )}
      </section>

      <WeaknessTracker courseId={id} />
    </div>
  );
}
