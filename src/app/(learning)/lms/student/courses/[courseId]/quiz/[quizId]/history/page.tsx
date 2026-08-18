"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuizHistory } from "@/hooks/lms/student/useQuizHistory";
import { QuizAttemptList } from "@/components/lms/student/quiz/QuizAttemptList";

export default function QuizHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = parseInt(params.quizId as string);
  const courseId = parseInt(params.courseId as string);

  const { attempts, loading, error, quizTitle, loadAttempts } = useQuizHistory(quizId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050B18]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#050B18]">
        <div className="bg-white dark:bg-[#0F1E35] rounded-2xl max-w-md w-full p-8 shadow-lg border border-slate-200 dark:border-blue-500/10 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Có lỗi xảy ra</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              Quay lại
            </Button>
            <Button
              onClick={loadAttempts}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B18]">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-blue-500/10 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <button
                onClick={() => router.push(`/lms/student/courses/${courseId}/learn`)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại nội dung học
              </button>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                {quizTitle || "Lịch sử làm bài"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Tổng số lần làm: {attempts.length}
              </p>
            </div>

            <Button
              onClick={() => router.push(`/lms/student/courses/${courseId}/quiz/${quizId}/take?start=true`)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold px-5 py-2.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Làm bài mới
            </Button>
          </div>
        </div>
      </div>

      {/* Attempts List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuizAttemptList
          attempts={attempts}
          courseId={courseId}
          quizId={quizId}
          onNavigateToResult={(attemptId) =>
            router.push(`/lms/student/courses/${courseId}/quiz/${quizId}/result/${attemptId}`)
          }
          onNavigateToTake={(startNew) =>
            router.push(`/lms/student/courses/${courseId}/quiz/${quizId}/take${startNew ? "?start=true" : ""}`)
          }
        />
      </div>
    </div>
  );
}