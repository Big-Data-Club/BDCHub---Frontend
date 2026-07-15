/* eslint-disable @next/next/no-page-custom-font */
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
import { LMS_EFFECT_DOCS } from './lms-effect-docs';

// Wrapper component to demo interactive state
function InteractiveLMSDemo() {
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'buttons'>('info');

  return (
    <div className="w-[850px] p-8 rounded-3xl bg-slate-50 dark:bg-[#050B18] border border-slate-200 dark:border-blue-500/10 text-slate-900 dark:text-white transition-all lms-storybook-wrapper antialiased">
      {/* HTML link tags to guarantee Google Fonts are loaded in Storybook */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;700&family=Nunito+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Geist+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Theme slide style tag to mimic systems ThemeToggle animation and enforce font-family rules */}
      <style>{`
        .lms-storybook-wrapper {
          font-family: 'Nunito Sans', sans-serif !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .lms-storybook-wrapper h1,
        .lms-storybook-wrapper h2,
        .lms-storybook-wrapper h3,
        .lms-storybook-wrapper h4,
        .lms-storybook-wrapper h5,
        .lms-storybook-wrapper h6 {
          font-family: 'Comfortaa', sans-serif !important;
        }
        .lms-storybook-wrapper pre,
        .lms-storybook-wrapper code,
        .lms-storybook-wrapper .font-mono {
          font-family: 'Geist Mono', monospace !important;
        }

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
              onChange={(id: any) => setActiveTab(id)}
              tabs={[
                { id: 'info', label: 'Alerts & Cards' },
                { id: 'stats', label: 'Stat Cards' },
                { id: 'buttons', label: 'Comic Buttons' },
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
                  This card utilizes the new `accentColor=&quot;cyan&quot;` prop. Notice the vertical strip on the left adding visual anchor.
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
      </div>
    </div>
  );
}

// Separate component for the Advanced Comic Effects story
function AdvancedComicEffectsDemo() {
  const [isDarkShadow, setIsDarkShadow] = useState(false);
  const [isDarkLineDraw, setIsDarkLineDraw] = useState(false);
  const [isDarkTexture, setIsDarkTexture] = useState(false);
  const [selectedDocKey, setSelectedDocKey] = useState<string | null>(null);

  return (
    <div className="w-[850px] p-8 rounded-3xl bg-slate-50 dark:bg-[#050B18] border border-slate-200 dark:border-blue-500/10 text-slate-900 dark:text-white transition-all lms-storybook-wrapper antialiased relative">
      {/* HTML link tags to guarantee Google Fonts are loaded in Storybook */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;700&family=Nunito+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Geist+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Theme slide style tag to mimic systems ThemeToggle animation and enforce font-family rules */}
      <style>{`
        .lms-storybook-wrapper {
          font-family: 'Nunito Sans', sans-serif !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .lms-storybook-wrapper h1,
        .lms-storybook-wrapper h2,
        .lms-storybook-wrapper h3,
        .lms-storybook-wrapper h4,
        .lms-storybook-wrapper h5,
        .lms-storybook-wrapper h6 {
          font-family: 'Comfortaa', sans-serif !important;
        }
        .lms-storybook-wrapper pre,
        .lms-storybook-wrapper code,
        .lms-storybook-wrapper .font-mono {
          font-family: 'Geist Mono', monospace !important;
        }

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

      {/* Header for standalone story */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-[#070E1C] border border-slate-200/60 dark:border-blue-500/10 shadow-sm mb-6">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 dark:bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            ✨ Advanced Comic Effects
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tổng hợp các hiệu ứng Comic tương tác nâng cao dành riêng cho các thành phần của LMS.
          </p>
        </div>
      </div>

      <div className="space-y-8 animate-fadeIn">
        {/* Effect 1: Hard Shadow Shift (Buttons & Badges) */}
        <div className="p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
              1. Nút bấm & Huy hiệu (Buttons & Badges)
            </h3>

            {/* Systems ThemeToggle Replacement styled identically to section 3 */}
            <button
              onClick={() => setIsDarkShadow(!isDarkShadow)}
              className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 active:scale-95 transition-all duration-200 relative overflow-hidden flex items-center justify-center cursor-pointer border border-transparent dark:border-blue-500/10"
              aria-label="Toggle theme"
            >
              <span key={isDarkShadow ? "dark" : "light"} className="inline-flex animate-theme-slide">
                {isDarkShadow ? <Sun size={15} /> : <Moon size={15} />}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
              Hiệu ứng: Hard Shadow Shift (Bóng cứng & Nhấn lún)
            </p>
            <button
              onClick={() => setSelectedDocKey('hard-shadow-shift')}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded border border-slate-300 dark:border-blue-500/20 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors"
            >
              <BookOpen size={11} className="mr-1 inline" />
              Tài liệu
            </button>
          </div>

          <div className={isDarkShadow ? "dark" : ""}>
            <div className="flex flex-wrap gap-6 items-center p-6 rounded-2xl bg-slate-200 dark:bg-[#050B18] border border-slate-300 dark:border-blue-500/10 transition-colors duration-300">
              {/* Comic Hard Shadow Button */}
              <button className="px-6 py-3 font-bold text-sm rounded-xl border-2 border-slate-900 bg-blue-600 text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:border-cyan-400 dark:bg-lms-input dark:text-cyan-400 dark:shadow-[3px_3px_0px_0px_rgba(34,211,238,1)] transition-all duration-200 hover:bg-blue-700 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:bg-cyan-400/10 dark:hover:shadow-[4px_4px_0px_0px_rgba(34,211,238,1)] active:duration-50 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)] dark:active:shadow-[0px_0px_0px_0px_rgba(34,211,238,1)] cursor-pointer font-bold">
                Nhấp vào tôi (Comic Click)
              </button>

              {/* Comic Hard Shadow Badge */}
              <span className="px-3 py-1 font-bold text-xs rounded-full border border-slate-900 bg-amber-400 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:border-cyan-400 dark:bg-[#0D192E] dark:text-cyan-300 dark:shadow-[2px_2px_0px_0px_rgba(34,211,238,1)] font-bold">
                ⚡ HOT UPDATE
              </span>
            </div>
          </div>
        </div>

        {/* Effect 2: Accent Line Draw (Section Headers & Tab Bars) */}
        <div className="p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
              2. Tiêu đề & Thanh chọn (Headers & Tab Bars)
            </h3>

            {/* Systems ThemeToggle Replacement styled identically to section 3 */}
            <button
              onClick={() => setIsDarkLineDraw(!isDarkLineDraw)}
              className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 active:scale-95 transition-all duration-200 relative overflow-hidden flex items-center justify-center cursor-pointer border border-transparent dark:border-blue-500/10"
              aria-label="Toggle theme"
            >
              <span key={isDarkLineDraw ? "dark" : "light"} className="inline-flex animate-theme-slide">
                {isDarkLineDraw ? <Sun size={15} /> : <Moon size={15} />}
              </span>
            </button>
          </div>

          <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 mb-4 uppercase tracking-wider">
            Các tùy chọn hiệu ứng tiêu đề & thanh chọn tương tác
          </p>

          <div className={isDarkLineDraw ? "dark" : ""}>
            <div className="space-y-8 p-6 rounded-2xl bg-slate-200 dark:bg-[#050B18] border border-slate-300 dark:border-blue-500/10 transition-colors duration-300">
              
              {/* Option A: Accent Line Draw */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Option A • Accent Line Draw (Đường kẻ viền vẽ động)</span>
                  <button
                    onClick={() => setSelectedDocKey('accent-line-draw')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded border border-slate-300 dark:border-blue-500/20 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    <BookOpen size={9} className="mr-0.5 inline" />
                    Tài liệu
                  </button>
                </div>
                <div className="group inline-block cursor-pointer">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Tiêu đề chương mục học tập
                  </h2>
                  <div className="h-0.5 w-full bg-blue-600 dark:bg-cyan-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right group-hover:origin-left mt-1" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rê chuột vào dòng tiêu đề để nét gạch chân tự vẽ động từ trái qua phải, biến mất đuổi theo cùng chiều khi rời chuột.
                </p>
              </div>

              <hr className="border-slate-300 dark:border-blue-500/10" />

              {/* Option B: Left Accent Bar Slide */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Option B • Left Accent Bar Slide (Vạch đứng co giãn & Đẩy chữ)</span>
                  <button
                    onClick={() => setSelectedDocKey('left-accent-slide')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded border border-slate-300 dark:border-blue-500/20 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    <BookOpen size={9} className="mr-0.5 inline" />
                    Tài liệu
                  </button>
                </div>
                <div className="group flex items-center gap-2.5 cursor-pointer inline-flex">
                  <div className="w-1.5 h-5 bg-blue-600/30 dark:bg-cyan-400/20 rounded-full group-hover:h-7 group-hover:bg-blue-600 group-hover:dark:bg-cyan-400 transition-all duration-300 origin-center" />
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white transform group-hover:translate-x-1.5 transition-transform duration-300">
                    Khối kiến thức cốt lõi
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vạch chỉ định bên trái giãn dài ra và đổi màu highlight đậm nét khi hover, đồng thời đẩy chữ dịch chuyển nhẹ sang phải.
                </p>
              </div>

              <hr className="border-slate-300 dark:border-blue-500/10" />

              {/* Option C: Comic Folder Tab */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Option C • Comic Folder Tab (Thẻ thanh chọn nhấc lên)</span>
                  <button
                    onClick={() => setSelectedDocKey('comic-folder-tab')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded border border-slate-300 dark:border-blue-500/20 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    <BookOpen size={9} className="mr-0.5 inline" />
                    Tài liệu
                  </button>
                </div>
                <div className="bg-slate-100 dark:bg-[#0D192E] p-1.5 rounded-2xl border border-slate-300/80 dark:border-blue-500/15 flex gap-2 max-w-sm transition-all">
                  <button className="px-4 py-2 font-bold text-xs rounded-xl border-2 border-slate-900 bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:border-cyan-400 dark:bg-[#050B18] dark:text-cyan-400 dark:shadow-[2px_2px_0px_0px_rgba(34,211,238,1)] cursor-pointer">
                    Bài học
                  </button>
                  <button className="px-4 py-2 font-bold text-xs rounded-xl border border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0F1E35] hover:border-2 hover:border-slate-900 dark:hover:border-cyan-400 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(34,211,238,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-200 cursor-pointer">
                    Bài tập
                  </button>
                  <button className="px-4 py-2 font-bold text-xs rounded-xl border border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#0F1E35] hover:border-2 hover:border-slate-900 dark:hover:border-cyan-400 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(34,211,238,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-200 cursor-pointer">
                    Tài liệu
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Thanh chọn tích hợp thanh dock bảo vệ. Tab phụ khi được hover sẽ chuyển đổi nhanh từ dạng phẳng sang dạng khối 3D nổi bật.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Effect 3: Background Textures Library */}
        <div className="p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
              3. Cấu trúc họa tiết nền (Background Textures)
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

          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
              Hiệu ứng: Họa tiết bán sắc & Lưới trượt (Halftone Dots & Moving Grid)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDocKey('halftone-dot')}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded border border-slate-300 dark:border-blue-500/20 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors"
              >
                <BookOpen size={11} className="mr-1 inline" />
                Tài liệu A
              </button>
              <button
                onClick={() => setSelectedDocKey('moving-grid')}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded border border-slate-300 dark:border-blue-500/20 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors"
              >
                <BookOpen size={11} className="mr-1 inline" />
                Tài liệu B
              </button>
            </div>
          </div>

          {/* Texture Cards Container: fixed neutral background to easily inspect contrast differences */}
          <div className={isDarkTexture ? "dark" : ""}>
            <div className="grid md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-200 dark:bg-slate-200 border border-slate-300 dark:border-slate-300 transition-colors duration-300">

              {/* Card A: Halftone Dot Overlay */}
              <div className="space-y-2">
                <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-cyan-400/20 group cursor-pointer bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
                  {/* Tilted Halftone dot pattern background: rotated 10deg, background size 20px for density, dots size 2px for clear visibility */}
                  <div
                    className="absolute -inset-10 opacity-30 dark:opacity-45 group-hover:opacity-65 transition-all duration-300 pointer-events-none transform rotate-[10deg] animate-grid-slide group-hover:scale-105 text-blue-600 dark:text-cyan-400"
                    style={{
                      backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)',
                      backgroundSize: '20px 20px',
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
                  {/* Tilted Grid background utilizing the exact global css class bg-grid-paper (40px 40px) and slide animation */}
                  <div className="absolute -inset-10 opacity-60 dark:opacity-50 group-hover:opacity-85 transition-all duration-300 pointer-events-none bg-grid-paper animate-grid-slide transform rotate-[10deg] group-hover:scale-105" />

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
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
              4. Các thành phần tương tác động (Interactive Elements)
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
              Hiệu ứng: Elastic Spring Back (Nảy lò xo khi Rê chuột)
            </p>
            <button
              onClick={() => setSelectedDocKey('elastic-spring')}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded border border-slate-300 dark:border-blue-500/20 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors"
            >
              <BookOpen size={11} className="mr-1 inline" />
              Tài liệu
            </button>
          </div>

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
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
              5. Ô nhập liệu (Input Fields)
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
              Hiệu ứng: Double Border / Ring Offset (Vòng mục tiêu khi focus ô nhập)
            </p>
            <button
              onClick={() => setSelectedDocKey('double-border-ring')}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded border border-slate-300 dark:border-blue-500/20 text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors"
            >
              <BookOpen size={11} className="mr-1 inline" />
              Tài liệu
            </button>
          </div>

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

      {/* Documentation Modal */}
      {selectedDocKey && LMS_EFFECT_DOCS[selectedDocKey] && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0F1E35] border-2 border-slate-900 dark:border-cyan-400/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-theme-slide">
            <button
              onClick={() => setSelectedDocKey(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <span className="text-sm font-bold">✕</span>
            </button>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">Tài liệu hiệu ứng</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {LMS_EFFECT_DOCS[selectedDocKey].title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  {LMS_EFFECT_DOCS[selectedDocKey].subTitle}
                </p>
              </div>

              <hr className="border-slate-200 dark:border-slate-400/8" />

              {/* Part 1: Aesthetics */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🎨</span> Thẩm mỹ & Phong cách thiết kế
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0D192E]/40 p-3 rounded-xl border border-slate-100 dark:border-blue-500/5">
                  {LMS_EFFECT_DOCS[selectedDocKey].aesthetics}
                </p>
              </div>

              {/* Part 2: Technical */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span>💻</span> Chi tiết kỹ thuật (Tailwind & Param)
                </h4>
                <div className="space-y-2 text-[11px] font-mono leading-relaxed bg-slate-900 text-slate-300 p-3.5 rounded-xl overflow-x-auto border border-blue-500/10">
                  <div className="text-cyan-400 font-bold">{"// Các class Tailwind cốt lõi:"}</div>
                  <pre className="whitespace-pre-wrap">{LMS_EFFECT_DOCS[selectedDocKey].technical.classes}</pre>
                  <div className="text-cyan-400 font-bold mt-2">{"// Thông số tối ưu:"}</div>
                  <pre className="whitespace-pre-wrap">{LMS_EFFECT_DOCS[selectedDocKey].technical.parameters}</pre>
                </div>
              </div>

              {/* Part 3: Code Snippet */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🛠️</span> Code mẫu triển khai (JSX)
                </h4>
                <pre className="text-[10px] font-mono bg-slate-950 text-emerald-400 p-3.5 rounded-xl overflow-x-auto border border-emerald-500/10 whitespace-pre">
                  {LMS_EFFECT_DOCS[selectedDocKey].technical.code}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedDocKey(null)}
                className="px-4 py-2 font-bold text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer active:scale-95 transition-all"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
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

export const AdvancedComicEffects: StoryObj = {
  render: () => <AdvancedComicEffectsDemo />,
};
