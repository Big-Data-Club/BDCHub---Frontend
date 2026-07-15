import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StudentCourseAnalytics } from '@/components/lms/student/StudentCourseAnalytics';
import React from 'react';

const meta: Meta<typeof StudentCourseAnalytics> = {
  title: 'LMS/Components/StudentCourseAnalytics',
  component: StudentCourseAnalytics,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

// Mock Data
const mockEnrollments = [
  { course_id: 101, course_title: "Lập trình React và Next.js chuyên sâu", status: "ACCEPTED" as const, id: 1, user_id: 1, created_at: "", finished_at: null, enrolled_at: "" },
  { course_id: 102, course_title: "Nhập môn Machine Learning cơ bản", status: "ACCEPTED" as const, id: 2, user_id: 1, created_at: "", finished_at: null, enrolled_at: "" },
];

const mockLessonProgress = {
  total_content: 15,
  by_type: [
    { content_type: "VIDEO", completed: 3, total: 5 },
    { content_type: "DOCUMENT", completed: 2, total: 3 },
    { content_type: "QUIZ", completed: 1, total: 2 },
    { content_type: "TEXT", completed: 4, total: 5 },
  ],
  by_section: [
    { section_title: "Chương 1: Giới thiệu & Cài đặt", completed: 3, total: 3, percent: 100 },
    { section_title: "Chương 2: Kiến thức cơ bản", completed: 2, total: 5, percent: 40 },
    { section_title: "Chương 3: Hooks nâng cao", completed: 1, total: 4, percent: 25 },
    { section_title: "Chương 4: Tối ưu hiệu năng", completed: 0, total: 3, percent: 0 },
    { section_title: "Chương 5: Server Components & Actions", completed: 3, total: 3, percent: 100 },
    { section_title: "Chương 6: State Management với Zustand", completed: 2, total: 4, percent: 50 },
    { section_title: "Chương 7: Kiểm thử & Deploy", completed: 0, total: 2, percent: 0 },
    { section_title: "Chương 8: AI-Native UI & BDC Rhythm", completed: 0, total: 5, percent: 0 },
  ],
};

const mockHeatmapData = [
  { subject: "React Hooks", "Độ thông thạo (%)": 85 },
  { subject: "Next.js Routing", "Độ thông thạo (%)": 70 },
  { subject: "TypeScript Basics", "Độ thông thạo (%)": 90 },
  { subject: "Tailwind Styling", "Độ thông thạo (%)": 80 },
  { subject: "State Management", "Độ thông thạo (%)": 60 },
  { subject: "Server Actions", "Độ thông thạo (%)": 75 },
  { subject: "Authentication", "Độ thông thạo (%)": 85 },
  { subject: "Caching & Revalidation", "Độ thông thạo (%)": 50 },
  { subject: "Database Indexing", "Độ thông thạo (%)": 95 },
  { subject: "Query Optimization", "Độ thông thạo (%)": 40 },
  { subject: "MapReduce Basics", "Độ thông thạo (%)": 30 },
  { subject: "Hadoop HDFS", "Độ thông thạo (%)": 65 },
  { subject: "Kafka Streams", "Độ thông thạo (%)": 55 },
  { subject: "Docker Containers", "Độ thông thạo (%)": 80 },
  { subject: "CI/CD Pipelines", "Độ thông thạo (%)": 70 },
  { subject: "System Design Patterns", "Độ thông thạo (%)": 45 },
];

const mockQuizScores = [
  { quiz_id: 1, quiz_title: "Trắc nghiệm React Basics", best_percentage: 90, is_passed: true },
  { quiz_id: 2, quiz_title: "Trắc nghiệm Next.js Router", best_percentage: 75, is_passed: false },
  { quiz_id: 3, quiz_title: "Trắc nghiệm TypeScript Adv", best_percentage: 100, is_passed: true },
  { quiz_id: 4, quiz_title: "Trắc nghiệm State Management", best_percentage: 80, is_passed: true },
  { quiz_id: 5, quiz_title: "Trắc nghiệm NextAuth Security", best_percentage: 60, is_passed: false },
  { quiz_id: 6, quiz_title: "Trắc nghiệm Caching & DB", best_percentage: 0, is_passed: false },
];

const mockMicroInteractions = {
  total_interactions: 25,
  total_correct: 20,
};

const mockSpacedRepQuizzes = {
  total_tracked: 12,
  mastered: 8,
  avg_quality: 4.2,
};

const mockFlashcardStats = {
  total_active: 30,
  total_mastered: 15,
  total_learning: 10,
  total_new: 5,
  total_due: 6,
  reviews_today: 12,
  avg_easiness: 2.75,
  total_reviews: 45,
};

const baseProps = {
  selectedCourseId: 101,
  currentCourseTitle: "Lập trình React và Next.js chuyên sâu",
  acceptedEnrollments: mockEnrollments,
  setSelectedCourseId: () => {},
  loadingAnalytics: false,
  analyticsTab: "lessons" as const,
  setAnalyticsTab: () => {},
  heatmapData: mockHeatmapData,
  flashcardStats: mockFlashcardStats,
  quizScores: mockQuizScores,
  lessonProgress: mockLessonProgress,
  microInteractions: mockMicroInteractions,
  spacedRepQuizzes: mockSpacedRepQuizzes,
  mounted: true,
};

export const AllScenarios: StoryObj<typeof StudentCourseAnalytics> = {
  render: () => {
    return (
      <div className="space-y-12 max-w-5xl mx-auto p-6 bg-slate-50 dark:bg-[#050B18] min-h-screen">
        {/* Scenario 1: Empty state */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold border-b pb-2 text-slate-700 dark:text-slate-350">
            1. Kịch bản: Chưa chọn khóa học (Empty State)
          </h2>
          <StudentCourseAnalytics
            {...baseProps}
            selectedCourseId={null}
            currentCourseTitle=""
          />
        </section>

        {/* Scenario 2: Loading state */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold border-b pb-2 text-slate-700 dark:text-slate-350">
            2. Kịch bản: Đang tải dữ liệu (Loading State)
          </h2>
          <StudentCourseAnalytics
            {...baseProps}
            loadingAnalytics={true}
          />
        </section>

        {/* Scenario 3: Populated state - Lessons tab */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold border-b pb-2 text-slate-700 dark:text-slate-350">
            {'3. Kịch bản: Tab "Tiến độ bài học"'}
          </h2>
          <StudentCourseAnalytics
            {...baseProps}
            analyticsTab="lessons"
            setAnalyticsTab={() => {}}
          />
        </section>

        {/* Scenario 4: Populated state - Mastery tab */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold border-b pb-2 text-slate-700 dark:text-slate-350">
            {'4. Kịch bản: Tab "Năng lực & Quiz"'}
          </h2>
          <StudentCourseAnalytics
            {...baseProps}
            analyticsTab="mastery"
            setAnalyticsTab={() => {}}
          />
        </section>

        {/* Scenario 5: Populated state - Flashcard tab */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold border-b pb-2 text-slate-700 dark:text-slate-350">
            {'5. Kịch bản: Tab "Ghi nhớ (Flashcard)"'}
          </h2>
          <StudentCourseAnalytics
            {...baseProps}
            analyticsTab="flashcards"
            setAnalyticsTab={() => {}}
          />
        </section>
      </div>
    );
  }
};
