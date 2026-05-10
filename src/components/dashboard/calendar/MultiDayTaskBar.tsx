"use client";

import React from "react";
import { TaskRow, PRIORITY_CONFIG } from "@/types";
import { formatShort, parseDate } from "@/utils/calendar";

interface MultiDayTaskBarProps {
  rows: TaskRow[];
  onTaskClick: (task: TaskRow["task"]) => void;
}

export function MultiDayTaskBar({ rows, onTaskClick }: MultiDayTaskBarProps) {
  if (rows.length === 0) return null;

  return (
    <div className="border-t border-slate-200 dark:border-slate-800
                    bg-slate-50 dark:bg-slate-950 px-3 py-2 space-y-1.5">
      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-1.5">
        Multi-day tasks
      </p>
      {rows.map((row, i) => {
        const { task, startIdx, span } = row;
        const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.MEDIUM;

        return (
          <div
            key={i}
            className="relative h-6"
            style={{ paddingLeft: `${(startIdx / 7) * 100}%` }}
          >
            <button
              onClick={() => onTaskClick(task)}
              className="absolute h-6 flex items-center gap-2 px-2 rounded-md text-xs font-medium
                         transition-all duration-150 hover:brightness-95 active:scale-[0.99]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{
                width: `${(span / 7) * 100}%`,
                backgroundColor: task.color + "18",
                borderLeft: `2.5px solid ${task.color}`,
                color: task.color,
              }}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priority.dot}`} />
              <span className="truncate flex-1 text-slate-700 dark:text-slate-200">{task.title}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 hidden sm:block">
                {formatShort(parseDate(task.startDate))} – {formatShort(parseDate(task.endDate))}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}