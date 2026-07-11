import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import StatsPage from '@/app/(learning)/lms/student/courses/[courseId]/stats/page';
import { StudentCourseContext } from '@/components/lms/student/StudentCourseContext';
import analyticsService from '@/services/analyticsService';
import React from 'react';

// Setup Meta
const meta: Meta<typeof StatsPage> = {
  title: 'LMS/Pages/StudentCourseStats',
  component: StatsPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/lms/student/courses/101/stats',
        query: { courseId: '101' },
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// Mock context providers
const mockEmptyContext = {
  course: {
    id: 101,
    title: "Lập trình Web nâng cao",
    description: "Khóa học chưa bắt đầu học",
    thumbnail_url: "",
    created_by: 1,
    teacher_name: "Giảng viên A",
    status: "PUBLISHED" as const,
  },
  sections: [],
  courseId: 101,
  activeContent: null,
  setActiveContent: () => {},
  sectionContents: {},
  loadSectionContents: () => {},
  loadingSection: {},
  expanded: new Set<number>(),
  toggleSection: () => {},
  sidebarOpen: false,
  setSidebarOpen: () => {},
  completedIds: new Set<number>(),
  handleMarkComplete: async () => {},
  markingComplete: false,
  progress: {
    course_id: 101,
    completed_count: 0,
    total_mandatory: 0,
    progress_percent: 0,
    completed_content_ids: [],
  },
  progressDetail: [],
  loadProgress: async () => {},
};

const mockPopulatedContext = {
  ...mockEmptyContext,
  course: {
    id: 101,
    title: "Lập trình React và Next.js chuyên sâu",
    description: "Lộ trình đào tạo lập trình viên Web thế hệ mới với AI-native",
    thumbnail_url: "",
    created_by: 1,
    teacher_name: "TS. Nguyễn Văn A",
    status: "PUBLISHED" as const,
  },
  sections: [
    { id: 1, course_id: 101, title: "Chương 1: Giới thiệu & Cài đặt", order_index: 1, level: 1, chunk_count: 0 },
    { id: 2, course_id: 101, title: "Chương 2: Hooks chuyên sâu", order_index: 2, level: 1, chunk_count: 0 },
  ],
  sectionContents: {
    1: [
      { id: 10, section_id: 1, title: "Cài đặt môi trường Node.js", type: "VIDEO", is_mandatory: true, order_index: 1 },
      { id: 11, section_id: 1, title: "Khởi tạo project Next.js", type: "DOCUMENT", is_mandatory: true, order_index: 2 },
    ],
    2: [
      { id: 20, section_id: 2, title: "Tìm hiểu sâu về useEffect", type: "TEXT", is_mandatory: true, order_index: 1 },
      { id: 21, section_id: 2, title: "Quiz củng cố Hooks", type: "QUIZ", is_mandatory: true, order_index: 2 },
    ]
  },
  completedIds: new Set([10, 11]),
  progress: {
    course_id: 101,
    completed_count: 2,
    total_mandatory: 4,
    progress_percent: 50,
    completed_content_ids: [10, 11],
  },
  progressDetail: [
    { content_id: 10, content_title: "Cài đặt môi trường Node.js", section_title: "Chương 1: Giới thiệu & Cài đặt", is_mandatory: true, is_completed: true },
    { content_id: 11, content_title: "Khởi tạo project Next.js", section_title: "Chương 1: Giới thiệu & Cài đặt", is_mandatory: true, is_completed: true },
    { content_id: 20, content_title: "Tìm hiểu sâu về useEffect", section_title: "Chương 2: Hooks chuyên sâu", is_mandatory: true, is_completed: false },
    { content_id: 21, content_title: "Quiz củng cố Hooks", section_title: "Chương 2: Hooks chuyên sâu", is_mandatory: true, is_completed: false },
  ],
};

// 1. Scenario: Empty Data (No activities completed, no quizzes, no weaknesses)
export const EmptyState: StoryObj<typeof StatsPage> = {
  render: () => {
    // Stub APIs for empty scenario
    analyticsService.getMyQuizScores = async () => ({ data: [] });
    analyticsService.getMyWeaknesses = async () => ({
      data: {
        course_id: 101,
        total_wrong_percent: 0,
        weak_nodes: [],
      }
    });

    return (
      <StudentCourseContext.Provider value={mockEmptyContext}>
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
          <StatsPage />
        </div>
      </StudentCourseContext.Provider>
    );
  }
};

// 2. Scenario: Populated Data (With active progress, quiz scores, and AI weaknesses)
export const PopulatedState: StoryObj<typeof StatsPage> = {
  render: () => {
    // Stub APIs for populated scenario
    analyticsService.getMyQuizScores = async () => ({
      data: [
        {
          quiz_id: 1,
          quiz_title: "Kiểm tra Chương 1: Kiến thức cơ bản",
          best_percentage: 100,
          best_points: 10,
          total_points: 10,
          attempts_count: 1,
          is_passed: true,
          passing_score: 80,
          last_attempt_at: "2026-07-08T10:00:00Z",
          status: "passed" as const,
        },
        {
          quiz_id: 2,
          quiz_title: "Trắc nghiệm chương 2: Custom Hooks",
          best_percentage: 60,
          best_points: 6,
          total_points: 10,
          attempts_count: 2,
          is_passed: false,
          passing_score: 80,
          last_attempt_at: "2026-07-09T14:30:00Z",
          status: "failed" as const,
        },
        {
          quiz_id: 3,
          quiz_title: "Đánh giá giữa kỳ: Next.js Routing & API",
          best_percentage: 85,
          best_points: 17,
          total_points: 20,
          attempts_count: 1,
          is_passed: true,
          passing_score: 70,
          last_attempt_at: "2026-07-10T12:00:00Z",
          status: "passed" as const,
        },
        {
          quiz_id: 4,
          quiz_title: "Bài tập lớn: Tối ưu hóa Web với Server Components",
          best_percentage: null,
          best_points: null,
          total_points: 20,
          attempts_count: 0,
          is_passed: null,
          passing_score: 80,
          last_attempt_at: null,
          status: "not_started" as const,
        }
      ]
    });

    analyticsService.getMyWeaknesses = async () => ({
      data: {
        course_id: 101,
        total_wrong_percent: 32.5,
        weak_nodes: [
          {
            node_id: 1,
            node_name: "useCallback & useMemo Optimization",
            total_attempt: 8,
            mastery_level: 40,
            status_level: "Yếu" as const,
            wrong_count: 5,
            flashcard_count: 2,
          },
          {
            node_id: 2,
            node_name: "Re-rendering in React Context",
            total_attempt: 12,
            mastery_level: 25,
            status_level: "Cần cải thiện" as const,
            wrong_count: 9,
            flashcard_count: 0,
          },
          {
            node_id: 3,
            node_name: "Next.js Dynamic Routing API",
            total_attempt: 10,
            mastery_level: 65,
            status_level: "TB" as const,
            wrong_count: 3,
            flashcard_count: 5,
          }
        ]
      }
    });

    return (
      <StudentCourseContext.Provider value={mockPopulatedContext}>
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
          <StatsPage />
        </div>
      </StudentCourseContext.Provider>
    );
  }
};
