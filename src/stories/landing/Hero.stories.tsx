import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Hero from '../../components/home/Hero';

const meta: Meta<typeof Hero> = {
  title: 'Landing/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Default: Story = {};
