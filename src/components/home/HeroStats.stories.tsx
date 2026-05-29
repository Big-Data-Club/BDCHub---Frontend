import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { HeroVisualCore } from './hero/HeroVisualCore';
import { HeroStatsMobile } from './hero/HeroStatsMobile';

const meta: Meta<typeof HeroVisualCore> = {
  title: 'Landing/Hero/Stats',
  component: HeroVisualCore,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    statsDuration: {
      control: { type: 'range', min: 0.1, max: 2.0, step: 0.05 },
      description: 'Thời lượng chạy hoạt ảnh các thẻ số liệu thống kê (giây)',
      table: {
        category: '📊 Stats Cards Motion',
      }
    },
    statsYOffset: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Khoảng cách trượt thẳng đứng từ dưới lên của các thẻ số liệu (px)',
      table: {
        category: '📊 Stats Cards Motion',
      }
    },
  },
  args: {
    statsDuration: 0.7,
    statsYOffset: 15,
  },
};

export default meta;

// Story 1: Desktop Stats (HeroVisualCore)
export const DesktopStats: StoryObj<typeof HeroVisualCore> = {
  name: 'Desktop Stats (Floating Orbit)',
  render: (args) => (
    <div className="w-[1000px] h-[600px] flex items-center justify-center p-8 overflow-hidden relative">
      {/* Forcing flex layout to display desktop version irrespective of actual screen size */}
      <div className="w-full flex justify-center [&>div]:!flex [&>div]:w-full [&>div]:max-w-lg">
        <HeroVisualCore {...args} />
      </div>
    </div>
  ),
  args: {
    statsDuration: 0.7,
    statsYOffset: 15,
  },
};

// Story 2: Mobile Stats (HeroStatsMobile)
export const MobileStats: StoryObj<typeof HeroStatsMobile> = {
  name: 'Mobile Stats (2x2 Grid)',
  render: (args) => (
    <div className="w-full max-w-sm mx-auto p-6 flex flex-col [&>div]:!grid [&>div]:!pt-0 [&>div]:!mt-0">
      <HeroStatsMobile {...args} />
    </div>
  ),
  args: {
    statsDuration: 0.7,
    statsYOffset: 15,
  },
};

// Story 3: Interactive Replay (Animate Testing sandbox)
export const InteractiveReplay: StoryObj<typeof HeroVisualCore> = {
  name: '🔬 Test & Replay Animations',
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [animationKey, setAnimationKey] = useState(0);

    return (
      <div className="w-[1000px] h-[650px] flex flex-col items-center justify-between p-8 overflow-hidden relative">
        {/* Replay Controller Toolbar */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
          <button
            onClick={() => setAnimationKey((prev) => prev + 1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 border border-blue-500/30 transition-all duration-200 cursor-pointer"
          >
            🔄 Replay Animations
          </button>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            Triggers premium Apple-style scale rise, counter rise, & text blur
          </span>
        </div>

        {/* Component Sandbox */}
        <div className="w-full h-full flex items-center justify-center relative mt-8">
          <div className="w-full flex justify-center [&>div]:!flex [&>div]:w-full [&>div]:max-w-lg" key={animationKey}>
            <HeroVisualCore {...args} />
          </div>
        </div>
      </div>
    );
  },
  args: {
    statsDuration: 0.7,
    statsYOffset: 15,
  },
};
