import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { AgentChatPanel } from '@/components/lms/agent/AgentChatPanel';

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
