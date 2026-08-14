"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface RadioTileOption<T extends string = string> {
  value: T;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export interface RadioTileGroupProps<T extends string = string> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: RadioTileOption<T>[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function RadioTileGroup<T extends string = string>({
  label,
  value,
  onChange,
  options,
  className,
  columns = 2,
}: RadioTileGroupProps<T>) {
  const GRID_COLS = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div role="radiogroup" className={cn("grid gap-4", GRID_COLS[columns])}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-bold transition-all duration-200 text-left active:scale-[0.98]",
                selected
                  ? "border-blue-500 dark:border-cyan-400 bg-blue-50/60 dark:bg-blue-950/30 text-blue-600 dark:text-cyan-400 shadow-xs"
                  : "border-slate-200 dark:border-blue-500/15 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-blue-500/30 bg-slate-50/50 dark:bg-[#0D192E]/40"
              )}
            >
              {opt.icon && (
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    selected
                      ? "bg-blue-500 text-white dark:bg-cyan-400 dark:text-slate-950"
                      : "bg-slate-200/70 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  {opt.icon}
                </div>
              )}
              <div>
                <span className="block font-bold">{opt.title}</span>
                {opt.description && (
                  <span className="block text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 leading-tight">
                    {opt.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
