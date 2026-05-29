"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();

  const outerOrbitVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: statsDuration + 0.1, // Snappier 0.7s reveal
        ease: [0.16, 1, 0.3, 1],
        delay: 0.5, // Start immediately as title completes its peak
      },
    },
  };

  const innerOrbitVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: statsDuration + 0.1, // Snappier 0.7s reveal
        ease: [0.16, 1, 0.3, 1],
        delay: 0.55, // Snappy offset cascade
      },
    },
  };

  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: statsDuration, // Snappy 0.6s reveal
        ease: [0.16, 1, 0.3, 1],
        delay: 0.6, // Synchronized with logo & card 0
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="lg:col-span-5 relative w-full h-[620px] hidden lg:flex items-center justify-center select-none"
    >
      {/* Ambient Glowing Cores */}
      <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 blur-3xl animate-pulse pointer-events-none" />
      
      {/* Dedicated Card Glow Backdrops (Subtle ambient light directly behind each card's coordinates to enhance backdrop-blur) */}
      <div className="absolute top-[12%] left-[4%] w-52 h-52 rounded-full bg-blue-500/12 dark:bg-blue-500/6 blur-3xl pointer-events-none" />
      <div className="absolute top-[26%] right-[0%] w-52 h-52 rounded-full bg-cyan-500/12 dark:bg-cyan-500/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[26%] left-[4%] w-52 h-52 rounded-full bg-cyan-500/12 dark:bg-cyan-500/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[12%] right-[0%] w-52 h-52 rounded-full bg-blue-500/12 dark:bg-blue-500/6 blur-3xl pointer-events-none" />
      
      {/* Outer Orbit (Dashed) with Blue Glowing Satellite & Continuous SVG Trail */}
      <motion.div
        variants={outerOrbitVariants}
        className="absolute w-80 h-80 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute w-full h-full rounded-full border border-dashed border-blue-500/35 dark:border-blue-500/20 animate-[spin_28s_linear_infinite] will-change-transform flex items-center justify-center">
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
      </motion.div>

      {/* Inner Orbit (Dotted) with Cyan Glowing Satellite & Continuous SVG Trail */}
      <motion.div
        variants={innerOrbitVariants}
        className="absolute w-60 h-60 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute w-full h-full rounded-full border-2 border-dotted border-cyan-500/35 dark:border-cyan-500/20 animate-[spin_12s_linear_infinite_reverse] will-change-transform flex items-center justify-center">
          {/* Lead Satellite Node at 6 o'clock (bottom) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] dark:shadow-[0_0_12px_rgba(34,211,238,0.9)] z-10" />

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
      </motion.div>
      
      {/* Central BDC Logo with entry reveal scale & fade animation */}
      <motion.div
        variants={logoVariants}
        className="absolute flex flex-col items-center justify-center text-center p-2 bg-white/40 dark:bg-[#0F1E35]/40 backdrop-blur-md border border-slate-200/50 dark:border-blue-500/10 rounded-full w-40 h-40 shadow-inner overflow-hidden group hover:border-blue-300/60 dark:hover:border-blue-500/30 transition-all duration-300"
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

    </motion.div>
  );
}
