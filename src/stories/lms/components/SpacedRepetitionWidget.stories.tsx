/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SpacedRepetitionWidget } from '@/components/lms/student/SpacedRepetitionWidget';
import aiService from '@/services/aiService';
import React from 'react';

const meta: Meta<typeof SpacedRepetitionWidget> = {
  title: 'LMS/Components/SpacedRepetitionWidget',
  component: SpacedRepetitionWidget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

// 1. Scenario: No reviews due today (Clean state)
export const NoReviewsDue: StoryObj<typeof SpacedRepetitionWidget> = {
  args: {
    courseId: 101,
  },
  render: (args) => {
    // Stub service calls
    aiService.getReviewStats = async () => ({
      due_today: 0,
      upcoming: 8,
      total_tracked: 15,
    });
    aiService.getDueReviews = async () => [];

    return (
      <div className="w-[450px]">
        <SpacedRepetitionWidget {...args} />
      </div>
    );
  }
};

// 2. Scenario: Active reviews due today (Student needs to study)
export const ReviewsDueToday: StoryObj<typeof SpacedRepetitionWidget> = {
  args: {
    courseId: 101,
  },
  render: (args) => {
    // Stub service calls
    aiService.getReviewStats = async () => ({
      due_today: 3,
      upcoming: 5,
      total_tracked: 20,
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
      },
      {
        question_id: 2,
        node_id: 11,
        node_name: "React Server Components",
        next_review_date: "2026-07-10T00:00:00Z",
        interval_days: 3,
        repetitions: 1,
        question_text: "Sự khác biệt chính giữa React Server Component (RSC) và Client Component là gì?",
        question_type: "FLASHCARD",
      },
      {
        question_id: 3,
        node_id: 12,
        node_name: "Next.js Dynamic Routing",
        next_review_date: "2026-07-10T00:00:00Z",
        interval_days: 7,
        repetitions: 4,
        question_text: "Làm thế nào để lấy dynamic segments từ URL trong Next.js App Router từ cả Server Component và Client Component?",
        question_type: "FLASHCARD",
      }
    ];

    aiService.recordReview = async (courseId, questionId, quality, _nodeId) => {
      console.log(`Recorded review: questionId=${questionId}, quality=${quality}`);
      return Promise.resolve();
    };

    return (
      <div className="w-[450px]">
        <SpacedRepetitionWidget {...args} />
      </div>
    );
  }
};
