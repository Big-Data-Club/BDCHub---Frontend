import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SessionProvider } from 'next-auth/react';
import { HeroActions } from './hero/HeroActions';

const meta: Meta<typeof HeroActions> = {
  title: 'Landing/Hero/Actions',
  component: HeroActions,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    actionsDuration: {
      control: { type: 'range', min: 0.1, max: 2.0, step: 0.05 },
      description: 'Thời lượng chạy hoạt ảnh các nút tương tác (giây)',
      table: {
        category: '⚡ Actions Motion',
      }
    },
    actionsYOffset: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Khoảng cách trượt thẳng đứng từ dưới lên của nút tương tác (px)',
      table: {
        category: '⚡ Actions Motion',
      }
    },
  },
  args: {
    actionsDuration: 0.6,
    actionsYOffset: 15,
  },
};

export default meta;
type Story = StoryObj<typeof HeroActions>;

// Story 1: Guest (Unauthenticated) Actions
export const GuestActions: Story = {
  name: 'Guest (Unauthenticated) Actions',
  args: {
    actionsDuration: 0.6,
    actionsYOffset: 15,
  },
};

// Story 2: Member (Authenticated) Actions
export const MemberActions: Story = {
  name: 'Member (Authenticated) Actions',
  decorators: [
    (Story) => (
      <SessionProvider
        session={{
          user: {
            name: 'BDC Member',
            email: 'member@bdc.org',
            role: 'member',
          },
          expires: '2026-12-31T23:59:59.999Z',
        }}
      >
        <Story />
      </SessionProvider>
    ),
  ],
  args: {
    actionsDuration: 0.6,
    actionsYOffset: 15,
  },
};
