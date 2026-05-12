import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import MobileNav from "./MobileNav";

const meta: Meta<typeof MobileNav> = {
  title: "Layout/MobileNav",
  component: MobileNav,
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[375px] mx-auto border border-dashed border-slate-300 min-h-[600px] relative overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MobileNav>;

export const Default: Story = {};

export const Authenticated: Story = {
  parameters: {
    nextAuth: {
      session: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          role: "ADMIN",
        },
        expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      },
    },
  },
};
