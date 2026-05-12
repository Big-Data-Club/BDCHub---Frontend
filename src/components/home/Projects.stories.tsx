import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Projects from "./Projects";

const meta: Meta<typeof Projects> = {
  title: "Landing/Projects",
  component: Projects,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Projects>;

export const Default: Story = {};
