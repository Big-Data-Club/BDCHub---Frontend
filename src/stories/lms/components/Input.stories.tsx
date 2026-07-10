import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from '@/components/lms/shared/Input';
import { Select } from '@/components/lms/shared/Select';
import { Search, Mail, Lock } from 'lucide-react';
import React from 'react';

const meta: Meta = {
  title: 'LMS/Components/Input',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const TextInputs: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 w-[400px]">
      <Input
        label="Tìm kiếm khóa học"
        placeholder="Nhập từ khóa tìm kiếm..."
        icon={<Search className="w-4 h-4" />}
      />

      <Input
        label="Địa chỉ Email"
        type="email"
        placeholder="username@example.com"
        icon={<Mail className="w-4 h-4" />}
      />

      <Input
        label="Mật khẩu"
        type="password"
        placeholder="••••••••"
        icon={<Lock className="w-4 h-4" />}
        error="Mật khẩu phải chứa ít nhất 8 ký tự"
      />
    </div>
  ),
};

export const SelectInputs: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 w-[400px]">
      <Select label="Chọn cấp độ bài học">
        <option value="beginner">Cơ bản (Beginner)</option>
        <option value="intermediate">Trung cấp (Intermediate)</option>
        <option value="advanced">Nâng cao (Advanced)</option>
      </Select>

      <Select label="Chọn môn học chính" error="Vui lòng chọn một môn học để tiếp tục">
        <option value="">-- Chưa chọn --</option>
        <option value="python">Python & Data Analytics</option>
        <option value="bigdata">Hadoop & Spark Architecture</option>
        <option value="ai">Deep Learning models</option>
      </Select>
    </div>
  ),
};
