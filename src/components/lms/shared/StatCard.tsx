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
  variant?: "default" | "comic";
}

const ACCENT = {
  blue:   "bg-blue-50/70 text-blue-600 dark:bg-blue-950/40 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/20",
  green:  "bg-green-50/70 text-green-600 dark:bg-[#0D192E] dark:text-green-400 border border-green-200/50 dark:border-green-500/20",
  purple: "bg-purple-50/70 text-purple-600 dark:bg-purple-950/20 dark:text-violet-400 border border-purple-200/50 dark:border-purple-500/20",
  orange: "bg-orange-50/70 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/20",
  red:    "bg-red-50/70 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-500/20",
};

const ACCENT_COMIC_ICON = {
  blue:   "bg-blue-50 text-blue-600 dark:bg-[#0D192E] dark:text-cyan-400 border-2 border-slate-900 dark:border-cyan-400/30 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950",
  green:  "bg-green-50 text-green-600 dark:bg-[#0D192E] dark:text-green-400 border-2 border-slate-900 dark:border-green-500/20 group-hover:bg-green-600 group-hover:text-white dark:group-hover:bg-green-400 dark:group-hover:text-slate-950",
  purple: "bg-purple-50 text-purple-600 dark:bg-[#0D192E] dark:text-violet-400 border-2 border-slate-900 dark:border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-violet-400 dark:group-hover:text-slate-950",
  orange: "bg-orange-50 text-orange-600 dark:bg-[#0D192E] dark:text-orange-400 border-2 border-slate-900 dark:border-orange-500/20 group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-orange-400 dark:group-hover:text-slate-950",
  red:    "bg-red-50 text-red-600 dark:bg-[#0D192E] dark:text-red-400 border-2 border-slate-900 dark:border-red-500/20 group-hover:bg-red-600 group-hover:text-white dark:group-hover:bg-red-400 dark:group-hover:text-slate-950",
};

const BAR_ACCENT = {
  blue: "before:bg-blue-600 dark:before:bg-cyan-500",
  green: "before:bg-green-500 dark:before:bg-green-400",
  purple: "before:bg-purple-500 dark:before:bg-purple-400",
  orange: "before:bg-orange-500 dark:before:bg-orange-400",
  red: "before:bg-red-500 dark:before:bg-red-400",
};

export function StatCard({ label, value, sub, icon, accent = "blue", trend, className, variant = "default" }: StatCardProps) {
  if (variant === "comic") {
    return (
      <div className={cn(
        "bg-white dark:bg-[#0F1E35] rounded-2xl border-2 border-slate-900 dark:border-cyan-400",
        "shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(34,211,238,1)]",
        "hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(34,211,238,1)]",
        "transition-all duration-200 cursor-pointer group flex items-start gap-4 p-6 relative overflow-hidden",
        className
      )}>
        {/* Subtle halftone background overlay */}
        <div
          className="absolute -inset-6 opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none transform rotate-[10deg] text-blue-600 dark:text-cyan-400"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
          "transform transition-all duration-300 group-hover:scale-105",
          ACCENT_COMIC_ICON[accent]
        )}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0 relative z-10">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{value}</h4>
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