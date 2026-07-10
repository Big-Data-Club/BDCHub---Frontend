"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  accent?: "blue" | "green" | "purple" | "orange" | "red";
  trend?: { value: string; up: boolean };
  className?: string;
}

const ACCENT = {
  blue:   "bg-blue-50/70 text-blue-600 dark:bg-blue-950/40 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/20",
  green:  "bg-green-50/70 text-green-600 dark:bg-[#0D192E] dark:text-green-400 border border-green-200/50 dark:border-green-500/20",
  purple: "bg-purple-50/70 text-purple-600 dark:bg-purple-950/20 dark:text-violet-400 border border-purple-200/50 dark:border-purple-500/20",
  orange: "bg-orange-50/70 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/20",
  red:    "bg-red-50/70 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-500/20",
};

const BAR_ACCENT = {
  blue: "before:bg-blue-600 dark:before:bg-cyan-500",
  green: "before:bg-green-500 dark:before:bg-green-400",
  purple: "before:bg-purple-500 dark:before:bg-purple-400",
  orange: "before:bg-orange-500 dark:before:bg-orange-400",
  red: "before:bg-red-500 dark:before:bg-red-400",
};

export function StatCard({ label, value, sub, icon, accent = "blue", trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-lms-card rounded-2xl border border-slate-200 dark:border-blue-500/15",
      "shadow-sm p-6 flex items-start gap-4 relative overflow-hidden",
      "hover:border-blue-300 dark:hover:border-blue-500/25 transition-all duration-200",
      "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1",
      BAR_ACCENT[accent],
      className
    )}>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border", ACCENT[accent])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
        {sub && <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
        {trend && (
          <p className={cn("text-xs mt-1.5 font-bold flex items-center gap-1", trend.up ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
            <span>{trend.up ? "↑" : "↓"}</span>
            <span>{trend.value}</span>
          </p>
        )}
      </div>
    </div>
  );
}