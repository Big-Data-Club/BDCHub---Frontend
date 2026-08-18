import { Calendar, Clock, Eye, Play, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { QuizAttempt } from "@/hooks/lms/student/useQuizHistory";

interface QuizAttemptListProps {
  attempts: QuizAttempt[];
  courseId: number;
  quizId: number;
  onNavigateToResult: (attemptId: number) => void;
  onNavigateToTake: (startNew?: boolean) => void;
}

export function QuizAttemptList({
  attempts,
  onNavigateToResult,
  onNavigateToTake,
}: QuizAttemptListProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getStatusBadge = (attempt: QuizAttempt) => {
    if (attempt.status === "IN_PROGRESS") {
      return (
        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-cyan-400 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-500/20">
          Đang làm
        </span>
      );
    }

    const totalGraded = attempt.correct_answers + (attempt.answered_questions - attempt.correct_answers);
    const hasUngradedQuestions = attempt.answered_questions > totalGraded;

    if (hasUngradedQuestions || attempt.earned_points === null) {
      return (
        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-semibold flex items-center gap-1 border border-amber-200 dark:border-amber-500/20">
          <AlertCircle className="w-3 h-3" />
          Điểm tạm thời
        </span>
      );
    }

    if (attempt.is_passed === true) {
      return (
        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1 border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          Đạt
        </span>
      );
    }

    if (attempt.is_passed === false) {
      return (
        <span className="px-3 py-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold flex items-center gap-1 border border-red-200 dark:border-red-500/20">
          <XCircle className="w-3 h-3" />
          Chưa đạt
        </span>
      );
    }

    return (
      <span className="px-3 py-1 bg-slate-100 dark:bg-[#0D192E] text-slate-600 dark:text-slate-400 rounded-full text-xs font-semibold">
        Chưa chấm
      </span>
    );
  };

  const getScoreDisplay = (attempt: QuizAttempt) => {
    const hasUngradedQuestions =
      attempt.answered_questions > attempt.correct_answers + (attempt.answered_questions - attempt.correct_answers);

    if (attempt.earned_points !== null) {
      return (
        <div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
            {attempt.earned_points.toFixed(1)}/{attempt.quiz_total_points}
          </p>
          {attempt.percentage !== null && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hasUngradedQuestions ? "(Tạm thời) " : ""}
              {attempt.percentage.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }

    return (
      <div>
        <p className="text-xl font-extrabold text-slate-400 dark:text-slate-600">--/--</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Chưa có điểm</p>
      </div>
    );
  };

  if (attempts.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F1E35] rounded-2xl shadow-sm border border-slate-200 dark:border-blue-500/10 p-12 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Chưa có lần làm bài nào
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Bạn chưa làm bài quiz này. Hãy bắt đầu lần làm đầu tiên!
        </p>
        <button
          onClick={() => onNavigateToTake(false)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-md"
        >
          <Play className="w-4 h-4" />
          Bắt đầu làm bài
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt) => (
        <div
          key={attempt.id}
          className="bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/10 p-5 shadow-sm hover:shadow-md hover:border-blue-500/25 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  Lần làm #{attempt.attempt_number}
                </h3>
                {getStatusBadge(attempt)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Bắt đầu</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(attempt.started_at)}
                    </p>
                  </div>
                </div>

                {attempt.submitted_at && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Thời gian làm</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formatDuration(attempt.time_spent_seconds)}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Điểm số</p>
                  {getScoreDisplay(attempt)}
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap text-xs text-slate-600 dark:text-slate-400">
                <span>
                  Đã trả lời:{" "}
                  <strong className="text-slate-900 dark:text-slate-100">
                    {attempt.answered_questions}
                  </strong>{" "}
                  câu
                </span>
                <span>
                  Đúng:{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {attempt.correct_answers}
                  </strong>
                </span>
                {attempt.passing_score !== null && (
                  <span>
                    Chuẩn đầu ra:{" "}
                    <strong className="text-slate-900 dark:text-slate-100">
                      {attempt.passing_score.toFixed(0)}%
                    </strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              {attempt.status !== "IN_PROGRESS" ? (
                <button
                  onClick={() => onNavigateToResult(attempt.id)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-[#0D192E] border border-slate-200 dark:border-blue-500/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162644] rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết
                </button>
              ) : (
                <button
                  onClick={() => onNavigateToTake(false)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  Tiếp tục
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
