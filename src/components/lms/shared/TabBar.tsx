"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

export interface TabBarProps<T extends string = string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  variant?: "pill" | "underline";
  size?: "sm" | "md" | "lg";
  className?: string;
  tabClassName?: string;
  fullWidth?: boolean;
}

function TabBarInner<T extends string>({
  tabs,
  active,
  onChange,
  variant = "pill",
  size = "md",
  className,
  tabClassName,
  fullWidth = false,
}: TabBarProps<T>) {
  if (variant === "underline") {
    return (
      <nav
        role="tablist"
        className={cn(
          "flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-blue-500/15 scrollbar-none",
          className
        )}
      >
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              disabled={t.disabled}
              onClick={() => onChange(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold whitespace-nowrap border-b-2 -mb-px transition-colors duration-150 cursor-pointer active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                  ? "border-blue-600 text-blue-600 dark:border-cyan-400 dark:text-cyan-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-blue-500/30",
                tabClassName
              )}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span
                  className={cn(
                    "text-xs font-bold rounded-full px-1.5 py-0.5 transition-colors duration-150",
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-cyan-950/80 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30"
                      : "bg-slate-200 text-slate-700 dark:bg-[#162644] dark:text-slate-300"
                  )}
                >
                  {t.badge > 99 ? "99+" : t.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    );
  }

  // Standard Pill Variant (Original LMS Cyan-Blue active style + fixed tab width)
  return (
    <div className={cn("flex pb-1 overflow-x-auto scrollbar-none", fullWidth && "w-full", className)}>
      <div
        role="tablist"
        className={cn(
          "inline-flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-[#0D192E] border border-slate-200/60 dark:border-blue-500/15 rounded-2xl shadow-inner",
          fullWidth && "w-full"
        )}
      >
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              disabled={t.disabled}
              onClick={() => onChange(t.id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl text-xs md:text-sm font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap border active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed",
                size === "sm" && "px-3 py-1.5 text-xs",
                size === "md" && "px-4 py-2 text-xs md:text-sm",
                size === "lg" && "px-5 py-2.5 text-sm md:text-base",
                fullWidth && "flex-1",
                isActive
                  ? "bg-white text-blue-600 border-slate-200 shadow-xs dark:bg-cyan-500 dark:text-slate-950 dark:border-transparent dark:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "bg-transparent text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-blue-900/20",
                tabClassName
              )}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span
                  className={cn(
                    "text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-colors duration-150",
                    isActive
                      ? "bg-blue-600 text-white dark:bg-slate-950 dark:text-cyan-400"
                      : "bg-slate-200 text-slate-700 dark:bg-[#162644] dark:text-slate-300"
                  )}
                >
                  {t.badge > 99 ? "99+" : t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const TabBar = memo(TabBarInner) as typeof TabBarInner;