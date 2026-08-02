import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import { AgentInputBar } from '@/components/lms/agent/AgentInputBar';

const meta: Meta<typeof AgentInputBar> = {
  title: 'LMS / AI Mentor / Chat / AgentInputBar',
  component: AgentInputBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-white rounded-2xl max-w-2xl border border-slate-200 dark:border-blue-500/10">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AgentInputBar>;

export const DefaultEmpty: Story = {
  args: {
    onSend: (msg) => alert(`Sent: ${msg}`),
    isStreaming: false,
    onStop: () => {},
    placeholder: 'Hỏi AI Mentor về bài học, bài tập hoặc thuật toán...',
  },
};

export const StreamingActive: Story = {
  args: {
    onSend: () => {},
    isStreaming: true,
    onStop: () => alert('Stopped generation!'),
    placeholder: 'AI Mentor đang trả lời...',
  },
};

export const InteractiveInputState: Story = {
  render: () => {
    const [isStreaming, setIsStreaming] = useState(false);

    const handleSend = (text: string) => {
      if (!text.trim()) return;
      setIsStreaming(true);
      setTimeout(() => {
        setIsStreaming(false);
      }, 2000);
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Trạng thái: {isStreaming ? 'Đang tạo phản hồi (Streaming)...' : 'Sẵn sàng'}</span>
        </div>
        <AgentInputBar
          onSend={handleSend}
          isStreaming={isStreaming}
          onStop={() => setIsStreaming(false)}
          placeholder="Nhập tin nhắn..."
        />
      </div>
    );
  },
};
