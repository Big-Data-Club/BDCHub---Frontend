import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { QuizQuestionCard } from "@/components/lms/student/quiz/QuizQuestionCard";
import type { Question } from "@/hooks/lms/student/useQuizTaking";

const meta: Meta<typeof QuizQuestionCard> = {
  title: "LMS/Student/QuizQuestionCard",
  component: QuizQuestionCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[768px] max-w-full bg-slate-50 dark:bg-[#050B18] p-6 rounded-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

// 1. Single Choice Question
const mockSingleChoice: Question = {
  id: 101,
  question_type: "SINGLE_CHOICE",
  question_text: "Trong React, hook nào được sử dụng để duy trì state cục bộ của component?",
  points: 10,
  order_index: 1,
  is_required: true,
  answer_options: [
    { id: 1, option_text: "`useEffect` - Xử lý side effects" },
    { id: 2, option_text: "`useState` - Quản lý state của component" },
    { id: 3, option_text: "`useContext` - Đọc dữ liệu từ Context Provider" },
    { id: 4, option_text: "`useRef` - Lưu trữ giá trị mutable không trigger re-render" },
  ],
};

export const SingleChoice: StoryObj<typeof QuizQuestionCard> = {
  render: () => {
    const [answer, setAnswer] = useState<any>({ selected_option_id: 2 });
    return (
      <QuizQuestionCard
        question={mockSingleChoice}
        currentIndex={0}
        totalQuestions={10}
        answer={answer}
        onAnswerChange={(_id, val) => setAnswer(val)}
        onOpenImageModal={(url) => alert(`Mở xem ảnh lớn: ${url}`)}
      />
    );
  },
};

// 2. Multiple Choice Question
const mockMultipleChoice: Question = {
  id: 102,
  question_type: "MULTIPLE_CHOICE",
  question_text: "Những đặc điểm nào sau đây là ưu điểm của **Next.js App Router**? *(Chọn tất cả đáp án đúng)*",
  points: 15,
  order_index: 2,
  is_required: true,
  answer_options: [
    { id: 10, option_text: "Hỗ trợ **React Server Components (RSC)** mặc định" },
    { id: 11, option_text: "Nested Layouts với tệp `layout.tsx`" },
    { id: 12, option_text: "Chỉ chạy được trên hệ điều hành Windows" },
    { id: 13, option_text: "Streaming & Suspense rendering" },
  ],
};

export const MultipleChoice: StoryObj<typeof QuizQuestionCard> = {
  render: () => {
    const [answer, setAnswer] = useState<any>({ selected_option_ids: [10, 11] });
    return (
      <QuizQuestionCard
        question={mockMultipleChoice}
        currentIndex={1}
        totalQuestions={10}
        answer={answer}
        onAnswerChange={(_id, val) => setAnswer(val)}
        onOpenImageModal={(url) => alert(`Mở xem ảnh lớn: ${url}`)}
      />
    );
  },
};

// 3. Question with Images Attachment
const mockWithImage: Question = {
  id: 103,
  question_type: "SINGLE_CHOICE",
  question_text: "Dựa vào sơ đồ kiến trúc bộ nhớ bên dưới, luồng truyền dữ liệu giữa Client và Server diễn ra theo trình tự nào?",
  points: 20,
  order_index: 3,
  is_required: true,
  settings: {
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop",
        file_name: "architecture_diagram.png",
        caption: "Hình 1: Kiến trúc tổng quan mô hình Client-Server",
        position: "above_question",
      },
    ],
  },
  answer_options: [
    { id: 1, option_text: "Client Request → API Gateway → Microservice → Database" },
    { id: 2, option_text: "Database → Client Request → Component" },
    { id: 3, option_text: "Direct State Mutation" },
  ],
};

export const QuestionWithImage: StoryObj<typeof QuizQuestionCard> = {
  render: () => {
    const [answer, setAnswer] = useState<any>(null);
    return (
      <QuizQuestionCard
        question={mockWithImage}
        currentIndex={2}
        totalQuestions={10}
        answer={answer}
        onAnswerChange={(_id, val) => setAnswer(val)}
        onOpenImageModal={(url) => alert(`Mở xem ảnh lớn: ${url}`)}
      />
    );
  },
};

// 4. Fill Blank Text Question
const mockFillBlankText: Question = {
  id: 104,
  question_type: "FILL_BLANK_TEXT",
  question_text: "Cú pháp khai báo biến trong TypeScript sử dụng từ khóa [[1]] cho hằng số và từ khóa [[2]] cho biến có thể gán lại.",
  points: 10,
  order_index: 4,
  is_required: false,
  settings: {
    blank_count: 2,
    blanks: [
      { id: 1, hint: "Hằng số" },
      { id: 2, hint: "Biến linh hoạt" },
    ],
  },
};

export const FillBlankText: StoryObj<typeof QuizQuestionCard> = {
  render: () => {
    const [answer, setAnswer] = useState<any>({ blanks: ["const", "let"] });
    return (
      <QuizQuestionCard
        question={mockFillBlankText}
        currentIndex={3}
        totalQuestions={10}
        answer={answer}
        onAnswerChange={(_id, val) => setAnswer(val)}
        onOpenImageModal={(url) => alert(`Mở xem ảnh lớn: ${url}`)}
      />
    );
  },
};

// 5. Essay / Code Submission Question
const mockEssay: Question = {
  id: 105,
  question_type: "ESSAY",
  question_text: "Trình bày thuật toán sắp xếp nhanh (QuickSort) và phân tích độ phức tạp thời gian trong trường hợp tốt nhất và xấu nhất.",
  points: 25,
  order_index: 5,
  is_required: true,
};

export const EssayQuestion: StoryObj<typeof QuizQuestionCard> = {
  render: () => {
    const [answer, setAnswer] = useState<any>({ answer_text: "Thuật toán QuickSort phân chia mảng thành 2 phần dựa trên phần tử chốt (pivot)..." });
    return (
      <QuizQuestionCard
        question={mockEssay}
        currentIndex={4}
        totalQuestions={10}
        answer={answer}
        onAnswerChange={(_id, val) => setAnswer(val)}
        onOpenImageModal={(url) => alert(`Mở xem ảnh lớn: ${url}`)}
      />
    );
  },
};
