import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HeroDescription } from './hero/HeroDescription';

const meta: Meta<typeof HeroDescription> = {
  title: 'Landing/Hero/Description',
  component: HeroDescription,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    descriptionDuration: {
      control: { type: 'range', min: 0.1, max: 2.0, step: 0.05 },
      description: 'Thời lượng chạy hoạt ảnh mô tả (giây)',
      table: {
        category: '📝 Description Motion',
      }
    },
    descriptionYOffset: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Khoảng cách trượt thẳng đứng từ dưới lên của mô tả (px)',
      table: {
        category: '📝 Description Motion',
      }
    },
  },
  args: {
    descriptionDuration: 0.6,
    descriptionYOffset: 15,
  },
};

export default meta;
type Story = StoryObj<typeof HeroDescription>;

export const IsolatedDescription: Story = {
  name: 'Isolated Description Animation',
  args: {
    descriptionDuration: 0.6,
    descriptionYOffset: 15,
  },
};
