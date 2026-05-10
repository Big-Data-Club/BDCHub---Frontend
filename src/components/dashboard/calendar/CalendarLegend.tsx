"use client";

import React from "react";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/types";

export function CalendarLegend() {
  return (
    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800
                    bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center gap-x-5 gap-y-2">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
          Priority
        </span>
        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
          Status
        </span>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}