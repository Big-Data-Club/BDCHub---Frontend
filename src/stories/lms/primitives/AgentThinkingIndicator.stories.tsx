import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import { AgentThinkingIndicator } from '@/components/lms/agent/AgentThinkingIndicator';
import { MOCK_THINKING_STEPS } from '../mocks/chatFixtures';

const meta: Meta<typeof AgentThinkingIndicator> = {
  title: 'LMS / AI Mentor / Primitives / ThinkingIndicator',
  component: AgentThinkingIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-white rounded-2xl max-w-md border border-slate-200 dark:border-blue-500/10">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AgentThinkingIndicator>;

export const DefaultThinking: Story = {
  args: {
    steps: [{ step: 'intent' }],
  },
};

export const CustomThinkingMessage: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Đang truy vấn tài liệu</div>
      <AgentThinkingIndicator steps={[{ step: 'Searching course knowledge base' }]} />
    </div>
  ),
};

export const MultiStepThinkingProcess: Story = {
  render: () => {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AgentThinkingIndicator steps={MOCK_THINKING_STEPS} />
        </div>
      </div>
    );
  },
};
