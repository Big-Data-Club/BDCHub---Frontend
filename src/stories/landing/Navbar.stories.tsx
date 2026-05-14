import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Navbar from '../../components/layout/Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Layout/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-[200vh]">
        <Story />
        <div className="p-20 text-center text-slate-500">Scroll down to see navbar background change</div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {};
