"use client";

import React from "react";
import { Calendar, CheckSquare, Trophy } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

interface StatsCardsProps {
  eventsCount: number;
}

const STAT_CONFIG = [
  {
    key: "events",
    icon: Calendar,
    label: "Upcoming Events",
    bg: "bg-blue-600 dark:bg-blue-700",
    iconBg: "bg-blue-700 dark:bg-blue-800",
  },
  {
    key: "tasks",
    icon: CheckSquare,
    label: "Pending Tasks",
    bg: "bg-green-600 dark:bg-green-700",
    iconBg: "bg-green-700 dark:bg-green-800",
  },
  {
    key: "score",
    icon: Trophy,
    label: "Overall Score",
    bg: "bg-orange-500 dark:bg-orange-600",
    iconBg: "bg-orange-600 dark:bg-orange-700",
  },
] as const;

export function StatsCards({ eventsCount }: StatsCardsProps) {
  const { tasks } = useTasks();

  const pendingTasksCount = tasks.filter(
    (t) => t.columnId === "todo" || t.columnId === "in-progress"
  ).length;

  const completedTasks = tasks.filter((t) => t.columnId === "done").length;
  const overallScore =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const values = { events: eventsCount, tasks: pendingTasksCount, score: overallScore };

  return (
    <div className="flex flex-col gap-3 w-1/3 min-w-[180px]">
      {STAT_CONFIG.map(({ key, icon: Icon, label, bg, iconBg }) => (
        <div
          key={key}
          className={`${bg} rounded-2xl p-4 flex items-center gap-3 shadow-sm
                      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default`}
        >
          <div className={`${iconBg} rounded-xl p-2.5 flex-shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-extrabold text-white leading-none">
              {values[key]}
            </p>
            <p className="text-xs text-white/75 mt-0.5 leading-tight">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}