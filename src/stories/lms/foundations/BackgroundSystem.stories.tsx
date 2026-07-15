import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

function BackgroundSystemDemo() {
  return (
    <div className="relative w-[850px] h-[500px] border border-slate-300 dark:border-blue-500/10 rounded-3xl overflow-hidden bg-slate-50 dark:bg-[#050B18] transition-colors duration-300">
      {/* 1. Ambient Glow Spots */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-blue-500/10 dark:bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 dark:bg-blue-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* 2. Moving Grid Background */}
      <div className="absolute inset-0 bg-grid-paper pointer-events-none opacity-80 dark:opacity-60 rotate-[10deg] animate-grid-slide" />

      {/* 3. Radial Gradient Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(248,250,252,0.7)_80%,#f8fafc_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,11,24,0.7)_80%,#050B18_100%)] pointer-events-none" />

      {/* 4. Inside Content Card to show contrast */}
      <div className="absolute inset-10 flex flex-col justify-between items-center text-center p-8 z-10">
        <div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-cyan-950/40 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30 uppercase tracking-widest">
            Atmospheric Background
          </span>
          <h3 className="text-2xl font-extrabold mt-4 text-slate-900 dark:text-white font-Comfortaa">
            LMS Background System
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Hệ thống hình nền động giúp giao diện có chiều sâu cơ học, hạn chế phân tâm thị giác nhờ elliptical vignette overlay.
          </p>
        </div>

        <div className="w-full max-w-sm p-6 bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-md border border-slate-200 dark:border-blue-500/15 rounded-2xl shadow-sm text-left">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">Thành phần kỹ thuật:</h4>
          <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400 font-mono">
            <li>• Lưới nghiêng: bg-grid-paper (rotate-[10deg])</li>
            <li>• Hiệu ứng trượt: animate-grid-slide</li>
            <li>• Glow trái: bg-blue-500/10 / bg-cyan-500/5</li>
            <li>• Glow phải: bg-purple-500/10 / bg-blue-500/5</li>
            <li>• Vignette: ellipse radial-gradient</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'LMS/Foundations/BackgroundSystem',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const BackgroundSystem: StoryObj = {
  render: () => <BackgroundSystemDemo />,
};
