import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SafeImage from "./SafeImage";

const meta: Meta<typeof SafeImage> = {
  title: "Common/SafeImage",
  component: SafeImage,
  tags: ["autodocs"],
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    width: { control: "number" },
    height: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof SafeImage>;

export const Default: Story = {
  args: {
    src: "https://api.dicebear.com/9.x/adventurer/png?seed=Felix",
    alt: "Avatar",
    width: 100,
    height: 100,
  },
};

export const Fallback: Story = {
  args: {
    src: "",
    alt: "Invalid Image",
    width: 100,
    height: 100,
  },
};
