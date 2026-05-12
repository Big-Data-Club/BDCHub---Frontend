import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import About from "./About";

const meta: Meta<typeof About> = {
  title: "Landing/About",
  component: About,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    animationDuration: {
      control: { type: "range", min: 100, max: 3000, step: 100 },
      description: "Thời gian chạy hiệu ứng (ms)",
    },
    animationDelay: {
      control: { type: "range", min: 0, max: 2000, step: 100 },
      description: "Thời gian chờ trước khi chạy (ms)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof About>;

export const Default: Story = {
  args: {
    animationDuration: 700,
    animationDelay: 0,
  },
};
