import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CourseProgressAndGoalCard } from '@/components/lms/student/CourseProgressAndGoalCard';
import React from 'react';

const meta: Meta<typeof CourseProgressAndGoalCard> = {
  title: 'LMS/Components/CourseProgressAndGoalCard',
  component: CourseProgressAndGoalCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

// 1. Scenario: In Progress focus course
export const InProgress: StoryObj<typeof CourseProgressAndGoalCard> = {
  args: {
    focusCourse: {
      course_id: 101,
      course_title: "Lập trình React và Next.js chuyên sâu - Thiết kế kiến trúc và Tối ưu hóa hiệu năng ứng dụng Enterprise",
      progress_percent: 68,
    },
    totalCount: 3,
    completedCount: 1,
    inProgressCount: 1,
    notStartedCount: 1,
    completedPercent: 33,
    inProgressPercent: 33,
    notStartedPercent: 34,
    loading: false,
  },
  render: (args) => (
    <div className="max-w-4xl mx-auto p-4 bg-slate-50 dark:bg-[#050B18]">
      <CourseProgressAndGoalCard {...args} />
    </div>
  )
};

// 2. Scenario: Not Started Focus course
export const NotStarted: StoryObj<typeof CourseProgressAndGoalCard> = {
  args: {
    focusCourse: {
      course_id: 103,
      course_title: "Nhập môn Machine Learning cơ bản",
      progress_percent: 0,
    },
    totalCount: 1,
    completedCount: 0,
    inProgressCount: 0,
    notStartedCount: 1,
    completedPercent: 0,
    inProgressPercent: 0,
    notStartedPercent: 100,
    loading: false,
  },
  render: (args) => (
    <div className="max-w-4xl mx-auto p-4 bg-slate-50 dark:bg-[#050B18]">
      <CourseProgressAndGoalCard {...args} />
    </div>
  )
};

// 3. Scenario: All Completed (No active goal, all 100% completed)
export const AllCompleted: StoryObj<typeof CourseProgressAndGoalCard> = {
  args: {
    focusCourse: null,
    totalCount: 2,
    completedCount: 2,
    inProgressCount: 0,
    notStartedCount: 0,
    completedPercent: 100,
    inProgressPercent: 0,
    notStartedPercent: 0,
    loading: false,
  },
  render: (args) => (
    <div className="max-w-4xl mx-auto p-4 bg-slate-50 dark:bg-[#050B18]">
      <CourseProgressAndGoalCard {...args} />
    </div>
  )
};

// 4. Scenario: No Enrollments (Empty state)
export const NoEnrollments: StoryObj<typeof CourseProgressAndGoalCard> = {
  args: {
    focusCourse: null,
    totalCount: 0,
    completedCount: 0,
    inProgressCount: 0,
    notStartedCount: 0,
    completedPercent: 0,
    inProgressPercent: 0,
    notStartedPercent: 0,
    loading: false,
  },
  render: (args) => (
    <div className="max-w-4xl mx-auto p-4 bg-slate-50 dark:bg-[#050B18]">
      <CourseProgressAndGoalCard {...args} />
    </div>
  )
};

// 5. Scenario: Loading State
export const Loading: StoryObj<typeof CourseProgressAndGoalCard> = {
  args: {
    focusCourse: null,
    totalCount: 0,
    completedCount: 0,
    inProgressCount: 0,
    notStartedCount: 0,
    completedPercent: 0,
    inProgressPercent: 0,
    notStartedPercent: 0,
    loading: true,
  },
  render: (args) => (
    <div className="max-w-4xl mx-auto p-4 bg-slate-50 dark:bg-[#050B18]">
      <CourseProgressAndGoalCard {...args} />
    </div>
  )
};
