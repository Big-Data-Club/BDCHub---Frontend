import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useArgs } from 'storybook/preview-api';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles, Clock } from 'lucide-react';
import { HeroTitle, HeroTitleProps } from './hero/HeroTitle';

export interface StorybookTitleProps extends Omit<HeroTitleProps, 'ease'> {
  easePreset: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const getComputedEase = (preset: string, x1: number, y1: number, x2: number, y2: number): [number, number, number, number] => {
  if (preset.startsWith('Apple Keynote')) {
    return [0.18, 1, 0.32, 1];
  } else if (preset.startsWith('Out Expo')) {
    return [0.16, 1, 0.3, 1];
  } else if (preset.startsWith('Back Out')) {
    return [0.34, 1.56, 0.64, 1];
  } else if (preset.startsWith('Classic Ease-in-out')) {
    return [0.42, 0, 0.58, 1];
  }
  return [x1, y1, x2, y2];
};

const meta: Meta<StorybookTitleProps> = {
  title: 'Landing/Hero/Title Motion Lab',
  component: HeroTitle as any,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    titleText: {
      control: { type: 'text' },
      description: 'Nội dung chữ của tiêu đề',
      table: {
        category: '🔤 Title Motion',
      }
    },
    totalStagger: {
      control: { type: 'range', min: 0.1, max: 2.5, step: 0.05 },
      description: 'Tổng thời gian trễ stagger toàn cục của chuỗi tiêu đề (giây)',
      table: {
        category: '🔤 Title Motion',
      }
    },
    p: {
      control: { type: 'range', min: 1.0, max: 5.0, step: 0.1 },
      description: 'Số mũ phi tuyến bậc p của S-Curve (p = 1.0 là tuyến tính, p = 3.0 là cubic S-curve chuẩn)',
      table: {
        category: '🔤 Title Motion',
      }
    },
    yOffset: {
      control: { type: 'range', min: 0, max: 150, step: 2 },
      description: 'Độ nâng thẳng đứng của chữ cái tiêu đề từ dưới lên (pixel)',
      table: {
        category: '🔤 Title Motion',
      }
    },
    duration: {
      control: { type: 'range', min: 0.1, max: 2.0, step: 0.05 },
      description: 'Thời lượng chuyển động của mỗi ký tự tiêu đề riêng lẻ (giây)',
      table: {
        category: '🔤 Title Motion',
      }
    },
    easePreset: {
      control: { type: 'select' },
      options: [
        'Apple Keynote [0.18, 1, 0.32, 1]',
        'Out Expo (Smooth) [0.16, 1, 0.3, 1]',
        'Back Out (Snappy Pop) [0.34, 1.56, 0.64, 1]',
        'Classic Ease-in-out [0.42, 0, 0.58, 1]',
        'Custom Cubic Bezier'
      ],
      description: 'Đường cong gia tốc (Easing Curve) được thiết lập sẵn cho mỗi chữ cái',
      table: {
        category: '📈 Title Easing Curve',
      }
    },
    x1: {
      control: { type: 'range', min: 0, max: 1, step: 0.02 },
      description: 'Tọa độ x1 của Custom Cubic Bezier',
      table: {
        category: '📈 Title Easing Curve',
        subcategory: 'Custom Handles',
      }
    },
    y1: {
      control: { type: 'range', min: -0.5, max: 2.0, step: 0.02 },
      description: 'Tọa độ y1 của Custom Cubic Bezier',
      table: {
        category: '📈 Title Easing Curve',
        subcategory: 'Custom Handles',
      }
    },
    x2: {
      control: { type: 'range', min: 0, max: 1, step: 0.02 },
      description: 'Tọa độ x2 của Custom Cubic Bezier',
      table: {
        category: '📈 Title Easing Curve',
        subcategory: 'Custom Handles',
      }
    },
    y2: {
      control: { type: 'range', min: -0.5, max: 2.0, step: 0.02 },
      description: 'Tọa độ y2 của Custom Cubic Bezier',
      table: {
        category: '📈 Title Easing Curve',
        subcategory: 'Custom Handles',
      }
    },
    enableConfirm: {
      control: { type: 'boolean' },
      description: 'Bật/Tắt hiệu ứng confirm (phóng to nảy nhẹ) sau khi hoàn thành stagger',
      table: {
        category: '✨ Title Zoom & Confirm',
      }
    },
    confirmInitialScale: {
      control: { type: 'range', min: 0.8, max: 1.0, step: 0.01 },
      description: 'Tỷ lệ thu nhỏ ban đầu của tiêu đề (scale lúc bắt đầu)',
      table: {
        category: '✨ Title Zoom & Confirm',
      }
    },
    confirmDelay: {
      control: { type: 'range', min: 0.0, max: 2.5, step: 0.05 },
      description: 'Thời gian trễ trước khi kích hoạt hiệu ứng confirm (giây)',
      table: {
        category: '✨ Title Zoom & Confirm',
      }
    },
    confirmDuration: {
      control: { type: 'range', min: 0.1, max: 1.5, step: 0.05 },
      description: 'Thời lượng chạy của hiệu ứng confirm (giây)',
      table: {
        category: '✨ Title Zoom & Confirm',
      }
    },
    enableTitleFade: {
      control: { type: 'boolean' },
      description: 'Bật/Tắt hiệu ứng mờ tỏ (fade-in) của tiêu đề "Big Data Club".',
      table: {
        category: '🔤 Title Motion',
      }
    },
    titleFadeDuration: {
      control: { type: 'range', min: 0.05, max: 2.0, step: 0.05 },
      description: 'Thời lượng chạy hoạt ảnh mờ tỏ (fade-in) riêng biệt của chữ cái tiêu đề (giây)',
      table: {
        category: '🔤 Title Motion',
      }
    },
  },
  args: {
    titleText: 'Big Data Club',
    totalStagger: 0.55,
    p: 2.0,
    yOffset: 40,
    duration: 0.35,
    easePreset: 'Custom Cubic Bezier',
    x1: 0.1,
    y1: 1.0,
    x2: 0.5,
    y2: 1.4,
    enableConfirm: true,
    confirmInitialScale: 0.85,
    confirmDelay: 1.1, // Adjusted to prevent stagger overlap jank
    confirmDuration: 0.35,
    enableTitleFade: true,
    titleFadeDuration: 0.25,
  },
};

