import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatCard } from '@/components/lms/shared/StatCard';
import { BookOpen, Shield, Zap } from 'lucide-react';
import React from 'react';

const meta: Meta = {
  title: 'LMS/Components/StatCard',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const DefaultStyle: StoryObj = {
  render: () => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 w-[800px]">
      <StatCard
        variant="default"
        accent="blue"
        label="Khóa học đang học"
        value="4"
        sub="2 khóa hoàn thành trong tháng"
        icon={<BookOpen className="w-5 h-5" />}
        trend={{ value: "12% so với tháng trước", up: true }}
      />
      <StatCard
        variant="default"
        accent="green"
        label="Điểm rèn luyện đạt"
        value="92/100"
        sub="Mức xuất sắc"
        icon={<Shield className="w-5 h-5" />}
        trend={{ value: "5 điểm tuần này", up: true }}
      />
      <StatCard
        variant="default"
        accent="purple"
        label="Thời gian tự học AI"
        value="24.5h"
        sub="Tăng tốc kiến thức nền"
        icon={<Zap className="w-5 h-5" />}
        trend={{ value: "2.4h hôm nay", up: true }}
      />
    </div>
  ),
};

export const ComicStyle: StoryObj = {
  render: () => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 w-[800px]">
      <StatCard
        variant="comic"
        accent="blue"
        label="Khóa học đang học"
        value="4"
        sub="2 khóa hoàn thành trong tháng"
        icon={<BookOpen className="w-5 h-5" />}
        trend={{ value: "12% so với tháng trước", up: true }}
      />
      <StatCard
        variant="comic"
        accent="green"
        label="Điểm rèn luyện đạt"
        value="92/100"
        sub="Mức xuất sắc"
        icon={<Shield className="w-5 h-5" />}
        trend={{ value: "5 điểm tuần này", up: true }}
      />
      <StatCard
        variant="comic"
        accent="purple"
        label="Thời gian tự học AI"
        value="24.5h"
        sub="Tăng tốc kiến thức nền"
        icon={<Zap className="w-5 h-5" />}
        trend={{ value: "2.4h hôm nay", up: true }}
      />
    </div>
  ),
};
