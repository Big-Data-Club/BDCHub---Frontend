"use client";

import { motion } from "framer-motion";

export interface StatItem {
  label: string;
  value: string;
  floatClasses: string;
  duration: number;
}

export const statsData: StatItem[] = [
  { label: "Kết nối", value: "100+", floatClasses: "top-[12%] left-[4%]", duration: 4.2 },
  { label: "Năm hoạt động", value: "4", floatClasses: "top-[26%] right-[0%]", duration: 4.8 },
  { label: "Dự án NCKH", value: "10+", floatClasses: "bottom-[26%] left-[4%]", duration: 5.2 },
  { label: "Giải thưởng", value: "5+", floatClasses: "bottom-[12%] right-[0%]", duration: 4.5 }
];

export interface HeroStatsCardsProps {
  statsDuration: number;
  statsYOffset: number;
}

export function HeroStatsCards({
  statsDuration: _statsDuration,
  statsYOffset: _statsYOffset,
}: HeroStatsCardsProps) {
  void _statsDuration;
  void _statsYOffset;
  return (
    <>
      {statsData.map((stat, i) => {
        return (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: stat.duration,
              ease: "easeInOut",
              repeat: Infinity,
              delay: i * 0.4,
            }}
            className={`absolute ${stat.floatClasses} w-[170px] z-20`}
          >
            <div className="relative group">
              <div
                className="relative flex flex-col items-center justify-center p-5 rounded-2xl cursor-default bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-md overflow-hidden
                           border border-slate-200/80 dark:border-blue-500/20
                           shadow-md dark:shadow-[0_4px_20px_rgba(7,14,28,0.4)]
                           group-hover:border-blue-400/60 dark:group-hover:border-cyan-400/40 transition-all duration-300"
              >
                <div className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400">{stat.value}</div>
                <div className="mt-1.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
