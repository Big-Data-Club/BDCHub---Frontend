"use client";

import React, { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useCalendarTasks } from "@/hooks/useCalendarTasks";
import { ViewMode, TaskWithColor, WEEK_DAYS } from "@/types";
import { getDaysInView, buildTaskRows, navigate } from "@/utils/calendar";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarDayCell } from "./CalendarDayCell";
import { MultiDayTaskBar } from "./MultiDayTaskBar";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { CalendarLegend } from "./CalendarLegend";

const ModernCalendar = () => {
  const [date, setDate]             = useState(new Date());
  const [viewMode, setViewMode]     = useState<ViewMode>("week");
  const [selected, setSelected]     = useState<TaskWithColor | null>(null);

  const { tasks, loading, error, refreshTasks } = useCalendarTasks();

  const days     = getDaysInView(date, viewMode);
  const taskRows = viewMode !== "day" ? buildTaskRows(tasks, days) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-slate-900
                      rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-slate-900
                      rounded-2xl border border-red-200 dark:border-red-900">
        <div className="text-center px-6">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Failed to load</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{error}</p>
          <button
            onClick={refreshTasks}
            className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl text-xs font-semibold
                       bg-blue-600 hover:bg-blue-700 text-white transition-colors active:scale-95"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900
                    rounded-2xl border border-slate-200 dark:border-slate-800
                    shadow-sm overflow-hidden flex flex-col">

      <CalendarHeader
        date={date}
        viewMode={viewMode}
        onNavigate={dir => setDate(d => navigate(d, viewMode, dir))}
        onToday={() => setDate(new Date())}
        onViewChange={setViewMode}
        onRefresh={refreshTasks}
      />

      {/* Week day labels */}
      {viewMode !== "day" && (
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
          {WEEK_DAYS.map(d => (
            <div
              key={d}
              className="py-2 text-center text-[11px] font-semibold
                         text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className={`grid flex-1 ${viewMode === "day" ? "grid-cols-1" : "grid-cols-7"}`}>
        {days.map((day, i) => (
          <CalendarDayCell
            key={i}
            day={day}
            currentDate={date}
            isMonthView={viewMode === "month"}
            tasks={tasks}
            onTaskClick={setSelected}
          />
        ))}
      </div>

      {/* Multi-day bars */}
      {viewMode !== "day" && (
        <MultiDayTaskBar rows={taskRows} onTaskClick={setSelected} />
      )}

      <CalendarLegend />

      {/* Detail panel */}
      {selected && (
        <TaskDetailPanel task={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export { ModernCalendar };