import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LandingPage from '../../app/(landing)/page';
import LandingLayout from '../../app/(landing)/layout';

const meta: Meta<typeof LandingPage> = {
  title: 'Pages/LandingPage',
  component: LandingPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <LandingLayout>
        <Story />
      </LandingLayout>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LandingPage>;

export const Default: Story = {};
