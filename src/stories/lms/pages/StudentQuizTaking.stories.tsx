import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { QuizHeader } from "@/components/lms/student/quiz/QuizHeader";
import { QuizQuestionCard } from "@/components/lms/student/quiz/QuizQuestionCard";
import { QuizQuestionNav } from "@/components/lms/student/quiz/QuizQuestionNav";
import { QuizSubmitReviewModal } from "@/components/lms/student/quiz/QuizSubmitReviewModal";
import type { Question } from "@/hooks/lms/student/useQuizTaking";

const mockQuestions: Question[] = [
  {
    id: 1,
    question_type: "SINGLE_CHOICE",
    question_text: "Đâu là ưu điểm lớn nhất của việc sử dụng **Tailwind CSS v4** trong các dự án Next.js?",
    points: 10,
    order_index: 1,
    is_required: true,
    answer_options: [
      { id: 101, option_text: "Engine Rust / Lightning CSS siêu nhanh, cấu hình thuần CSS" },
      { id: 102, option_text: "Viết inline style bằng JavaScript object" },
      { id: 103, option_text: "Tự động biên dịch sang jQuery" },
      { id: 104, option_text: "Không hỗ trợ dark mode" },
    ],
  },
  {
    id: 2,
    question_type: "MULTIPLE_CHOICE",
    question_text: "Các nguyên tắc cơ bản nào thuộc mô hình kiến trúc **BDC Design Rhythm v3.0**?",
    points: 15,
    order_index: 2,
    is_required: true,
    answer_options: [
      { id: 201, option_text: "Dark-first với dải màu Navy Cosmic (`#050B18`)" },
      { id: 202, option_text: "Tách biệt rõ ràng Presentation (Component) và Logic (Hook)" },
      { id: 203, option_text: "Gọi fetch API trực tiếp bên trong render method của React component" },
      { id: 204, option_text: "Phản hồi tương tác tactile linh hoạt với hiệu ứng offset & spring curves" },
    ],
  },
  {
    id: 3,
    question_type: "FILL_BLANK_TEXT",
    question_text: "Khi truyền props xuống component con, quy chuẩn đặt tên interface props phải theo dạng [[1]]Props (Ví dụ: [[2]]Props).",
    points: 10,
    order_index: 3,
    is_required: true,
    settings: {
      blank_count: 2,
      blanks: [{ id: 1, hint: "Tên component" }, { id: 2, hint: "Ví dụ TaskCard" }],
    },
  },
  {
    id: 4,
    question_type: "ESSAY",
    question_text: "Hãy trình bày ngắn gọn phương pháp xử lý re-render hiệu quả trong React khi làm việc với danh sách lớn (Large List).",
    points: 20,
    order_index: 4,
    is_required: false,
  },
  {
    id: 5,
    question_type: "FILE_UPLOAD",
    question_text: "Hãy tải lên tệp báo cáo bài tập cá nhân định dạng PDF hoặc DOCX (Tối đa 20MB).",
    points: 25,
    order_index: 5,
    is_required: true,
    settings: {
      max_file_size_mb: 20,
      allowed_extensions: [".pdf", ".docx"],
    },
  },
];

function QuizTakingStorybookDemo({
  initialTimeLeft = 1200,
  initialActiveSave = 0,
}: {
  initialTimeLeft?: number;
  initialActiveSave?: number;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({
    1: { selected_option_id: 101 },
    2: { selected_option_ids: [201, 202, 204] },
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [activeSaveRequests, setActiveSaveRequests] = useState(initialActiveSave);
  const [submitting, setSubmitting] = useState(false);

  const handleAnswerChange = (questionId: number, answerData: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerData }));
    // Simulate active save indicator
    setActiveSaveRequests(1);
    setTimeout(() => {
      setActiveSaveRequests(0);
    }, 600);
  };

  const handleFinalSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setShowReviewModal(false);
      alert("🎉 Đã nộp bài kiểm tra thành công! (Storybook Demo)");
    }, 1200);
  };

  const activeQuestion = mockQuestions[currentIdx];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-slate-100">
      {/* Header */}
      <QuizHeader
        quizTitle="Bài Kiểm Tra Giữa Kỳ: Lập Trình Frontend Nâng Cao"
        courseTitle="Lập Trình Web React & Next.js chuyên sâu"
        courseId={101}
        quizId={402}
        timeLeft={initialTimeLeft}
        activeSaveRequests={activeSaveRequests}
        onBack={() => alert("Trở về trang lịch sử bài làm")}
      />

      {/* Content Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        <QuizQuestionCard
          question={activeQuestion}
          currentIndex={currentIdx}
          totalQuestions={mockQuestions.length}
          answer={answers[activeQuestion.id]}
          onAnswerChange={handleAnswerChange}
          onOpenImageModal={(url) => setShowImageModal(url)}
        />

        {/* Navigation & Question List Drawer */}
        <QuizQuestionNav
          questions={mockQuestions}
          currentQuestion={currentIdx}
          answers={answers}
          onSelectQuestion={(idx) => setCurrentIdx(idx)}
          onPrev={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
          onNext={() => setCurrentIdx((prev) => Math.min(mockQuestions.length - 1, prev + 1))}
          onOpenReviewModal={() => setShowReviewModal(true)}
          submitting={submitting}
        />
      </main>

      {/* Review Modal */}
      <QuizSubmitReviewModal
        open={showReviewModal}
        questions={mockQuestions}
        serverAnswers={answers}
        fetchingServerAnswers={false}
        submitting={submitting}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleFinalSubmit}
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
              className="absolute top-4 right-4 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof QuizTakingStorybookDemo> = {
  title: "LMS/Pages/StudentQuizTaking",
  component: QuizTakingStorybookDemo,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/lms/student/courses/101/quiz/402/take",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

// 1. Normal In-Progress Scenario (Plenty of time remaining)
export const NormalProgress: StoryObj<typeof QuizTakingStorybookDemo> = {
  render: () => <QuizTakingStorybookDemo initialTimeLeft={1800} />,
};

// 2. Time Warning Scenario (Under 5 minutes remaining, timer pulsing red)
export const UrgentTimerWarning: StoryObj<typeof QuizTakingStorybookDemo> = {
  render: () => <QuizTakingStorybookDemo initialTimeLeft={145} />,
};

// 3. Auto-Saving Scenario (Active network request saving answer)
export const AutoSavingState: StoryObj<typeof QuizTakingStorybookDemo> = {
  render: () => <QuizTakingStorybookDemo initialTimeLeft={900} initialActiveSave={1} />,
};
