"use client";

import React from "react";
import { TaskWithColor, SpanInfo, PRIORITY_CONFIG } from "@/types";

interface TaskChipProps {
  task: TaskWithColor;
  spanInfo: SpanInfo;
  onClick: () => void;
}

export function TaskChip({ task, spanInfo, onClick }: TaskChipProps) {
  const { isStart } = spanInfo;
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.MEDIUM;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-md px-1.5 py-0.5 transition-all duration-150
                 hover:brightness-95 active:scale-[0.98] focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{
        backgroundColor: task.color + "18",
        borderLeft: `2.5px solid ${task.color}`,
      }}
    >
      {isStart && (
        <div className="flex items-center gap-1 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priority.dot}`}
          />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate leading-tight">
            {task.title}
          </span>
        </div>
      )}
      {!isStart && (
        <div
          className="h-[14px] rounded-sm opacity-40"
          style={{ backgroundColor: task.color }}
        />
      )}
    </button>
  );
}