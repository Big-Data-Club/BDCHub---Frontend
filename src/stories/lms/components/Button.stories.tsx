import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PrimaryBtn, SecondaryBtn, GhostBtn } from '@/components/lms/shared/Button';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import React from 'react';

const meta: Meta = {
  title: 'LMS/Components/Button',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Primary: StoryObj = {
  render: (args) => (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex gap-4 items-center">
        <PrimaryBtn size="sm" {...args}>Cơ bản (Small)</PrimaryBtn>
        <PrimaryBtn size="md" {...args}>Cơ bản (Medium)</PrimaryBtn>
        <PrimaryBtn size="lg" {...args}>Cơ bản (Large)</PrimaryBtn>
      </div>
      <div className="flex gap-4 items-center">
        <PrimaryBtn size="md" icon={<Plus className="w-4 h-4" />} {...args}>Thêm bài học</PrimaryBtn>
        <PrimaryBtn size="md" loading {...args}>Đang lưu</PrimaryBtn>
        <PrimaryBtn size="md" disabled {...args}>Vô hiệu hóa</PrimaryBtn>
      </div>
    </div>
  ),
  args: {},
};

export const Secondary: StoryObj = {
  render: (args) => (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex gap-4 items-center">
        <SecondaryBtn size="sm" {...args}>Hủy (Small)</SecondaryBtn>
        <SecondaryBtn size="md" {...args}>Hủy (Medium)</SecondaryBtn>
        <SecondaryBtn size="lg" {...args}>Hủy (Large)</SecondaryBtn>
      </div>
      <div className="flex gap-4 items-center">
        <SecondaryBtn size="md" icon={<ArrowRight className="w-4 h-4" />} {...args}>Tiếp tục</SecondaryBtn>
        <SecondaryBtn size="md" loading {...args}>Đang tải</SecondaryBtn>
        <SecondaryBtn size="md" disabled {...args}>Vô hiệu hóa</SecondaryBtn>
      </div>
    </div>
  ),
  args: {},
};

export const Ghost: StoryObj = {
  render: (args) => (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex gap-4 items-center">
        <GhostBtn size="sm" {...args}>Ẩn đi (Small)</GhostBtn>
        <GhostBtn size="md" {...args}>Ẩn đi (Medium)</GhostBtn>
        <GhostBtn size="lg" {...args}>Ẩn đi (Large)</GhostBtn>
      </div>
      <div className="flex gap-4 items-center">
        <GhostBtn size="md" icon={<Trash2 className="w-4 h-4" />} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" {...args}>Xóa bài</GhostBtn>
        <GhostBtn size="md" loading {...args}>Đang xử lý</GhostBtn>
        <GhostBtn size="md" disabled {...args}>Vô hiệu hóa</GhostBtn>
      </div>
    </div>
  ),
  args: {},
};
