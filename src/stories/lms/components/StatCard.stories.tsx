import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatCard } from '@/components/lms/shared/StatCard';
import { BookOpen, Shield, Zap, Users, Clock, Award, CheckCircle2 } from 'lucide-react';
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
  name: 'Default Style (Left Accent Bar)',
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
  name: 'Comic/Retro Style (Hard Shadow)',
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

export const MinimalStyle: StoryObj = {
  name: 'Minimal Style (No Borders)',
  render: () => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 w-[800px]">
      <StatCard
        variant="minimal"
        accent="blue"
        label="Học viên hoạt động"
        value="1,248"
        sub="+142 học viên mới hôm nay"
        icon={<Users className="w-4 h-4" />}
      />
      <StatCard
        variant="minimal"
        accent="green"
        label="Tỷ lệ hoàn thành bài"
        value="88.2%"
        sub="Đạt mục tiêu tuần"
        icon={<CheckCircle2 className="w-4 h-4" />}
      />
      <StatCard
        variant="minimal"
        accent="orange"
        label="Thời gian trung bình"
        value="45 phút"
        sub="Mỗi lượt truy cập khóa học"
        icon={<Clock className="w-4 h-4" />}
      />
    </div>
  ),
};

export const GlassmorphicStyle: StoryObj = {
  name: 'Glassmorphic Style (Translucent Blur)',
  render: () => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 w-[800px] p-6 bg-slate-900 rounded-3xl">
      <StatCard
        variant="glassmorphic"
        accent="blue"
        label="Tổng chứng chỉ cấp"
        value="254"
        sub="Đồng bộ hệ thống blockchain"
        icon={<Award className="w-5 h-5" />}
        trend={{ value: "8% tăng trưởng", up: true }}
      />
      <StatCard
        variant="glassmorphic"
        accent="purple"
        label="Thời gian xử lý GPU"
        value="142h"
        sub="Học máy & Deep Learning"
        icon={<Zap className="w-5 h-5" />}
        trend={{ value: "1.2% tối ưu hóa", up: true }}
      />
      <StatCard
        variant="glassmorphic"
        accent="orange"
        label="Tỉ lệ phản hồi AI"
        value="0.4s"
        sub="Độ trễ thấp vượt trội"
        icon={<Clock className="w-5 h-5" />}
        trend={{ value: "0.1s nhanh hơn", up: true }}
      />
    </div>
  ),
};

export const ProgressStyle: StoryObj = {
  name: 'Progress Style (Built-in Progress)',
  render: () => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 w-[800px]">
      <StatCard
        variant="progress"
        accent="blue"
        label="Hoàn thành khóa AI/ML"
        value="8/10"
        sub="Chương học nền tảng"
        progress={80}
        icon={<BookOpen className="w-5 h-5" />}
      />
      <StatCard
        variant="progress"
        accent="green"
        label="Mục tiêu điểm rèn luyện"
        value="92/100"
        sub="Mức xuất sắc của học kỳ"
        progress={92}
        icon={<Shield className="w-5 h-5" />}
      />
      <StatCard
        variant="progress"
        accent="purple"
        label="Dự án thực hành Python"
        value="3/5"
        sub="Đang kiểm thử mã nguồn"
        progress={60}
        icon={<Zap className="w-5 h-5" />}
      />
    </div>
  ),
};

export const AccentBgStyle: StoryObj = {
  name: 'Accent Background Style (Soft Wash)',
  render: () => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 w-[800px]">
      <StatCard
        variant="accent-bg"
        accent="blue"
        label="Học bổng đạt được"
        value="3"
        sub="Đã phê duyệt hồ sơ"
        icon={<Award className="w-5 h-5" />}
        trend={{ value: "Tăng 1 suất", up: true }}
      />
      <StatCard
        variant="accent-bg"
        accent="orange"
        label="Cảnh báo học tập"
        value="2"
        sub="Trễ hạn nộp bài tập AI"
        icon={<Shield className="w-5 h-5" />}
        trend={{ value: "Hạn cuối: Hôm nay", up: false }}
      />
      <StatCard
        variant="accent-bg"
        accent="purple"
        label="Hội thảo kỹ năng"
        value="5"
        sub="Sự kiện sắp diễn ra"
        icon={<Users className="w-5 h-5" />}
        trend={{ value: "2 sự kiện đặc biệt", up: true }}
      />
    </div>
  ),
};

export const TrendEmphasisStyle: StoryObj = {
  name: 'Trend Emphasis Style (Pill Badges)',
  render: () => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 w-[800px]">
      <StatCard
        variant="trend-emphasis"
        accent="blue"
        label="Lượt truy cập LMS"
        value="4,821"
        sub="Tổng lượt trong 7 ngày qua"
        icon={<Users className="w-5 h-5" />}
        trend={{ value: "+24% tăng", up: true }}
      />
      <StatCard
        variant="trend-emphasis"
        accent="red"
        label="Tỷ lệ bỏ dở video"
        value="14.8%"
        sub="Học viên không hoàn thành xem"
        icon={<Clock className="w-5 h-5" />}
        trend={{ value: "-4% giảm", up: false }}
      />
      <StatCard
        variant="trend-emphasis"
        accent="green"
        label="Đánh giá tích cực"
        value="98.5%"
        sub="Phản hồi từ phiếu khảo sát"
        icon={<Award className="w-5 h-5" />}
        trend={{ value: "+1.2% tăng", up: true }}
      />
    </div>
  ),
};

export const InteractiveStyle: StoryObj = {
  name: 'Interactive Style (Press & Click Feedback)',
  render: () => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 w-[800px]">
      <StatCard
        variant="default"
        accent="blue"
        label="Bấm vào thẻ này"
        value="Bấm thử"
        sub="Có hiệu ứng đàn hồi & con trỏ"
        icon={<Zap className="w-5 h-5" />}
        interactive={true}
        onClick={() => alert("Bấm thành công!")}
      />
      <StatCard
        variant="comic"
        accent="purple"
        label="Bấm thẻ Comic"
        value="Comic Action"
        sub="Hiệu ứng lún nút truyện tranh"
        icon={<Shield className="w-5 h-5" />}
        interactive={true}
        onClick={() => alert("Comic Click!")}
      />
      <StatCard
        variant="glassmorphic"
        accent="green"
        label="Bấm thẻ Glass"
        value="Premium Glass"
        sub="Hiệu ứng hover phát sáng"
        icon={<BookOpen className="w-5 h-5" />}
        interactive={true}
        onClick={() => alert("Glass Click!")}
      />
    </div>
  ),
};
