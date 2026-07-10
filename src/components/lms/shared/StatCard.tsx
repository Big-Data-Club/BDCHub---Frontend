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
  variant?: "default" | "comic" | "minimal" | "glassmorphic" | "progress" | "accent-bg" | "trend-emphasis";
  progress?: number;
  interactive?: boolean;
  onClick?: () => void;
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

const MINIMAL_BG = {
  blue: "bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-50/40 dark:hover:bg-blue-950/25",
  green: "bg-green-50/20 dark:bg-green-950/10 hover:bg-green-50/40 dark:hover:bg-green-950/25",
  purple: "bg-purple-50/20 dark:bg-purple-950/10 hover:bg-purple-50/40 dark:hover:bg-purple-950/25",
  orange: "bg-orange-50/20 dark:bg-orange-950/10 hover:bg-orange-50/40 dark:hover:bg-orange-950/25",
  red: "bg-red-50/20 dark:bg-red-950/10 hover:bg-red-50/40 dark:hover:bg-red-950/25",
};

const ACCENT_BG = {
  blue: "bg-blue-50/80 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-500/25 shadow-[0_0_15px_rgba(59,130,246,0.03)] hover:border-blue-300 dark:hover:border-blue-500/40",
  green: "bg-green-50/80 border-green-200/50 dark:bg-[#0D192E]/60 dark:border-green-500/25 shadow-[0_0_15px_rgba(34,197,94,0.03)] hover:border-green-300 dark:hover:border-green-500/40",
  purple: "bg-purple-50/80 border-purple-200/50 dark:bg-purple-950/10 dark:border-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.03)] hover:border-purple-300 dark:hover:border-purple-500/40",
  orange: "bg-orange-50/80 border-orange-200/50 dark:bg-orange-950/10 dark:border-orange-500/25 shadow-[0_0_15px_rgba(249,115,22,0.03)] hover:border-orange-300 dark:hover:border-orange-500/40",
  red: "bg-red-50/80 border-red-200/50 dark:bg-red-950/10 dark:border-red-500/25 shadow-[0_0_15px_rgba(239,68,68,0.03)] hover:border-red-300 dark:hover:border-red-500/40",
};

const PROGRESS_FILL = {
  blue: "bg-blue-600 dark:bg-cyan-500",
  green: "bg-green-500 dark:bg-green-400",
  purple: "bg-purple-500 dark:bg-purple-400",
  orange: "bg-orange-500 dark:bg-orange-400",
  red: "bg-red-500 dark:bg-red-400",
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "blue",
  trend,
  className,
  variant = "default",
  progress,
  interactive = false,
  onClick,
}: StatCardProps) {
  // Handle click capabilities and interactive state
  const isClickable = !!onClick || interactive;
  
  const interactionClasses = isClickable
    ? "cursor-pointer active:scale-[0.98] transition-all duration-200"
    : "";

  // Render trend element helper
  const renderTrend = (isBadgeMode = false) => {
    if (!trend) return null;
    if (isBadgeMode) {
      return (
        <span className={cn(
          "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border",
          trend.up
            ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/30"
            : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30"
        )}>
          <span>{trend.up ? "↑" : "↓"}</span>
          <span>{trend.value.split(" ")[0]}</span>
        </span>
      );
    }
    return (
      <p className={cn(
        "text-xs mt-1.5 font-bold flex items-center gap-1",
        trend.up ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
      )}>
        <span>{trend.up ? "↑" : "↓"}</span>
        <span>{trend.value}</span>
      </p>
    );
  };

  // Render progress bar helper
  const renderProgressBar = () => {
    if (progress === undefined) return null;
    const cleanProgress = Math.min(100, Math.max(0, progress));
    return (
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-blue-500/5">
        <div className="flex justify-between items-center mb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          <span>Tiến độ</span>
          <span className="text-slate-600 dark:text-cyan-400">{Math.round(cleanProgress)}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-[#0D192E] rounded-full overflow-hidden border dark:border-blue-500/5">
          <div
            className={cn("h-full rounded-full transition-all duration-500", PROGRESS_FILL[accent])}
            style={{ width: `${cleanProgress}%` }}
          />
        </div>
      </div>
    );
  };

  if (variant === "comic") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "bg-white dark:bg-[#0F1E35] rounded-2xl border-2 border-slate-900 dark:border-cyan-400",
          "shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(34,211,238,1)]",
          "hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(34,211,238,1)]",
          "transition-all duration-200 cursor-pointer group flex flex-col p-6 relative overflow-hidden",
          interactionClasses,
          className
        )}
      >
        {/* Subtle halftone background overlay */}
        <div
          className="absolute -inset-6 opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none transform rotate-[10deg] text-blue-600 dark:text-cyan-400"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="flex items-start gap-4">
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
            {renderTrend()}
          </div>
        </div>

        {renderProgressBar()}
      </div>
    );
  }

  // Define style map based on variant
  let cardStyles = "";
  let iconContainer = cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border", ACCENT[accent]);

  if (variant === "minimal") {
    cardStyles = cn(
      "border-none rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden",
      MINIMAL_BG[accent]
    );
    iconContainer = cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border text-sm", ACCENT[accent]);
  } else if (variant === "glassmorphic") {
    cardStyles = cn(
      "bg-white/70 border border-slate-200/50 backdrop-blur-md shadow-lg shadow-slate-100/50 rounded-2xl p-6",
      "dark:bg-[#0F1E35]/50 dark:border-blue-500/20 dark:shadow-[0_0_30px_rgba(37,99,235,0.04)]",
      "hover:bg-white/90 dark:hover:border-blue-500/35 dark:hover:shadow-[0_0_40px_rgba(37,99,235,0.08)]",
      "transition-all duration-300"
    );
  } else if (variant === "accent-bg") {
    cardStyles = cn(
      "rounded-2xl border p-6 transition-all duration-300",
      ACCENT_BG[accent]
    );
  } else {
    // default, progress, trend-emphasis variants use the default structured base styling
    cardStyles = cn(
      "bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/15",
      "shadow-sm p-6 flex flex-col relative overflow-hidden",
      "hover:border-blue-300 dark:hover:border-blue-500/25 transition-all duration-200",
      "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1",
      BAR_ACCENT[accent]
    );
  }

  const isTrendEmphasis = variant === "trend-emphasis";

  return (
    <div
      onClick={onClick}
      className={cn(cardStyles, interactionClasses, className)}
    >
      <div className="flex items-start gap-4">
        <div className={iconContainer}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
          {isTrendEmphasis ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{value}</span>
              {renderTrend(true)}
            </div>
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
          )}
          {sub && <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
          {!isTrendEmphasis && renderTrend()}
        </div>
      </div>

      {(variant === "progress" || progress !== undefined) && renderProgressBar()}
    </div>
  );
}