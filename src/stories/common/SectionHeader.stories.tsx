import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SectionHeader from '../../components/common/SectionHeader';
import { BookOpen, Users, Zap, Rocket } from 'lucide-react';

const meta: Meta<typeof SectionHeader> = {
  title: 'Common/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const LeftAligned: Story = {
  args: {
    icon: BookOpen,
    title: 'Công Bố Khoa Học',
    centered: false,
  },
};

export const Centered: Story = {
  args: {
    icon: Users,
    title: 'Đội Ngũ Phát Triển',
    centered: true,
  },
};

export const About: Story = {
  args: {
    icon: Zap,
    title: 'Về Chúng Tôi',
    centered: false,
  },
};

export const Activities: Story = {
  args: {
    icon: Rocket,
    title: 'Hoạt Động Nổi Bật',
    centered: false,
  },
};
