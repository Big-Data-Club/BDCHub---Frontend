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
  blue:   "bg-blue-50  text-blue-600  dark:bg-blue-900/20  dark:text-blue-400",
  green:  "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  red:    "bg-red-50   text-red-600   dark:bg-red-900/20   dark:text-red-400",
};

export function StatCard({ label, value, sub, icon, accent = "blue", trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800",
      "shadow-sm p-6 flex items-start gap-4",
      className
    )}>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", ACCENT[accent])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{sub}</p>}
        {trend && (
          <p className={cn("text-xs mt-1 font-medium", trend.up ? "text-green-600" : "text-red-500")}>
            {trend.up ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}