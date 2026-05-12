import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Navbar from "./Navbar";

const meta: Meta<typeof Navbar> = {
  title: "Layout/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {};

export const Authenticated: Story = {
  parameters: {
    nextAuth: {
      session: {
        user: {
          name: "Admin User",
          email: "admin@bdchub.com",
          role: "admin",
        },
        expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      },
    },
  },
};
