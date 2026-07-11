import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import StudentDashboard from '@/app/(learning)/lms/student/page';
import lmsService from '@/services/lmsService';
import analyticsService from '@/services/analyticsService';
import aiService from '@/services/aiService';
import React from 'react';

const meta: Meta<typeof StudentDashboard> = {
  title: 'LMS/Pages/StudentDashboard',
  component: StudentDashboard,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/lms/student',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// 1. Scenario: Empty State (No enrolled courses)
export const EmptyState: StoryObj<typeof StudentDashboard> = {
  render: () => {
    // Stub lmsService to return no courses
    lmsService.getMyEnrollments = async () => [];
    aiService.getReviewStats = async () => ({
      due_today: 0,
      upcoming: 0,
      total_tracked: 0,
    });
    aiService.getDueReviews = async () => [];

    return (
      <div className="bg-slate-50 dark:bg-[#050B18] min-h-screen p-8 text-slate-900 dark:text-white">
        <div className="max-w-7xl mx-auto">
          <StudentDashboard />
        </div>
      </div>
    );
  }
};

// 2. Scenario: Populated State (Active enrollments, quiz results, flashcards & heatmaps)
export const PopulatedState: StoryObj<typeof StudentDashboard> = {
  render: () => {
    // Mock Spaced Repetition for course 101
    aiService.getReviewStats = async () => ({
      due_today: 6,
      upcoming: 12,
      total_tracked: 32,
    });
    aiService.getDueReviews = async () => [
      {
        question_id: 1,
        node_id: 10,
        node_name: "useCallback & useMemo Optimization",
        next_review_date: "2026-07-10T00:00:00Z",
        interval_days: 1,
        repetitions: 2,
        question_text: "Khi nào bạn nên bọc một hàm trong useCallback và tác động thực sự của nó đối với hiệu năng là gì?",
        question_type: "FLASHCARD",
      }
    ];

    // Mock enrollments
    lmsService.getMyEnrollments = async () => [
      {
        id: 1,
        course_id: 101,
        course_title: "Lập trình React và Next.js chuyên sâu",
        student_id: 99,
        student_name: "Nguyễn Văn Học Viên",
        status: "ACCEPTED" as const,
        progress_percent: 68,
        enrolled_at: "2026-06-01T00:00:00Z",
      },
      {
        id: 2,
        course_id: 102,
        course_title: "Cấu trúc dữ liệu và Giải thuật với Python",
        student_id: 99,
        student_name: "Nguyễn Văn Học Viên",
        status: "ACCEPTED" as const,
        progress_percent: 25,
        enrolled_at: "2026-06-15T00:00:00Z",
      }
    ];

    // Mock analytics summary for course 101
    analyticsService.getStudentAnalyticsSummary = async (courseId) => {
      if (courseId === 102) {
        return {
          data: {
            lesson_progress: {
              total_completed: 4,
              total_content: 16,
              percent: 25,
              by_type: [
                { content_type: "VIDEO", completed: 2, total: 6 },
                { content_type: "DOCUMENT", completed: 2, total: 4 },
                { content_type: "QUIZ", completed: 0, total: 6 },
              ],
              by_section: []
            },
            quiz_scores: [],
            flashcards: {
              total_active: 5,
              total_mastered: 0,
              total_learning: 2,
              total_new: 3,
              due_today: 3,
              upcoming_7d: 2,
              avg_easiness: 2.5,
              reviewed_today: 0,
              total_reviews: 0,
            },
            spaced_rep_quizzes: {
              total_tracked: 0,
              due_today: 0,
              mastered: 0,
              avg_quality: 0,
            },
            micro_interactions: {
              total_interactions: 0,
              total_correct: 0,
              total_wrong: 0,
            },
            heatmap: [],
          }
        };
      }

      // Course 101 data
      return {
        data: {
          lesson_progress: {
            total_completed: 17,
            total_content: 25,
            percent: 68,
            by_type: [
              { content_type: "VIDEO", completed: 8, total: 10 },
              { content_type: "DOCUMENT", completed: 5, total: 6 },
              { content_type: "TEXT", completed: 2, total: 3 },
              { content_type: "QUIZ", completed: 2, total: 6 },
            ],
            by_section: [
              { section_title: "Chương 1: Kiến thức nền tảng", total: 6, completed: 6, percent: 100 },
              { section_title: "Chương 2: Custom Hooks & State", total: 8, completed: 7, percent: 87 },
              { section_title: "Chương 3: Server Components & Actions", total: 11, completed: 4, percent: 36 },
            ]
          },
          quiz_scores: [
            {
              quiz_id: 1,
              quiz_title: "Kiểm tra chương 1",
              best_percentage: 90,
              best_points: 9,
              total_points: 10,
              attempts_count: 1,
              is_passed: true,
              passing_score: 80,
              last_attempt_at: "2026-07-01T10:00:00Z",
              status: "passed" as const,
            },
            {
              quiz_id: 2,
              quiz_title: "Luyện tập Custom Hooks",
              best_percentage: 65,
              best_points: 6.5,
              total_points: 10,
              attempts_count: 2,
              is_passed: false,
              passing_score: 80,
              last_attempt_at: "2026-07-05T15:20:00Z",
              status: "failed" as const,
            }
          ],
          flashcards: {
            total_active: 32,
            total_mastered: 18,
            total_learning: 10,
            total_new: 4,
            due_today: 6,
            upcoming_7d: 12,
            avg_easiness: 2.68,
            reviewed_today: 4,
            total_reviews: 84,
          },
          spaced_rep_quizzes: {
            total_tracked: 15,
            due_today: 2,
            mastered: 8,
            avg_quality: 4.2,
          },
          micro_interactions: {
            total_interactions: 48,
            total_correct: 36,
            total_wrong: 12,
          },
          heatmap: [
            { node_name: "React Core Lifecycle", avg_mastery: 0.95 },
            { node_name: "useEffect Hooks", avg_mastery: 0.85 },
            { node_name: "Context State", avg_mastery: 0.72 },
            { node_name: "NextJS SSR", avg_mastery: 0.60 },
            { node_name: "Server Actions", avg_mastery: 0.42 },
            { node_name: "Middleware Routing", avg_mastery: 0.30 },
          ],
        }
      };
    };

    return (
      <div className="bg-slate-50 dark:bg-[#050B18] min-h-screen p-8 text-slate-900 dark:text-white">
        <div className="max-w-7xl mx-auto">
          <StudentDashboard />
        </div>
      </div>
    );
  }
};
