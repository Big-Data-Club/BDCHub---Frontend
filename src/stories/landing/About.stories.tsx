import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import About from '../../components/home/About';

const meta: Meta<typeof About> = {
  title: 'Landing/About',
  component: About,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof About>;

export const Default: Story = {};
