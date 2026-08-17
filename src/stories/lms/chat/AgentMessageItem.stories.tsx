import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { AgentMessageItem } from '@/components/lms/agent/AgentMessageItem';
import {
  MOCK_TOOL_ACTIVITIES,
  RICH_MARKDOWN_SAMPLE
} from '../mocks/chatFixtures';

const meta: Meta<typeof AgentMessageItem> = {
  title: 'LMS / AI Mentor / Chat / AgentMessageItem',
  component: AgentMessageItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-white rounded-2xl max-w-3xl border border-slate-200 dark:border-blue-500/10 space-y-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AgentMessageItem>;

export const UserMessageShort: Story = {
  args: {
    message: {
      id: 'msg-1',
      role: 'user',
      content: 'Chào AI Mentor, hãy giúp mình giải thích thuật toán QuickSort được không?',
      timestamp: Date.now(),
    },
  },
};

export const AIMessageRichMarkdownAndLatex: Story = {
  args: {
    message: {
      id: 'msg-3',
      role: 'assistant',
      content: RICH_MARKDOWN_SAMPLE,
      timestamp: Date.now(),
    },
  },
};

export const AIMessageWithToolOutputs: Story = {
  args: {
    message: {
      id: 'msg-4',
      role: 'assistant',
      content: 'Mình đã tra cứu tài liệu môn học và chạy thử nghiệm code Python cho bạn:',
      timestamp: Date.now(),
      toolActivities: MOCK_TOOL_ACTIVITIES,
    },
  },
};

export const AIMessageStreamingActive: Story = {
  args: {
    message: {
      id: 'msg-5',
      role: 'assistant',
      content: 'QuickSort là thuật toán dựa trên phương pháp chia để trị...',
      timestamp: Date.now(),
      isStreaming: true,
    },
  },
};
