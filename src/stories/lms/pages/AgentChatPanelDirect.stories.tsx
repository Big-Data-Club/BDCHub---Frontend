import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { AgentChatPanel } from '@/components/lms/agent/AgentChatPanel';
import type { AgentMessage } from '@/types';
import {
  MOCK_TOOL_ACTIVITIES,
  RICH_MARKDOWN_SAMPLE,
} from '../mocks/chatFixtures';

const MOCK_MESSAGES: AgentMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'AI Mentor ơi, hãy giúp mình hiểu rõ thuật toán QuickSort!',
    timestamp: Date.now() - 1000 * 60 * 10,
  },
  {
    id: '2',
    role: 'assistant',
    content: RICH_MARKDOWN_SAMPLE,
    timestamp: Date.now() - 1000 * 60 * 9,
    toolActivities: MOCK_TOOL_ACTIVITIES,
  },
];

const MOCK_SESSIONS = [
  { session_id: 'sess-1', title: 'Thuật toán QuickSort & Luyện tập', created_at: new Date().toISOString(), last_active_at: new Date().toISOString(), agent_type: 'mentor', user_id: 1 },
];

const meta: Meta<typeof AgentChatPanel> = {
  title: 'LMS / Agent / AgentChatPanelDirect',
  component: AgentChatPanel,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full p-4 bg-[#050B18]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AgentChatPanel>;

export const DirectAgentChatPanelContainer: Story = {
  args: {
    agentType: 'mentor',
    defaultSidebarOpen: true,
    className: 'h-full',
  },
};

export const WithPreloadedMessages: Story = {
  args: {
    agentType: 'mentor',
    sessionId: 'sess-1',
    initialMessages: MOCK_MESSAGES,
    initialSessions: MOCK_SESSIONS,
    defaultSidebarOpen: true,
    className: 'h-full',
  },
};


