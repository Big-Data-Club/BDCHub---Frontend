import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TabBar } from '@/components/lms/shared/TabBar';
import { ProgressBar } from '@/components/lms/shared/ProgressBar';
import React, { useState } from 'react';

const meta: Meta = {
  title: 'LMS/Components/Navigation & Progress',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

function InteractiveTabBar() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'exercises' | 'discussions'>('lessons');
  const tabs = [
    { id: 'lessons' as const, label: 'Bài học', badge: 12 },
    { id: 'exercises' as const, label: 'Bài tập', badge: 4 },
    { id: 'discussions' as const, label: 'Thảo luận', badge: 999 },
  ];

  return (
    <div className="w-[500px] p-6 border border-slate-200 dark:border-blue-500/10 rounded-2xl bg-white dark:bg-[#0F1E35]">
      <h4 className="text-sm font-bold mb-4 text-slate-800 dark:text-white">Thanh Chọn Tab Tương Tác</h4>
      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Đang hiển thị tab: <span className="font-bold text-blue-600 dark:text-cyan-400">{activeTab.toUpperCase()}</span>
      </div>
    </div>
  );
}

export const TabNavigation: StoryObj = {
  render: () => <InteractiveTabBar />,
};

export const ProgressBars: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 w-[500px] p-6 border border-slate-200 dark:border-blue-500/10 rounded-2xl bg-white dark:bg-[#0F1E35]">
      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Thành phần tiến trình (Progress Bar)</h4>
      <ProgressBar value={30} max={100} color="blue" label="Tiến độ học Python" />
      <ProgressBar value={75} max={100} color="green" label="Bài tập thực hành hoàn thành" />
      <ProgressBar value={90} max={100} color="purple" label="Thời lượng xem Video" />
      <ProgressBar value={10} max={100} color="orange" label="Kiểm tra trắc nghiệm" />
    </div>
  ),
};
