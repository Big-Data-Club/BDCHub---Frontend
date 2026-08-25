"use client";

import { statsData } from "./HeroStatsCards";

export interface HeroStatsMobileProps {
  statsDuration?: number;
  statsYOffset?: number;
}

export function HeroStatsMobile({
  statsDuration: _statsDuration,
  statsYOffset: _statsYOffset,
}: HeroStatsMobileProps = {}) {
  void _statsDuration;
  void _statsYOffset;

  return (
    <div className="w-full lg:hidden pt-6 mt-4 border-t border-slate-200/80 dark:border-blue-500/15">
      <div className="grid grid-cols-2 gap-y-4 gap-x-6 divide-x divide-slate-200/60 dark:divide-blue-500/15">
        {statsData.map((stat, i) => (
          <div
            key={i}
            className={`flex flex-col items-start ${i % 2 !== 0 ? "pl-6" : ""}`}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight font-mono">
                {stat.value}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 animate-pulse" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


