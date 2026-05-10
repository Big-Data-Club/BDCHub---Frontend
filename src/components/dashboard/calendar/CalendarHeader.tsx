"use client";

import React from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { ViewMode } from "@/types";
import { getCalendarTitle } from "@/utils/calendar";

interface CalendarHeaderProps {
  date: Date;
  viewMode: ViewMode;
  onNavigate: (dir: 1 | -1) => void;
  onToday: () => void;
  onViewChange: (mode: ViewMode) => void;
  onRefresh: () => void;
}

const VIEW_MODES: ViewMode[] = ["day", "week", "month"];

export function CalendarHeader({
  date,
  viewMode,
  onNavigate,
  onToday,
  onViewChange,
  onRefresh,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3
                    border-b border-slate-200 dark:border-slate-800">
      {/* Title */}
      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50 min-w-0 truncate">
        {getCalendarTitle(date, viewMode)}
      </h2>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* View mode toggle */}
        <div className="flex gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          {VIEW_MODES.map(mode => (
            <button
              key={mode}
              onClick={() => onViewChange(mode)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === mode
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onNavigate(-1)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg
                       bg-blue-600 hover:bg-blue-700 text-white
                       transition-colors active:scale-95"
          >
            Today
          </button>
          <button
            onClick={() => onNavigate(1)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={15} />
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            aria-label="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}