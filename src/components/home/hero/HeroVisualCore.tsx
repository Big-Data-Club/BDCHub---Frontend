"use client";

import { motion } from "framer-motion";
import SafeImage from "../../common/SafeImage";
import { LogoIcon } from "@/constants";
import { HeroStatsCards } from "./HeroStatsCards";

export interface HeroVisualCoreProps {
  statsDuration: number;
  statsYOffset: number;
}

export function HeroVisualCore({
  statsDuration,
  statsYOffset,
}: HeroVisualCoreProps) {
  return (
    <div
      className="lg:col-span-5 relative w-full h-[620px] hidden lg:flex items-center justify-center select-none"
    >
      {/* Static ambient glow keeps the visual hierarchy without repainting continuously. */}
      <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 blur-3xl pointer-events-none" />
      
      {/* Dedicated Card Glow Backdrops */}
      <div className="absolute top-[12%] left-[4%] w-52 h-52 rounded-full bg-blue-500/12 dark:bg-blue-500/6 blur-3xl pointer-events-none" />
      <div className="absolute top-[26%] right-[0%] w-52 h-52 rounded-full bg-cyan-500/12 dark:bg-cyan-500/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[26%] left-[4%] w-52 h-52 rounded-full bg-cyan-500/12 dark:bg-cyan-500/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[12%] right-[0%] w-52 h-52 rounded-full bg-blue-500/12 dark:bg-blue-500/6 blur-3xl pointer-events-none" />
      
      {/* Outer orbit with smooth infinite continuous rotation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, ease: "linear", repeat: Infinity }}
        className="absolute w-80 h-80 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute w-full h-full rounded-full border border-dashed border-blue-500/35 dark:border-blue-500/20 flex items-center justify-center">
          {/* Lead Satellite Node */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)] dark:shadow-[0_0_16px_rgba(96,165,250,1)] z-10" />

          {/* Seamless Tapering & Fading SVG Trail */}
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
      </motion.div>

      {/* Inner orbit rotating counter-clockwise */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        className="absolute w-60 h-60 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute w-full h-full rounded-full border-2 border-dotted border-cyan-500/35 dark:border-cyan-500/20 flex items-center justify-center">
          {/* Lead Satellite Node */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] dark:shadow-[0_0_16px_rgba(34,211,238,1)] z-10" />

          {/* SVG Trail */}
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
      </motion.div>
      
      {/* Central BDC Logo with subtle floating breath effect */}
      <motion.div
        animate={{ y: [0, -8, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        className="absolute flex flex-col items-center justify-center text-center p-2 bg-white/60 dark:bg-[#0F1E35]/60 backdrop-blur-md border border-slate-200/80 dark:border-blue-500/20 rounded-full w-40 h-40 shadow-lg dark:shadow-[0_0_30px_rgba(37,99,235,0.15)] overflow-hidden group hover:border-blue-400/60 dark:hover:border-cyan-400/40 transition-colors duration-300 z-10"
      >
        <SafeImage
          src={LogoIcon}
          alt="Big Data Club Logo"
          width={120}
          height={120}
          priority
          className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-500"
        />
      </motion.div>

      {/* Floating Glassmorphic Stats Cards */}
      <HeroStatsCards
        statsDuration={statsDuration}
        statsYOffset={statsYOffset}
      />

    </div>
  );
}
