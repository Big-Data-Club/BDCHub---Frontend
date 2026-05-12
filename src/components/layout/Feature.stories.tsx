import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Feature } from "./Feature";

const meta: Meta<typeof Feature> = {
  title: "Layout/Feature",
  component: Feature,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Feature>;

export const Default: Story = {
  args: {
    title: "Feature Title",
    desc: "This is a description of the feature.",
  },
};
