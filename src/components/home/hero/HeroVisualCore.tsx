"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import SafeImage from "../../common/SafeImage";
import { LogoIcon } from "@/constants";

export interface HeroVisualCoreProps {
  statsDuration: number;
  statsYOffset: number;
}

export interface StatItem {
  label: string;
  value: string;
  floatClasses: string;
  duration: number;
}

export const statsData: StatItem[] = [
  { label: "Kết nối", value: "100+", floatClasses: "top-[6%] left-[2%]", duration: 4.2 },
  { label: "Năm hoạt động", value: "4", floatClasses: "top-[22%] right-[0%]", duration: 4.8 },
  { label: "Dự án NCKH", value: "10+", floatClasses: "bottom-[22%] left-[2%]", duration: 5.2 },
  { label: "Giải thưởng", value: "5+", floatClasses: "bottom-[6%] right-[2%]", duration: 4.5 }
];

export function HeroVisualCore({
  statsDuration,
  statsYOffset,
}: HeroVisualCoreProps) {
  const shouldReduceMotion = useReducedMotion();

  const statsVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : statsYOffset,
      filter: shouldReduceMotion ? "none" : "blur(4px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "none",
      transition: {
        duration: statsDuration,
        ease: [0.16, 1, 0.3, 1], // Premium out-expo easing
        delay: 1.85, // Cascaded sequentially after CTA actions
      },
    },
  };

  return (
    <div className="lg:col-span-5 relative w-full h-[540px] hidden lg:flex items-center justify-center select-none">
      
      {/* Ambient Glowing Cores */}
      <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 blur-3xl animate-pulse" />
      
      {/* Outer Orbit (Dashed) with Blue Glowing Satellite & Continuous SVG Trail */}
      <div className="absolute w-64 h-64 rounded-full border border-dashed border-blue-500/35 dark:border-blue-500/20 animate-[spin_28s_linear_infinite] will-change-transform flex items-center justify-center">
        {/* Lead Satellite Node */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)] dark:shadow-[0_0_12px_rgba(96,165,250,0.9)] z-10" />
        
        {/* Seamless Tapering & Fading SVG Trail (Clockwise movement -> counter-clockwise trail) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blueCometGrad" x1="128" y1="0" x2="37.5" y2="37.5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="15%" stopColor="#3b82f6" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 128 -1.5 A 129.5 129.5 0 0 0 37.5 37.5 A 126.5 126.5 0 0 1 128 1.5 Z"
            fill="url(#blueCometGrad)"
          />
        </svg>
      </div>

      {/* Inner Orbit (Dotted) with Cyan Glowing Satellite & Continuous SVG Trail */}
      <div className="absolute w-48 h-48 rounded-full border-2 border-dotted border-cyan-500/35 dark:border-cyan-500/20 animate-[spin_12s_linear_infinite_reverse] will-change-transform flex items-center justify-center">
        {/* Lead Satellite Node at 6 o'clock (bottom) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] dark:shadow-[0_0_12px_rgba(34,211,238,0.9)] z-10" />
        
        {/* Seamless Tapering & Fading SVG Trail (Counter-clockwise movement -> clockwise trail) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cyanCometGrad" x1="96" y1="192" x2="28.1" y2="163.9" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="15%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="75%" stopColor="#06b6d4" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 96 193.2 A 97.2 97.2 0 0 1 28.1 163.9 A 94.8 94.8 0 0 0 96 190.8 Z"
            fill="url(#cyanCometGrad)"
          />
        </svg>
      </div>
      
      <div className="absolute flex flex-col items-center justify-center text-center p-2 bg-white/40 dark:bg-[#0F1E35]/40 backdrop-blur-md border border-slate-200/50 dark:border-blue-500/10 rounded-full w-32 h-32 shadow-inner overflow-hidden group hover:border-blue-300/60 dark:hover:border-blue-500/30 transition-all duration-300">
        <SafeImage
          src={LogoIcon}
          alt="Big Data Club Logo"
          width={96}
          height={96}
          priority
          className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Floating Glassmorphic Stats */}
      {statsData.map((stat, i) => (
        <motion.div
          key={i}
          variants={statsVariants}
          className={`absolute ${stat.floatClasses} w-[170px] z-20`}
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{
              repeat: Infinity,
              duration: stat.duration,
              ease: "easeInOut"
            }}
            className="group flex flex-col items-center justify-center p-5 rounded-2xl cursor-default
                       bg-white/40 dark:bg-[#0F1E35]/40 backdrop-blur-md
                       border border-slate-200/50 dark:border-blue-500/10
                       hover:border-blue-300/60 dark:hover:border-blue-500/30
                       hover:shadow-lg hover:shadow-blue-500/5
                       dark:hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)]
                       transition-all duration-300"
          >
            <div className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400 group-hover:scale-105 transition-transform duration-300">
              {stat.value}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1.5 text-center">
              {stat.label}
            </div>
          </motion.div>
        </motion.div>
      ))}

    </div>
  );
}
