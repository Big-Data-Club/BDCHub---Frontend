import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { ActionApprovalCard } from '@/components/lms/agent/ActionApprovalCard';
import { MOCK_HITL_REQUEST } from '../mocks/chatFixtures';

const meta: Meta<typeof ActionApprovalCard> = {
  title: 'LMS / AI Mentor / Primitives / ActionApprovalCard',
  component: ActionApprovalCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-white rounded-2xl max-w-lg border border-slate-200 dark:border-blue-500/10">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ActionApprovalCard>;

export const NavigationRequest: Story = {
  args: {
    request: {
      tool: 'navigate',
      message: 'Agent muốn điều hướng tới trang bài học "QuickSort Algorithm"',
      data: { action: 'navigate', label: 'Đi tới bài học' },
    },
    onApprove: () => alert('Approved navigation'),
    onReject: () => alert('Rejected navigation'),
  },
};

export const CustomActionRequest: Story = {
  args: {
    request: MOCK_HITL_REQUEST,
    onApprove: () => alert('Approved action'),
    onReject: () => alert('Rejected action'),
  },
};
