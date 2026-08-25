"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuizTaking } from "@/hooks/lms/student/useQuizTaking";
import { QuizHeader } from "@/components/lms/student/quiz/QuizHeader";
import { QuizQuestionCard } from "@/components/lms/student/quiz/QuizQuestionCard";
import { QuizQuestionNav } from "@/components/lms/student/quiz/QuizQuestionNav";
import { QuizSubmitReviewModal } from "@/components/lms/student/quiz/QuizSubmitReviewModal";

export default function StudentQuizTakingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const quizId = parseInt(params.quizId as string);
  const courseId = parseInt(params.courseId as string);
  const shouldStart = searchParams.get("start") === "true";

  const {
    quiz,
    questions,
    answers,
    currentQuestion,
    setCurrentQuestion,
    loading,
    submitting,
    activeSaveRequests,
    timeLeft,
    courseTitle,
    showImageModal,
    setShowImageModal,
    showReviewModal,
    setShowReviewModal,
    fetchingServerAnswers,
    serverAnswers,
    failedQuestionIds,
    handleAnswerChange,
    handleSubmit,
    handleOpenReviewModal,
  } = useQuizTaking(quizId, courseId, shouldStart);

  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050B18]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Đang chuẩn bị đề thi...</p>
        </div>
      </div>
    );
  }

  const activeQuestion = questions[currentQuestion];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#050B18]">
      {/* Header */}
      <QuizHeader
        quizTitle={quiz.title}
        courseTitle={courseTitle}
        courseId={courseId}
        quizId={quizId}
        timeLeft={timeLeft}
        activeSaveRequests={activeSaveRequests}
        onBack={() => router.push(`/lms/student/courses/${courseId}/quiz/${quizId}/history`)}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {failedQuestionIds.length > 0 && (
          <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-sm text-red-600 dark:text-red-400 font-medium">
            ⚠️ Có {failedQuestionIds.length} câu trả lời chưa lưu được lên máy chủ (lỗi kết nối). Hãy chọn lại câu trả lời ở các câu đó để hệ thống lưu lại.
          </div>
        )}
        {activeQuestion && (
          <QuizQuestionCard
            question={activeQuestion}
            currentIndex={currentQuestion}
            totalQuestions={questions.length}
            answer={answers[activeQuestion.id]}
            onAnswerChange={handleAnswerChange}
            onOpenImageModal={(url) => setShowImageModal(url)}
          />
        )}

        {/* Question navigation controls & palette drawer */}
        <QuizQuestionNav
          questions={questions}
          currentQuestion={currentQuestion}
          answers={answers}
          onSelectQuestion={(idx) => setCurrentQuestion(idx)}
          onPrev={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          onNext={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
          onOpenReviewModal={handleOpenReviewModal}
          submitting={submitting}
        />
      </main>

      {/* Quiz Submit Review Modal */}
      <QuizSubmitReviewModal
        open={showReviewModal}
        questions={questions}
        serverAnswers={serverAnswers}
        fetchingServerAnswers={fetchingServerAnswers}
        submitting={submitting}
        onClose={() => setShowReviewModal(false)}
        onSubmit={() => handleSubmit(false)}
      />

      {/* Image Preview Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setShowImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-[#0F1E35] p-2 rounded-2xl border border-slate-200 dark:border-blue-500/20 overflow-hidden">
            <img src={showImageModal} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
            <button
              onClick={() => setShowImageModal(null)}
              className="absolute top-4 right-4 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-black transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}