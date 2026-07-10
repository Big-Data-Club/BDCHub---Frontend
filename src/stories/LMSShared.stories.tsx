import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card } from '@/components/lms/shared/Card';
import { PrimaryBtn, SecondaryBtn, GhostBtn } from '@/components/lms/shared/Button';
import { Alert } from '@/components/lms/shared/Alert';
import { Badge } from '@/components/lms/shared/Badge';
import { StatCard } from '@/components/lms/shared/StatCard';
import { TabBar } from '@/components/lms/shared/TabBar';
import { ProgressBar } from '@/components/lms/shared/ProgressBar';
import { Shield, BookOpen, GraduationCap, ArrowRight, Zap, Play, Search, Sun, Moon } from 'lucide-react';
import React, { useState } from 'react';

// Wrapper component to demo interactive state
function InteractiveLMSDemo() {
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'buttons' | 'pilots'>('info');
  
  // Local theme state for texture library comparison
  const [isDarkTexture, setIsDarkTexture] = useState(true);

  return (
    <div className="w-[850px] p-8 rounded-3xl bg-slate-50 dark:bg-[#050B18] border border-slate-200 dark:border-blue-500/10 text-slate-900 dark:text-white transition-all">
      {/* Theme slide style tag to mimic systems ThemeToggle animation */}
      <style>{`
        @keyframes themeSlideUp {
          0% {
            transform: translateY(18px);
            opacity: 0;
            filter: blur(1.5px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
            filter: blur(0);
          }
        }
        .animate-theme-slide {
          animation: themeSlideUp 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Glow Spots in background simulation */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-[#070E1C] border border-slate-200/60 dark:border-blue-500/10 shadow-sm mb-6">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 dark:bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              LMS Shared Component Pilot
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Demonstrating 3D offsets, high contrast lines, and comic-style active states.
            </p>
          </div>
          <div className="flex-shrink-0">
            <TabBar
              active={activeTab}
              onChange={(id) => setActiveTab(id)}
              tabs={[
                { id: 'info', label: 'Alerts & Cards' },
                { id: 'stats', label: 'Stat Cards' },
                { id: 'buttons', label: 'Comic Buttons' },
                { id: 'pilots', label: '✨ 5 Advanced Comic Effects' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {activeTab === 'info' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Cards with Left Border Highlight */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card accentColor="cyan" className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                    Pilot Accent
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Cyan Highlight Card</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  This card utilizes the new `accentColor="cyan"` prop. Notice the vertical strip on the left adding visual anchor.
                </p>
                <div className="w-full bg-slate-100 dark:bg-lms-input rounded-xl p-3 border dark:border-blue-500/5">
                  <ProgressBar value={72} max={100} color="blue" label="Tiến trình học máy" />
                </div>
              </Card>

              <Card accentColor="green" className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30">
                    Success Accent
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Green Highlight Card</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Excellent for showing completed units or achievements. Highly recognizable contrast indicators.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Hoàn thành ngày 10/07/2026</span>
                  <Badge variant="green">Đã duyệt</Badge>
                </div>
              </Card>
            </div>

            {/* 3D Offset Role Card Simulation */}
            <div className="border border-slate-200/60 dark:border-blue-500/10 rounded-2xl p-6 bg-white dark:bg-lms-card">
              <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-4">
                3D Shift Hover Card (Comic Style Underlay)
              </h4>
              <div className="max-w-sm relative group cursor-pointer">
                {/* Underlay Offset */}
                <div className="absolute inset-0 bg-blue-600 dark:bg-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 translate-y-0 group-hover:translate-x-2 group-hover:translate-y-2" />

                {/* Card Top element */}
                <div className="relative z-10 p-6 rounded-2xl border border-slate-200 dark:border-blue-500/15 bg-white dark:bg-[#0F1E35] transition-all duration-300 transform translate-x-0 translate-y-0 group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 group-hover:border-blue-500/40 dark:group-hover:border-cyan-400/30 dark:group-hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-transparent dark:border-cyan-500/10 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-4 transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-base text-slate-900 dark:text-white mb-2 transition-colors group-hover:text-blue-600 dark:group-hover:text-cyan-400">
                    Học viên (Student)
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    Tham gia các lớp học công nghệ cao, nhận bài giảng AI tự động chấm và bài thực hành code.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 group-hover:gap-2.5 transition-all">
                    <span>Truy cập màn hình</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Accent border levels */}
            <div className="space-y-3">
              <Alert type="info">
                Thông tin hệ thống: Bài thi cuối kỳ Mạng Máy Tính sẽ mở tự động vào lúc 13:00 chiều nay.
              </Alert>
              <Alert type="warning">
                Lưu ý: Hãy nộp bài Lab 3 trước 23:59 tối nay để không bị trừ điểm tiến độ.
              </Alert>
              <Alert type="error">
                Lỗi chấm bài: Máy chủ chấm bài AI đang quá tải. Đang tự động xếp hàng thử lại.
              </Alert>
              <Alert type="success">
                Thành công: Bạn đã hoàn thành xuất sắc bài kiểm tra trắc nghiệm Đại Số Tuyến Tính!
              </Alert>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fadeIn">
            <StatCard
              accent="blue"
              label="Khóa học đang học"
              value="4"
              sub="2 khóa hoàn thành trong tháng"
              icon={<BookOpen className="w-5 h-5" />}
              trend={{ value: "12% so với tháng trước", up: true }}
            />
            <StatCard
              accent="green"
              label="Điểm rèn luyện đạt"
              value="92/100"
              sub="Mức xuất sắc"
              icon={<Shield className="w-5 h-5" />}
              trend={{ value: "5 điểm tuần này", up: true }}
            />
            <StatCard
              accent="purple"
              label="Thời gian tự học AI"
              value="24.5h"
              sub="Tăng tốc kiến thức nền"
              icon={<Zap className="w-5 h-5" />}
              trend={{ value: "2.4h hôm nay", up: true }}
            />
          </div>
        )}

        {activeTab === 'buttons' && (
          <div className="space-y-6 animate-fadeIn p-6 bg-white dark:bg-lms-card border border-slate-200 dark:border-blue-500/10 rounded-2xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Button States with Apple-scale Easing & Comic Colors
            </h3>

            <div className="flex flex-wrap gap-4 items-center">
              <PrimaryBtn icon={<Play className="w-4 h-4 fill-current" />}>
                Bắt đầu học ngay
              </PrimaryBtn>

              <SecondaryBtn>
                Xem chi tiết đề cương
              </SecondaryBtn>

              <GhostBtn>
                Bỏ qua bài này
              </GhostBtn>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-lms-input border border-slate-200/50 dark:border-blue-500/10 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Màu sắc Nút chính (Primary Button Glow)
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Ở Light Mode, nút chính có màu xanh dương gradient nhẹ đầy đặn. Ở Dark Mode, nút tự động chuyển sang màu **Cyan** dạ quang (`dark:from-cyan-500`) cực kỳ sắc nét trên nền tối của LMS, tối đa hóa tỷ lệ tương phản để hướng ánh mắt người học.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'pilots' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Effect 1: Hard Shadow Shift (Buttons & Badges) */}
            <div className="p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl">
              <h3 className="font-bold text-sm text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-4">
                1. Hiệu ứng "Hard Shadow Shift" (Bóng cứng & Nhấn lún)
              </h3>
              <div className="flex flex-wrap gap-6 items-center">
                {/* Comic Hard Shadow Button */}
                <button className="px-6 py-3 font-bold text-sm rounded-xl border-2 border-slate-900 bg-blue-600 text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:border-cyan-400 dark:bg-lms-input dark:text-cyan-400 dark:shadow-[3px_3px_0px_0px_rgba(34,211,238,0.3)] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer">
                  Nhấp vào tôi (Comic Click)
                </button>

                {/* Comic Hard Shadow Badge */}
                <span className="px-3 py-1 font-bold text-xs rounded-full border border-slate-900 bg-amber-400 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:border-cyan-400 dark:bg-[#0D192E] dark:text-cyan-300 dark:shadow-[2px_2px_0px_0px_rgba(34,211,238,0.2)]">
                  ⚡ HOT UPDATE
                </span>
              </div>
            </div>

            {/* Effect 2: Accent Line Draw (Section Headers & Tab Bars) */}
            <div className="p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl">
              <h3 className="font-bold text-sm text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-4">
                2. Hiệu ứng "Accent Line Draw" (Đường viền vẽ động khi Hover)
              </h3>
              <div className="space-y-6">
                {/* Header Draw */}
                <div className="group inline-block cursor-pointer">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Tiêu đề chương mục học tập
                  </h2>
                  {/* Decorative underline that expands on hover */}
                  <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left mt-1" />
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Rê chuột vào dòng tiêu đề phía trên để thấy nét kẻ chân màu sắc tự vẽ động từ trái qua phải.
                </p>
              </div>
            </div>

            {/* Effect 3: Background Textures Library */}
            <div className="p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="font-bold text-sm text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
                  3. Thư viện hiệu ứng nền (Background Textures Library)
                </h3>
                
                {/* Systems ThemeToggle Replacement styled identically to hpc summer school form */}
                <button
                  onClick={() => setIsDarkTexture(!isDarkTexture)}
                  className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 active:scale-95 transition-all duration-200 relative overflow-hidden flex items-center justify-center cursor-pointer border border-transparent dark:border-blue-500/10"
                  aria-label="Toggle theme"
                >
                  <span key={isDarkTexture ? "dark" : "light"} className="inline-flex animate-theme-slide">
                    {isDarkTexture ? <Sun size={15} /> : <Moon size={15} />}
                  </span>
                </button>
              </div>

              {/* Texture Cards Container: fixed neutral background to easily inspect contrast differences */}
              <div className={isDarkTexture ? "dark" : ""}>
                <div className="grid md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-200 dark:bg-slate-200 border border-slate-300 dark:border-slate-300 transition-colors duration-300">
                  
                  {/* Card A: Halftone Dot Overlay */}
                  <div className="space-y-2">
                    <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-cyan-400/20 group cursor-pointer bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
                      {/* Halftone dot pattern background */}
                      <div 
                        className="absolute inset-0 opacity-15 dark:opacity-25 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none group-hover:scale-110 group-hover:translate-x-1 group-hover:translate-y-1 transform duration-500 text-blue-600 dark:text-cyan-400"
                        style={{
                          backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)',
                          backgroundSize: '8px 8px',
                        }}
                      />
                      
                      {/* Card Content wrapper */}
                      <div className="relative p-5 h-full flex flex-col justify-end bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-slate-950/80 dark:via-slate-950/20 dark:to-transparent">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Style A</span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">Cấu trúc dữ liệu AI nâng cao</h4>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Hiệu ứng chấm in truyện tranh (Halftone Dots)
                    </p>
                  </div>

                  {/* Card B: Moving Grid (Role Selection style adjusted) */}
                  <div className="space-y-2">
                    <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-blue-500/20 group cursor-pointer bg-slate-100 dark:bg-[#050B18] text-slate-900 dark:text-white">
                      {/* Grid background utilizing sliding animation */}
                      <div 
                        className="absolute inset-0 opacity-15 dark:opacity-25 group-hover:opacity-45 transition-all duration-300 pointer-events-none bg-grid-paper animate-grid-slide group-hover:scale-[1.05]"
                        style={{
                          backgroundImage: 'linear-gradient(to right, rgba(6, 182, 212, 0.15) 1.5px, transparent 1.5px), linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1.5px, transparent 1.5px)',
                          backgroundSize: '20px 20px'
                        }}
                      />
                      
                      {/* Card Content wrapper */}
                      <div className="relative p-5 h-full flex flex-col justify-end bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-slate-950/80 dark:via-slate-950/20 dark:to-transparent">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Style B</span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">Tối ưu hóa học sâu với GPU</h4>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Lưới dịch chuyển không gian (Moving Learning Grid)
                    </p>
                  </div>

                </div>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                Nền đằng sau các Card được cố định ở màu xám trung tính (slate-200) để bạn dễ quan sát cách kết cấu của Card A và Card B tương thích và phát sáng trên nền cố định này.
              </p>
            </div>

            {/* Effect 4: Elastic Spring Back */}
            <div className="p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl">
              <h3 className="font-bold text-sm text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-4">
                4. Hiệu ứng "Elastic Spring Back" (Nảy lò xo khi Rê chuột)
              </h3>
              <div className="flex gap-6">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-blue-500/10 bg-slate-50 dark:bg-lms-input flex items-center gap-3 cursor-pointer group w-64">
                  {/* Icon with spring scale transition */}
                  <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">Bài kiểm tra siêu tốc</h4>
                    <p className="text-[10px] text-slate-400">10 câu hỏi ngắn • 5 phút</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                Hover vào khối bài kiểm tra để trải nghiệm icon sấm sét nảy mạnh lên kèm góc xoay đàn hồi vô cùng mượt mà.
              </p>
            </div>

            {/* Effect 5: Double Border / Ring Offset (Focus Ring) */}
            <div className="p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl">
              <h3 className="font-bold text-sm text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-4">
                5. Hiệu ứng "Double Border / Ring Offset" (Vòng mục tiêu khi focus ô nhập)
              </h3>
              <div className="max-w-xs space-y-2">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  {/* Focus ring class uses custom spacing to offset */}
                  <input
                    type="text"
                    placeholder="Tìm kiếm tài liệu học tập..."
                    className="w-full rounded-xl pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 focus:border-blue-600 dark:focus:border-cyan-400 transition-all duration-200 text-sm"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Nhấp chọn ô nhập liệu phía trên để thấy viền kép phát sáng mở rộng ra ngoài 4px tạo tiêu điểm thị giác.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'LMS/SharedComponentsPilot',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const ComponentPilotSuite: StoryObj = {
  render: () => <InteractiveLMSDemo />,
};
