"use client";

import React from "react";

export interface StatItem {
  label: string;
  value: string;
}

export const statsData: StatItem[] = [
  { label: "Thành viên active", value: "100+" },
  { label: "Năm hoạt động", value: "4+" },
  { label: "Dự án NCKH & App", value: "10+" },
  { label: "Giải thưởng & Công bố", value: "5+" }
];

export interface HeroStatsCardsProps {
  statsDuration?: number;
  statsYOffset?: number;
}

export function HeroStatsCards({
  statsDuration: _statsDuration,
  statsYOffset: _statsYOffset,
}: HeroStatsCardsProps = {}) {
  void _statsDuration;
  void _statsYOffset;

  return (
    <div className="w-full pt-8 pb-4 border-t border-b border-slate-300 dark:border-blue-500/15">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-300 dark:divide-blue-500/15">
        {statsData.map((stat, i) => (
          <div
            key={i}
            className={`flex flex-col items-start px-4 md:px-8 ${
              i % 2 !== 0 ? "pl-6 md:pl-8" : ""
            } ${i >= 2 ? "pt-4 md:pt-0" : "pb-4 md:pb-0"}`}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight font-mono">
                {stat.value}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 animate-pulse" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}



