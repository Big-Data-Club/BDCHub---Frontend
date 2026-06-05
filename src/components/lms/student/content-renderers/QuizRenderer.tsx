"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContentItem, StatPill, ActionButton } from "./utils";
import quizService from "@/services/quizService";
import { cn } from "@/lib/utils";

interface QuizData {
  id: number;
  title: string;
  total_points?: number;
  time_limit_minutes?: number;
  max_attempts?: number;
  passing_score?: number;
  available_from?: string;
  available_until?: string;
}

interface QuizRendererProps {
  content: ContentItem;
  userRole: string;
  courseId?: string;
  isCompleted: boolean;
  onComplete?: () => void;
}

export function QuizRenderer({
  content,
  userRole,
  courseId,
  isCompleted,
  onComplete,
}: QuizRendererProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasInProgress, setHasInProgress] = useState(false);

  const isTeacher = userRole === "TEACHER" || userRole === "ADMIN";
  const isStudent = userRole === "STUDENT";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    quizService.getQuizByContentId(content.id)
      .then(res => {
        if (cancelled) return;
        const q: QuizData = res?.data;
        setQuiz(q);

        if (q?.id && isStudent) {
          quizService.getMyQuizAttempts(q.id)
            .then(attRes => {
              if (cancelled) return;
              const inProg = (attRes?.data ?? []).some((a: any) => a.status === "IN_PROGRESS");
              setHasInProgress(inProg);
            })
            .catch(() => {});
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err?.response?.status === 404
            ? "Quiz chưa được tạo cho nội dung này."
            : "Không thể tải thông tin quiz.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [content.id, isStudent]);

  // ── Availability check ──
  const availability = (() => {
    if (!quiz) return null;
    const now = Date.now();
    if (quiz.available_from && now < new Date(quiz.available_from).getTime()) {
      return { ok: false, msg: `Quiz mở vào ${new Date(quiz.available_from).toLocaleString("vi-VN")}`, type: "upcoming" as const };
    }
    if (quiz.available_until && now > new Date(quiz.available_until).getTime()) {
      return { ok: false, msg: `Quiz đã đóng vào ${new Date(quiz.available_until).toLocaleString("vi-VN")}`, type: "expired" as const };
    }
    return { ok: true, type: "available" as const };
  })();

  const handleStart = () => {
    if (!quiz?.id) return;
    if (!availability?.ok) { alert(availability?.msg); return; }
    router.push(`/lms/student/courses/${courseId}/quiz/${quiz.id}/take?start=true`);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <span className="text-slate-600 dark:text-slate-400 text-sm">Đang tải thông tin quiz...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quiz info card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
            📝
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-50 mb-1">{content.title}</p>
            {content.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{content.description}</p>
            )}

            {/* Stats row */}
            {quiz && (
              <div className="flex flex-wrap gap-2">
                {quiz.total_points != null && (
                  <StatPill label="Tổng điểm" value={String(quiz.total_points)} />
                )}
                {quiz.time_limit_minutes != null && (
                  <StatPill label="Thời gian" value={`${quiz.time_limit_minutes} phút`} />
                )}
                {quiz.max_attempts != null && (
                  <StatPill label="Số lần làm" value={quiz.max_attempts > 0 ? `${quiz.max_attempts} lần` : "Không giới hạn"} />
                )}
                {quiz.passing_score != null && (
                  <StatPill label="Điểm đạt" value={`${quiz.passing_score}%`} />
                )}
              </div>
            )}

            {/* Date range */}
            {quiz && (quiz.available_from || quiz.available_until) && (
              <div className="flex flex-col gap-0.5 mt-3 text-xs text-slate-500 dark:text-slate-400">
                {quiz.available_from && (
                  <span>Mở từ: {new Date(quiz.available_from).toLocaleString("vi-VN")}</span>
                )}
                {quiz.available_until && (
                  <span>Đến: {new Date(quiz.available_until).toLocaleString("vi-VN")}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Availability notice */}
      {availability && !availability.ok && (
        <div className={cn(
          "p-3 rounded-xl border text-sm font-medium",
          availability.type === "expired"
            ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400"
            : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400"
        )}>
          {availability.msg}
        </div>
      )}

      {/* Teacher actions */}
      {isTeacher && (
        <div className="flex gap-3">
          {quiz?.id ? (
            <>
              <ActionButton
                onClick={() => router.push(`/lms/teacher/quiz/${quiz.id}/manage`)}
                label="Quản lý Quiz"
                variant="primary"
              />
              <ActionButton
                onClick={() => router.push(`/lms/teacher/quiz/${quiz.id}/grading`)}
                label="Chấm bài"
                variant="success"
              />
            </>
          ) : (
            <ActionButton
              onClick={() => router.push(`/lms/teacher/content/${content.id}/quiz/create`)}
              label="+ Tạo Quiz"
              variant="primary"
            />
          )}
        </div>
      )}

      {/* Student actions */}
      {isStudent && quiz?.id && (
        <div className="flex gap-3">
          <button
            onClick={handleStart}
            disabled={!availability?.ok}
            className={cn(
              "flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-sm",
              !availability?.ok
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {!availability?.ok
              ? "Không khả dụng"
              : hasInProgress
                ? "⏩ Tiếp tục làm bài"
                : "🚀 Bắt đầu làm bài"}
          </button>
          <button
            onClick={() => router.push(`/lms/student/courses/${courseId}/quiz/${quiz.id}/history`)}
            className="px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium text-sm transition-all active:scale-95"
          >
            📜 Lịch sử
          </button>
        </div>
      )}

      {isStudent && !quiz?.id && !error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-700 dark:text-amber-400 text-center">
          Quiz chưa được cấu hình. Vui lòng liên hệ giảng viên.
        </div>
      )}
    </div>
  );
}
