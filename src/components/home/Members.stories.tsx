import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Members from "./Members";

const meta: Meta<typeof Members> = {
  title: "Landing/Members",
  component: Members,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Members>;

export const Default: Story = {};
