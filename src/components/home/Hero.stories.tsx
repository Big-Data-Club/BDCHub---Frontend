import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Hero from "./Hero";

const meta: Meta<typeof Hero> = {
  title: "Landing/Hero",
  component: Hero,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

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
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
};
