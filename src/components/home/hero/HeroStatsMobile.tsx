"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import { statsData } from "./HeroVisualCore";

export interface HeroStatsMobileProps {
  statsDuration: number;
  statsYOffset: number;
}

export function HeroStatsMobile({
  statsDuration,
  statsYOffset,
}: HeroStatsMobileProps) {
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
    <motion.div 
      variants={statsVariants}
      className="w-full lg:hidden grid grid-cols-2 gap-3 pt-8 border-t border-slate-200/50 dark:border-blue-500/5 mt-8"
    >
      {statsData.map((stat, i) => (
        <div 
          key={i} 
          className="group flex flex-col items-center justify-center p-4 rounded-xl cursor-default
                     bg-white/60 dark:bg-[#0F1E35]/40 backdrop-blur-md
                     border border-slate-200/60 dark:border-blue-500/10
                     hover:border-blue-300/60 dark:hover:border-blue-500/30
                     transition-all duration-300"
        >
          <div className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400 group-hover:scale-105 transition-transform duration-300">
            {stat.value}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
            {stat.label}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
