"use client";

import { motion } from "framer-motion";

export interface HeroTitleProps {
  titleText?: string;
  enableConfirm?: boolean;
  confirmInitialScale?: number;
  confirmDelay?: number;
  confirmDuration?: number;
  enableTitleFade?: boolean;
  titleFadeDuration?: number;
  totalStagger?: number;
  p?: number;
  yOffset?: number;
  duration?: number;
  ease?: [number, number, number, number];
  customTime?: number;
}

export function HeroTitle({ titleText = "Big Data Club" }: HeroTitleProps) {
  const parts = titleText.split(" ");
  const mainText = parts.slice(0, -1).join(" ");
  const accentText = parts.length > 1 ? parts[parts.length - 1] : "";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <h1 className="pb-4 pt-2 text-center text-5xl font-black leading-[1.15] tracking-tight sm:text-6xl md:text-7xl lg:text-left lg:text-8xl text-slate-900 dark:text-white">
        {mainText ? `${mainText} ` : ""}
        <span className="text-blue-600 dark:text-cyan-400">{accentText || titleText}</span>
      </h1>
    </motion.div>
  );
}
