import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Activities from '../../components/home/Activities';

const meta: Meta<typeof Activities> = {
  title: 'Landing/Activities',
  component: Activities,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Activities>;

export const Default: Story = {};
