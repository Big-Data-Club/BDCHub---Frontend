import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FocusCard } from '@/components/lms/student/FocusCard';
import React from 'react';

const meta: Meta<typeof FocusCard> = {
  title: 'LMS/Components/FocusCard',
  component: FocusCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

// 1. Scenario: Populated State (Active focus course with progress > 0)
export const InProgress: StoryObj<typeof FocusCard> = {
  args: {
    focusCourse: {
      course_id: 101,
      course_title: "Lập trình React và Next.js chuyên sâu",
      progress_percent: 68,
    },
    totalCount: 2,
    loading: false,
  },
  render: (args) => (
    <div className="w-[380px] p-4 bg-slate-50 dark:bg-[#050B18]">
      <FocusCard {...args} />
    </div>
  )
};

// 2. Scenario: Not Started State (Course exists but progress is 0%)
export const NotStarted: StoryObj<typeof FocusCard> = {
  args: {
    focusCourse: {
      course_id: 103,
      course_title: "Nhập môn Machine Learning cơ bản",
      progress_percent: 0,
    },
    totalCount: 1,
    loading: false,
  },
  render: (args) => (
    <div className="w-[380px] p-4 bg-slate-50 dark:bg-[#050B18]">
      <FocusCard {...args} />
    </div>
  )
};

// 3. Scenario: All Completed State (All courses are 100% completed)
export const AllCompleted: StoryObj<typeof FocusCard> = {
  args: {
    focusCourse: null,
    totalCount: 1,
    loading: false,
  },
  render: (args) => (
    <div className="w-[380px] p-4 bg-slate-50 dark:bg-[#050B18]">
      <FocusCard {...args} />
    </div>
  )
};

// 4. Scenario: Empty State (No courses enrolled at all)
export const NoEnrollments: StoryObj<typeof FocusCard> = {
  args: {
    focusCourse: null,
    totalCount: 0,
    loading: false,
  },
  render: (args) => (
    <div className="w-[380px] p-4 bg-slate-50 dark:bg-[#050B18]">
      <FocusCard {...args} />
    </div>
  )
};

// 5. Scenario: Loading State
export const Loading: StoryObj<typeof FocusCard> = {
  args: {
    focusCourse: null,
    totalCount: 0,
    loading: true,
  },
  render: (args) => (
    <div className="w-[380px] p-4 bg-slate-50 dark:bg-[#050B18]">
      <FocusCard {...args} />
    </div>
  )
};
