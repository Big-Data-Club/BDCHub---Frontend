"use client";

import React from "react";
import { TaskWithColor } from "@/types";
import { getTasksForDay, getSpanInfo } from "@/utils/calendar";
import { TaskChip } from "./TaskChip";

interface CalendarDayCellProps {
  day: Date;
  currentDate: Date;
  isMonthView: boolean;
  tasks: TaskWithColor[];
  onTaskClick: (task: TaskWithColor) => void;
}

const MAX_VISIBLE = 3;

export function CalendarDayCell({
  day,
  currentDate,
  isMonthView,
  tasks,
  onTaskClick,
}: CalendarDayCellProps) {
  const isToday       = day.toDateString() === new Date().toDateString();
  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
  const dayTasks      = getTasksForDay(tasks, day);
  const visible       = dayTasks.slice(0, MAX_VISIBLE);
  const overflow      = dayTasks.length - MAX_VISIBLE;

  return (
    <div
      className={`min-h-[88px] p-1.5 flex flex-col gap-0.5
                  border-r border-b border-slate-200 dark:border-slate-800 last:border-r-0
                  transition-colors duration-150
                  ${isMonthView && !isCurrentMonth
                    ? "bg-slate-50/60 dark:bg-slate-950/60"
                    : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-0.5">
        <span
          className={`text-xs font-semibold leading-none flex items-center justify-center transition-colors
            ${isToday
              ? "w-5 h-5 rounded-full bg-blue-600 text-white"
              : isCurrentMonth
                ? "text-slate-800 dark:text-slate-200"
                : "text-slate-300 dark:text-slate-600"
            }`}
        >
          {day.getDate()}
        </span>
        {dayTasks.length > 0 && (
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
            {dayTasks.length}
          </span>
        )}
      </div>

      {/* Task chips */}
      <div className="flex flex-col gap-0.5 flex-1">
        {visible.map(task => (
          <TaskChip
            key={task.id}
            task={task}
            spanInfo={getSpanInfo(task, day)}
            onClick={() => onTaskClick(task)}
          />
        ))}
        {overflow > 0 && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
            +{overflow} more
          </span>
        )}
      </div>
    </div>
  );
}