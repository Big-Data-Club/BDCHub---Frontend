import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Action',
    className: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl active:scale-95 transition-all',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'outline',
    children: 'Secondary Action',
    className: 'rounded-xl active:scale-95 transition-all',
  },
};

export const AICyan: Story = {
  args: {
    children: 'AI Process',
    className: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl active:scale-95 transition-all border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]',
  },
};

export const Danger: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete Item',
    className: 'rounded-xl active:scale-95 transition-all',
  },
};
