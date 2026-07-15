import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Alert } from '@/components/lms/shared/Alert';
import { Spinner } from '@/components/lms/shared/Spinner';
import { EmptyState } from '@/components/lms/shared/EmptyState';
import { Inbox, Plus } from 'lucide-react';
import { PrimaryBtn } from '@/components/lms/shared/Button';
import React from 'react';

const meta: Meta = {
  title: 'LMS/Components/Feedback',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Alerts: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 w-[600px]">
      <Alert type="info">
        Thông báo hệ thống: Bài kiểm tra tuần 3 đã được mở cho tất cả học viên.
      </Alert>
      <Alert type="success">
        Lưu tiến trình học tập thành công! Bạn nhận được thêm 5 điểm tích lũy.
      </Alert>
      <Alert type="warning">
        Thời hạn làm bài quiz còn 2 giờ. Vui lòng nộp bài đúng hạn để tránh mất điểm.
      </Alert>
      <Alert type="error">
        Không thể kết nối đến máy chủ LMS. Vui lòng kiểm tra lại mạng hoặc tải lại trang.
      </Alert>
    </div>
  ),
};

export const LoadingState: StoryObj = {
  render: () => (
    <div className="flex gap-4 items-center justify-center p-8 bg-slate-100 dark:bg-lms-input rounded-2xl w-[400px]">
      <Spinner className="w-8 h-8 border-4 text-blue-600 dark:text-cyan-400" />
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Đang tải dữ liệu khóa học...</span>
    </div>
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <div className="w-[600px] border border-dashed border-slate-300 dark:border-blue-500/10 rounded-2xl bg-white dark:bg-[#0F1E35]">
      <EmptyState
        icon={<Inbox className="w-12 h-12" />}
        title="Chưa có khóa học nào"
        description="Bạn chưa đăng ký tham gia khóa học nào trong học kỳ này."
        action={<PrimaryBtn size="sm" icon={<Plus className="w-4 h-4" />}>Khám phá khóa học</PrimaryBtn>}
      />
    </div>
  ),
};
