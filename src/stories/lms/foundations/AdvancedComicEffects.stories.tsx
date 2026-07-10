import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatCard } from '@/components/lms/shared/StatCard';
import { Shield, BookOpen, Zap, Search, Sun, Moon } from 'lucide-react';
import React, { useState } from 'react';
import { LMS_EFFECT_DOCS } from './lms-effect-docs';

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
      <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;700&family=Nunito+Sans:ital,wght=0,300;0,400;0,600;0,700;1,400&family=Geist+Mono:wght@400;700&display=swap" rel="stylesheet" />

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

            {/* Systems ThemeToggle Replacement */}
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

        {/* Effect 2: Accent Line Draw & Options */}
        <div className="p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
              2. Tiêu đề & Thanh chọn (Headers & Tab Bars)
            </h3>

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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Option A • Accent Line Draw</span>
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
                  Rê chuột vào dòng tiêu đề để nét gạch chân tự vẽ động từ trái qua phải.
                </p>
              </div>

              <hr className="border-slate-300 dark:border-blue-500/10" />

              {/* Option B: Left Accent Bar Slide */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Option B • Left Accent Bar Slide</span>
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
                  Vạch đứng bên trái giãn dài ra và đổi màu highlight khi hover.
                </p>
              </div>

              <hr className="border-slate-300 dark:border-blue-500/10" />

              {/* Option C: Comic Folder Tab */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Option C • Comic Folder Tab</span>
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

          <div className={isDarkTexture ? "dark" : ""}>
            <div className="grid md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-200 dark:bg-slate-200 border border-slate-300 dark:border-slate-300 transition-colors duration-300">

              {/* Card A: Halftone Dot Overlay */}
              <div className="space-y-2">
                <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-cyan-400/20 group cursor-pointer bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
                  <div
                    className="absolute -inset-10 opacity-30 dark:opacity-45 group-hover:opacity-65 transition-all duration-300 pointer-events-none transform rotate-[10deg] animate-grid-slide group-hover:scale-105 text-blue-600 dark:text-cyan-400"
                    style={{
                      backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  <div className="relative p-5 h-full flex flex-col justify-end bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-slate-950/80 dark:via-slate-950/20 dark:to-transparent">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Style A</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Cấu trúc dữ liệu AI nâng cao</h4>
                  </div>
                </div>
              </div>

              {/* Card B: Moving Grid */}
              <div className="space-y-2">
                <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-blue-500/20 group cursor-pointer bg-slate-100 dark:bg-[#050B18] text-slate-900 dark:text-white">
                  <div className="absolute -inset-10 opacity-60 dark:opacity-50 group-hover:opacity-85 transition-all duration-300 pointer-events-none bg-grid-paper animate-grid-slide transform rotate-[10deg] group-hover:scale-105" />
                  <div className="relative p-5 h-full flex flex-col justify-end bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-slate-950/80 dark:via-slate-950/20 dark:to-transparent">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Style B</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Tối ưu hóa học sâu với GPU</h4>
                  </div>
                </div>
              </div>

            </div>
          </div>
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
              <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">Bài kiểm tra siêu tốc</h4>
                <p className="text-[10px] text-slate-400">10 câu hỏi ngắn • 5 phút</p>
              </div>
            </div>
          </div>
        </div>

        {/* Effect 5: Double Border / Ring Offset */}
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
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu học tập..."
                className="w-full rounded-xl pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 focus:border-blue-600 dark:focus:border-cyan-400 transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Effect 6: Comic Stat Cards */}
        <div className="p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
              6. Thẻ số liệu Comic (Comic Stat Cards)
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
              Hiệu ứng: Comic Stat Card (Thẻ số liệu tương tác nâng cao)
            </p>
            <button
              onClick={() => setSelectedDocKey('comic-stat-card')}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded border border-slate-300 dark:border-blue-500/20 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors"
            >
              <BookOpen size={11} className="mr-1 inline" />
              Tài liệu
            </button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
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

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🎨</span> Thẩm mỹ & Phong cách thiết kế
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0D192E]/40 p-3 rounded-xl border border-slate-100 dark:border-blue-500/5">
                  {LMS_EFFECT_DOCS[selectedDocKey].aesthetics}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span>💻</span> Chi tiết kỹ thuật (Tailwind & Param)
                </h4>
                <div className="space-y-2 text-[11px] font-mono leading-relaxed bg-slate-900 text-slate-300 p-3.5 rounded-xl overflow-x-auto border border-blue-500/10">
                  <div className="text-cyan-400 font-bold">Các class Tailwind cốt lõi:</div>
                  <pre className="whitespace-pre-wrap">{LMS_EFFECT_DOCS[selectedDocKey].technical.classes}</pre>
                  <div className="text-cyan-400 font-bold mt-2">Thông số tối ưu:</div>
                  <pre className="whitespace-pre-wrap">{LMS_EFFECT_DOCS[selectedDocKey].technical.parameters}</pre>
                </div>
              </div>

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
  title: 'LMS/Foundations/AdvancedComicEffects',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const AdvancedComicEffects: StoryObj = {
  render: () => <AdvancedComicEffectsDemo />,
};