export default meta;
type Story = StoryObj<StorybookTitleProps>;

// 1. Isolated Title Story
export const IsolatedTitle: Story = {
  render: (args) => {
    const computedEase = getComputedEase(args.easePreset, args.x1, args.y1, args.x2, args.y2);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { easePreset, x1, y1, x2, y2, ...titleProps } = args;
    return (
      <div className="w-full max-w-4xl mx-auto p-8 flex justify-center lg:justify-start items-center">
        <HeroTitle {...titleProps} ease={computedEase} />
      </div>
    );
  },
  name: 'Isolated Title Animation',
  args: {
    y1: 1,
    confirmDuration: 0.3,
    yOffset: 110,
    enableTitleFade: false,
    totalStagger: 0.65,
    x1: 0.06,
    x2: 0.7
  },
};

// 2. Custom Render for S-Curve delay timeline visualization
const SCurveRender = (args: StorybookTitleProps) => {
  const [reanimateKey, setReanimateKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setReanimateKey((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const computedEase = getComputedEase(args.easePreset, args.x1, args.y1, args.x2, args.y2);
  
  const p = args.p ?? 2.0;
  const totalStagger = args.totalStagger ?? 0.55;
  const titleText = args.titleText ?? "Big Data Club";
  const printableChars = titleText.replace(/\s/g, "");
  const total = printableChars.length;

  const width = 850;
  const height = 320;
  const padding = 45;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  let pathD = "";
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const xNormalized = i / steps;
    const diff = xNormalized - 0.5;
    const progress = 0.5 + Math.sign(diff) * Math.pow(Math.abs(diff), p) * Math.pow(2, p - 1);
    
    const xSvg = padding + xNormalized * graphWidth;
    const ySvg = padding + graphHeight - progress * graphHeight;
    if (i === 0) {
      pathD = `M ${xSvg} ${ySvg}`;
    } else {
      pathD += ` L ${xSvg} ${ySvg}`;
    }
  }

  const dots = Array.from(printableChars).map((char, index) => {
    const xNormalized = total > 1 ? index / (total - 1) : 0;
    const diff = xNormalized - 0.5;
    const progress = 0.5 + Math.sign(diff) * Math.pow(Math.abs(diff), p) * Math.pow(2, p - 1);
    
    const xSvg = padding + xNormalized * graphWidth;
    const ySvg = padding + graphHeight - progress * graphHeight;
    const delay = 0.1 + progress * totalStagger;

    return {
      char,
      xSvg,
      ySvg,
      delay: delay.toFixed(2),
      index
    };
  });

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col justify-center items-center font-sans overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 pb-6 border-b border-slate-800/50">
          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">Developer Motion Lab</div>
            <h2 className="text-3xl font-extrabold tracking-tight">S-Curve Delay Analyzer</h2>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              Bản thử nghiệm và trực quan hóa nhịp điệu trễ phi tuyến đối xứng cho chuỗi ký tự tiêu đề. Kéo các thanh trượt `p` và `totalStagger` trong bảng điều khiển để thiết kế đường cong trễ.
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-1.5">
            <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Live Loop Simulator (Loop 3s)</div>
            <div key={reanimateKey} className="flex gap-2 text-2xl font-black bg-slate-950 px-6 py-3.5 rounded-2xl border border-slate-800 shadow-inner overflow-hidden">
              {Array.from(printableChars).map((char, index) => {
                const xNormalized = total > 1 ? index / (total - 1) : 0;
                const diff = xNormalized - 0.5;
                const progress = 0.5 + Math.sign(diff) * Math.pow(Math.abs(diff), p) * Math.pow(2, p - 1);
                const delay = progress * totalStagger;

                return (
                  <motion.span
                    key={index}
                    initial={{ opacity: args.enableTitleFade ?? true ? 0 : 1, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: args.duration ?? 0.35,
                      ease: computedEase,
                      delay: delay,
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400"
                  >
                    {char}
                  </motion.span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-6 border border-slate-800/80 rounded-2xl shadow-inner relative overflow-visible flex justify-center items-center">
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" className="overflow-visible">
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <line x1={padding} y1={padding} x2={padding + graphWidth} y2={padding} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1={padding} y1={padding + graphHeight} x2={padding + graphWidth} y2={padding + graphHeight} stroke="#475569" strokeWidth="1.5" />
            <line x1={padding} y1={padding} x2={padding} y2={padding + graphHeight} stroke="#475569" strokeWidth="1.5" />
            <line x1={padding + graphWidth} y1={padding} x2={padding + graphWidth} y2={padding + graphHeight} stroke="#1e293b" strokeDasharray="3 3" />
            
            <line x1={padding + graphWidth / 2} y1={padding} x2={padding + graphWidth / 2} y2={padding + graphHeight} stroke="#334155" strokeDasharray="4 4" />
            <line x1={padding} y1={padding + graphHeight / 2} x2={padding + graphWidth} y2={padding + graphHeight / 2} stroke="#334155" strokeDasharray="4 4" />
            
            {dots.map((dot) => (
              <line key={`v-grid-${dot.index}`} x1={dot.xSvg} y1={padding} x2={dot.xSvg} y2={padding + graphHeight} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 4" />
            ))}

            <text x={padding - 15} y={padding + 4} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="end">Trễ Max ({ (0.1 + totalStagger).toFixed(2) }s)</text>
            <text x={padding - 15} y={padding + graphHeight + 4} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="end">Trễ Min (0.10s)</text>
            
            <text x={padding} y={padding + graphHeight + 22} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">Đầu (B)</text>
            <text x={padding + graphWidth} y={padding + graphHeight + 22} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">Cuối (b)</text>
            <text x={padding + graphWidth / 2} y={padding + graphHeight + 22} fill="#64748b" fontSize="9" textAnchor="middle">Định vị chuỗi ký tự (Trục hoành X)</text>

            <line x1={padding} y1={padding + graphHeight} x2={padding + graphWidth} y2={padding} stroke="#334155" strokeWidth="1" strokeDasharray="3 4" />

            <path d={pathD} fill="none" stroke="url(#curveGradient)" strokeWidth="6" strokeLinecap="round" opacity="0.2" filter="url(#glow)" />
            <path d={pathD} fill="none" stroke="url(#curveGradient)" strokeWidth="3" strokeLinecap="round" />

            {dots.map((dot) => (
              <g key={dot.index} className="group/dot cursor-pointer">
                <circle cx={dot.xSvg} cy={dot.ySvg} r="12" fill="rgba(6,182,212,0.25)" className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200" filter="url(#glow)" />
                <circle cx={dot.xSvg} cy={dot.ySvg} r="5.5" fill="#ffffff" stroke="#06b6d4" strokeWidth="2.5" className="transition-transform duration-200 group-hover/dot:scale-125 shadow-md" />
                <text x={dot.xSvg} y={dot.ySvg - 12} fill="#ffffff" fontSize="11" fontWeight="extrabold" textAnchor="middle" className="opacity-50 group-hover/dot:opacity-100 transition-opacity drop-shadow-md">
                  {dot.char}
                </text>
                <title>{`Chữ "${dot.char}" (Thứ ${dot.index + 1})\nThời gian trễ: ${dot.delay}s`}</title>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Thời gian trễ chi tiết của từng ký tự (Stagger Timelines)</span>
            <div className="flex gap-4 text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block shadow-[0_0_8px_#06b6d4]"></span> Ký tự xuất phát</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 border-t border-dashed border-slate-600 inline-block"></span> Phân bổ Tuyến tính (p=1.0)</span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-3.5 w-full">
            {dots.map((dot) => {
              const percent = totalStagger > 0 ? ((parseFloat(dot.delay) - 0.1) / totalStagger) * 100 : 0;
              return (
                <div key={dot.index} className="bg-slate-950 border border-slate-800/80 p-3 rounded-2xl flex flex-col items-center gap-1 shadow-inner group/card hover:border-cyan-500/30 transition-all duration-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Chữ {dot.char}</span>
                  <span className="text-sm font-extrabold text-slate-200 group-hover/card:text-cyan-400 transition-colors">{dot.delay}s</span>
                  <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

// Story: S-Curve Delay Visualizer
export const SCurveVisualizer: Story = {
  render: SCurveRender,
  name: 'S-Curve Delay Visualizer',
  args: {
    confirmDuration: 0.3,
    yOffset: 110,
    enableTitleFade: false
  },
};

interface CubicBezierRenderProps extends StorybookTitleProps {
  updateArgs: (newArgs: any) => void;
}

const CubicBezierRender = (args: CubicBezierRenderProps) => {
  const [reanimateKey, setReanimateKey] = useState(0);
  const [activeHandle, setActiveHandle] = useState<'p1' | 'p2' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setReanimateKey((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const duration = args.duration ?? 0.8;
  const computedEase = getComputedEase(args.easePreset, args.x1, args.y1, args.x2, args.y2);
  const [x1, y1, x2, y2] = computedEase;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { easePreset, x1: ax1, y1: ay1, x2: ax2, y2: ay2, updateArgs, ...titlePropsWithoutEase } = args;

  const width = 500;
  const height = 350;
  const padding = 60;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  const startX = padding;
  const startY = padding + graphHeight;
  const endX = padding + graphWidth;
  const endY = padding;

  const cp1X = padding + x1 * graphWidth;
  const cp1Y = padding + graphHeight - y1 * graphHeight;
  const cp2X = padding + x2 * graphWidth;
  const cp2Y = padding + graphHeight - y2 * graphHeight;

  const bezierPath = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

  const handleStartDrag = (handle: 'p1' | 'p2') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setActiveHandle(handle);
  };

  useEffect(() => {
    if (!activeHandle) return;

    const getSVGCoordinates = (e: MouseEvent | TouchEvent) => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      const x = ((clientX - rect.left) / rect.width) * 500;
      const y = ((clientY - rect.top) / rect.height) * 350;
      return { x, y };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const coords = getSVGCoordinates(e);
      if (!coords) return;

      const uX = Math.max(0, Math.min(1, (coords.x - padding) / graphWidth));
      const uY = Math.max(-0.5, Math.min(2.0, (padding + graphHeight - coords.y) / graphHeight));
      
      const roundedX = Math.round(uX * 100) / 100;
      const roundedY = Math.round(uY * 100) / 100;

      if (activeHandle === 'p1') {
        updateArgs({
          easePreset: 'Custom Cubic Bezier',
          x1: roundedX,
          y1: roundedY
        });
      } else {
        updateArgs({
          easePreset: 'Custom Cubic Bezier',
          x2: roundedX,
          y2: roundedY
        });
      }
    };

    const handleEnd = () => {
      setActiveHandle(null);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [activeHandle, updateArgs, padding, graphWidth, graphHeight]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col justify-center items-center font-sans overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 pb-6 border-b border-slate-800/50">
          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] font-bold tracking-widest uppercase text-pink-400">Developer Motion Lab</div>
            <h2 className="text-3xl font-extrabold tracking-tight">Cubic Bezier Easing Analyzer</h2>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              Trực quan hóa đồ thị gia tốc của các preset hoặc đường cong Bezier tùy chỉnh. Kéo các thanh trượt hoặc kéo thả trực tiếp các điểm P1, P2 trên biểu đồ bên dưới.
            </p>
          </div>

          <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner w-full md:w-[320px]">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Preset: {args.easePreset ? args.easePreset.split(" [")[0] : ''}</span>
              <div className="h-6 w-full bg-slate-900 rounded-lg relative overflow-hidden flex items-center border border-slate-800">
                <motion.div
                  key={`custom-${reanimateKey}`}
                  initial={{ x: 0 }}
                  animate={{ x: "calc(100% - 16px)" }}
                  transition={{ duration: duration, ease: computedEase }}
                  className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4] ml-1"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Linear (Tuyến tính)</span>
              <div className="h-6 w-full bg-slate-900 rounded-lg relative overflow-hidden flex items-center border border-slate-800">
                <motion.div
                  key={`linear-${reanimateKey}`}
                  initial={{ x: 0 }}
                  animate={{ x: "calc(100% - 16px)" }}
                  transition={{ duration: duration, ease: "linear" }}
                  className="w-4 h-4 bg-slate-700 rounded-full ml-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          
          <div className="flex flex-col gap-4 w-full lg:w-[280px]">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-3 shadow-inner">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/50 pb-1.5">Thông số Easing</div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col bg-slate-900/40 p-2 rounded-lg border border-slate-800/30">
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider">Control P1</span>
                  <span className="font-extrabold text-cyan-400 mt-0.5">({x1.toFixed(2)}, {y1.toFixed(2)})</span>
                </div>
                <div className="flex flex-col bg-slate-900/40 p-2 rounded-lg border border-slate-800/30">
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider">Control P2</span>
                  <span className="font-extrabold text-pink-400 mt-0.5">({x2.toFixed(2)}, {y2.toFixed(2)})</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs bg-slate-900/40 px-3 py-2 rounded-lg border border-slate-800/30">
                <span className="text-slate-400">Thời lượng (Duration):</span>
                <span className="font-extrabold text-white">{duration.toFixed(2)}s</span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-2.5 relative overflow-hidden shadow-inner">
              <div className="text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                Live Letter Preview
              </div>
              <div key={reanimateKey} className="w-full bg-slate-950 p-2 border border-slate-900 rounded-xl flex justify-center items-center h-24 overflow-hidden relative shadow-inner select-none">
                <div className="scale-[0.8] origin-center w-full flex justify-center">
                  <HeroTitle 
                    {...titlePropsWithoutEase}
                    titleText="B"
                    ease={computedEase} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-6 border border-slate-800/80 rounded-2xl shadow-inner relative overflow-visible flex-1 flex justify-center items-center w-full">
            <svg 
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`} 
              width="100%" 
              className="overflow-visible max-w-[480px] select-none"
            >
              <defs>
                <linearGradient id="bezierGradient" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <line x1={padding} y1={padding} x2={padding + graphWidth} y2={padding} stroke="#1e293b" strokeDasharray="3 3" />
              <line x1={padding} y1={padding + graphHeight} x2={padding + graphWidth} y2={padding + graphHeight} stroke="#475569" strokeWidth="1.5" />
              <line x1={padding} y1={padding} x2={padding} y2={padding + graphHeight} stroke="#475569" strokeWidth="1.5" />
              <line x1={padding + graphWidth} y1={padding} x2={padding + graphWidth} y2={padding + graphHeight} stroke="#1e293b" strokeDasharray="3 3" />
              
              <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

              <line x1={startX} y1={startY} x2={cp1X} y2={cp1Y} stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2 2" />
              <line x1={endX} y1={endY} x2={cp2X} y2={cp2Y} stroke="#ec4899" strokeWidth="1.5" strokeDasharray="2 2" />

              <path d={bezierPath} fill="none" stroke="url(#bezierGradient)" strokeWidth="4" strokeLinecap="round" />

              <circle cx={startX} cy={startY} r="5" fill="#3b82f6" />
              <circle cx={endX} cy={endY} r="5" fill="#ec4899" />

              <g 
                className="cursor-grab active:cursor-grabbing group/p1"
                onMouseDown={handleStartDrag('p1')}
                onTouchStart={handleStartDrag('p1')}
              >
                <circle cx={cp1X} cy={cp1Y} r="16" fill="transparent" />
                <circle cx={cp1X} cy={cp1Y} r="9" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" className="transition-transform group-hover/p1:scale-125 shadow-lg" filter="url(#glow)" />
                <text x={cp1X} y={cp1Y - 14} fill="#06b6d4" fontSize="10.5" fontWeight="black" textAnchor="middle" className="pointer-events-none select-none">P1</text>
              </g>

              <g 
                className="cursor-grab active:cursor-grabbing group/p2"
                onMouseDown={handleStartDrag('p2')}
                onTouchStart={handleStartDrag('p2')}
              >
                <circle cx={cp2X} cy={cp2Y} r="16" fill="transparent" />
                <circle cx={cp2X} cy={cp2Y} r="9" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" className="transition-transform group-hover/p2:scale-125 shadow-lg" filter="url(#glow)" />
                <text x={cp2X} y={cp2Y - 14} fill="#ec4899" fontSize="10.5" fontWeight="black" textAnchor="middle" className="pointer-events-none select-none">P2</text>
              </g>

              <text x={padding - 15} y={padding + 4} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="end">Đích (1.0)</text>
              <text x={padding - 15} y={padding + graphHeight + 4} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="end">Khởi đầu (0.0)</text>
              <text x={padding} y={padding + graphHeight + 20} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">T = 0</text>
              <text x={padding + graphWidth} y={padding + graphHeight + 20} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">T = 1.0</text>
              <text x={padding + graphWidth / 2} y={padding + graphHeight + 20} fill="#64748b" fontSize="9" textAnchor="middle">Thời gian (X)</text>
              
              <text x={padding - 35} y={padding + graphHeight / 2} fill="#64748b" fontSize="9" textAnchor="middle" transform={`rotate(-90, ${padding - 35}, ${padding + graphHeight / 2})`}>Tiến trình (Y)</text>
            </svg>
          </div>

        </div>

      </div>
    </div>
  );
};

// Story: Cubic Bezier Easing Visualizer
export const CubicBezierVisualizer: Story = {
  render: (args) => {
    const [currentArgs, updateArgs] = useArgs();
    return <CubicBezierRender {...(currentArgs as any)} updateArgs={updateArgs} />;
  },
  name: 'Cubic Bezier Easing Visualizer',
  args: {
    x1: 0.04,
    y2: 1.4,
    confirmDuration: 0.3,
    yOffset: 110,
    enableTitleFade: false,
    x2: 0.24
  },
};

// 4. Custom Render for Gantt Chart timeline visualization
const GanttChartRender = (args: StorybookTitleProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [reanimateKey, setReanimateKey] = useState(0);

  const duration = args.duration ?? 0.35;
  const totalStagger = args.totalStagger ?? 0.55;
  const p = args.p ?? 2.0;

  const enableConfirm = args.enableConfirm ?? true;
  const confirmDelay = args.confirmDelay ?? 1.0;
  const confirmDuration = args.confirmDuration ?? 0.35;

  const titleText = args.titleText ?? "Big Data Club";
  const printableChars = useMemo(() => titleText.replace(/\s/g, ""), [titleText]);
  const totalLetters = useMemo(() => printableChars.length, [printableChars]);

  const computedEase = getComputedEase(args.easePreset, args.x1, args.y1, args.x2, args.y2);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { easePreset, x1, y1, x2, y2, ...titlePropsWithoutEase } = args;

  const letterTimelines = useMemo(() => {
    return Array.from(printableChars).map((char, index) => {
      const xNormalized = totalLetters > 1 ? index / (totalLetters - 1) : 0;
      const diff = xNormalized - 0.5;
      const progress = 0.5 + Math.sign(diff) * Math.pow(Math.abs(diff), p) * Math.pow(2, p - 1);
      const start = 0.1 + progress * totalStagger;
      const end = start + duration;
      return {
        label: `Chữ "${char}"`,
        char,
        start,
        end,
        color: "from-blue-500 to-cyan-400",
        glowColor: "shadow-blue-500/20",
      };
    });
  }, [printableChars, totalLetters, p, totalStagger, duration]);

  const timelines = useMemo(() => {
    const list = [...letterTimelines];
    if (enableConfirm) {
      list.push({
        label: "Confirm Pop (Scale Zoom)",
        char: "✨",
        start: confirmDelay,
        end: confirmDelay + confirmDuration,
        color: "from-pink-500 to-purple-500",
        glowColor: "shadow-pink-500/20",
      });
    }
    return list;
  }, [letterTimelines, enableConfirm, confirmDelay, confirmDuration]);

  const { maxChartTime, gridTicks } = useMemo(() => {
    const maxTimelineEnd = timelines.length > 0 ? Math.max(...timelines.map((t) => t.end)) : 2.5;
    const maxVal = Math.max(2.5, Math.ceil((maxTimelineEnd + 0.2) * 5) / 5);
    const ticks: number[] = [];
    const step = 0.2;
    for (let t = 0; t <= maxVal; t += step) {
      ticks.push(t);
    }
    return { maxChartTime: maxVal, gridTicks: ticks };
  }, [timelines]);

  const currentTimeRef = useRef(currentTime);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    if (!isPlaying) return;
    let startTime = performance.now() - currentTimeRef.current * 1000;
    
    const intervalId = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed >= maxChartTime) {
        startTime = performance.now();
        setCurrentTime(0);
        setReanimateKey((prev) => prev + 1);
      } else {
        setCurrentTime(elapsed);
      }
    }, 33);

    return () => clearInterval(intervalId);
  }, [isPlaying, maxChartTime]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const isConfirmActive = enableConfirm && currentTime >= confirmDelay && currentTime <= confirmDelay + confirmDuration;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col justify-center items-center font-sans overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-6">
        
        <div className="flex flex-col gap-1 pb-4 border-b border-slate-800/50">
          <div className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">Developer Motion Lab</div>
          <h2 className="text-3xl font-extrabold tracking-tight">Animation Gantt Chart</h2>
        </div>

        <div className="bg-slate-950 p-6 border border-slate-800/80 rounded-2xl shadow-inner flex flex-col justify-center items-center gap-3 relative overflow-hidden h-40">
          <div className="absolute top-3 left-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
            Real Title Animation Preview
          </div>

          <div key={reanimateKey} className="w-full scale-75 sm:scale-90 md:scale-95 origin-center transition-all duration-200">
            <HeroTitle 
              {...titlePropsWithoutEase} 
              ease={computedEase} 
              customTime={currentTime}
            />
          </div>

          {isConfirmActive && (
            <div
              className="absolute top-3 right-4 text-[9px] font-extrabold bg-pink-950/80 text-pink-400 border border-pink-500/30 px-2.5 py-1 rounded-md shadow-[0_0_12px_rgba(236,72,153,0.15)] flex items-center gap-1 uppercase transition-all duration-200 animate-pulse z-10"
            >
              <Sparkles className="w-2.5 h-2.5" /> Confirm Pop Active
            </div>
          )}
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl shadow-inner flex items-center h-12 overflow-hidden">
          <div className="w-[180px] shrink-0 border-r border-slate-900 pl-5 flex items-center gap-2 h-full bg-slate-950 select-none">
            <Clock className="w-3.5 h-3.5 text-cyan-500/80 shrink-0" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Scrub Timeline</span>
          </div>
          <div className="flex-1 px-4 flex items-center h-full bg-slate-950/40">
            <input
              type="range"
              min="0"
              max={maxChartTime}
              step="0.01"
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full accent-cyan-400 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl shadow-inner overflow-hidden flex flex-col relative">
          
          <div className="flex border-b border-slate-900 bg-slate-950 text-[9px] font-bold text-slate-500 uppercase h-14 items-center select-none">
            <div className="w-[180px] shrink-0 border-r border-slate-900 px-3 h-full flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    if (!isPlaying) {
                      setReanimateKey((prev) => prev + 1);
                    }
                  }}
                  className={`p-1.5 rounded-lg border flex items-center justify-center transition-all active:scale-95 duration-200 ${
                    isPlaying 
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30' 
                      : 'bg-slate-850 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                  title={isPlaying ? "Tạm dừng" : "Phát"}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { 
                    setCurrentTime(0); 
                    setReanimateKey((prev) => prev + 1); 
                  }}
                  className="p-1.5 rounded-lg border bg-slate-850 text-slate-400 border-slate-800 hover:bg-slate-800 transition-all active:scale-95 duration-200"
                  title="Đặt lại"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="flex flex-col items-end font-mono leading-none">
                <span className="text-[11px] font-black text-cyan-400">{currentTime.toFixed(2)}s</span>
                <span className="text-[7.5px] text-slate-500 mt-0.5">/ {maxChartTime.toFixed(1)}s</span>
              </div>
            </div>

            <div className="flex-1 relative h-full">
              {gridTicks.map((tick, idx) => {
                const leftPos = (tick / maxChartTime) * 100;
                return (
                  <div
                    key={idx}
                    className="absolute top-0 bottom-0 flex flex-col justify-center items-center border-l border-slate-900/50"
                    style={{ left: `${leftPos}%`, transform: 'translateX(-50%)' }}
                  >
                    <span className="text-[8.5px] tracking-tight">{tick.toFixed(1)}s</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col divide-y divide-slate-900/40 relative">
            
            <div className="absolute inset-0 flex pointer-events-none z-0">
              <div className="w-[180px] shrink-0 h-full border-r border-slate-900"></div>
              <div className="flex-1 relative h-full">
                {gridTicks.map((tick, idx) => {
                  const leftPos = (tick / maxChartTime) * 100;
                  return (
                    <div
                      key={idx}
                      className={`absolute top-0 bottom-0 border-l ${
                        tick === 0 || tick === maxChartTime ? 'border-slate-800' : 'border-slate-900/30 border-dashed'
                      }`}
                      style={{ left: `${leftPos}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {timelines.map((t, idx) => {
              const isRowActive = currentTime >= t.start && currentTime <= t.end;
              const barLeft = (t.start / maxChartTime) * 100;
              const barWidth = ((t.end - t.start) / maxChartTime) * 100;
              const delayWidth = (t.start / maxChartTime) * 100;

              return (
                <div key={idx} className="flex h-10 items-center relative z-10 hover:bg-slate-900/20 transition-colors">
                  <div className="w-[180px] shrink-0 pl-5 border-r border-slate-900 h-full flex items-center justify-between bg-slate-950/80">
                    <span className={`text-[11px] font-semibold transition-colors duration-150 ${isRowActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                      {t.label}
                    </span>
                    {isRowActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-3 animate-ping shadow-[0_0_6px_#22d3ee]"></span>
                    )}
                  </div>

                  <div className="flex-1 h-full relative flex items-center">
                    <div 
                      className="absolute left-0 border-t border-dashed border-slate-800/60 h-px"
                      style={{ width: `${delayWidth}%` }}
                    />

                    <div
                      className={`absolute bg-gradient-to-r ${t.color} rounded-[4px] h-5.5 flex items-center px-2.5 justify-between group shadow-sm transition-all duration-75 border border-white/5 select-none ${
                        isRowActive ? 'scale-y-[1.05] brightness-110 shadow-[0_0_10px_rgba(6,182,212,0.3)] border-white/10' : 'opacity-85'
                      }`}
                      style={{ 
                        left: `${barLeft}%`, 
                        width: `${barWidth}%` 
                      }}
                    >
                      <span className="text-[7.5px] font-mono font-bold text-slate-950/80 uppercase tracking-wider truncate">
                        {isRowActive ? 'Active' : ''}
                      </span>
                      <span className="text-[8.5px] font-mono font-bold text-slate-950 tracking-tight leading-none">
                        {t.start.toFixed(2)}s – {t.end.toFixed(2)}s
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}

            <div className="absolute inset-0 flex pointer-events-none z-20">
              <div className="w-[180px] shrink-0 h-full"></div>
              <div className="flex-1 relative h-full">
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_8px_#ef4444]"
                  style={{ left: `${(currentTime / maxChartTime) * 100}%` }}
                >
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 border border-slate-950 shadow-[0_0_6px_#ef4444]"></div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

// Story: Gantt Chart Animation Visualizer
export const GanttChartVisualizer: Story = {
  render: GanttChartRender,
  name: 'Gantt Chart Animation Visualizer',
  args: {
    y1: 1,
    confirmDuration: 0.3,
    yOffset: 110,
    enableTitleFade: false
  },
};
