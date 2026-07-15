"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {label}
          </label>
        )}
        <select
          className={cn(
            "w-full rounded-xl px-4 py-3 bg-slate-50 dark:bg-lms-input border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all duration-200 text-sm",
            error && "border-red-500 dark:border-red-500/50 focus:ring-red-500/20 dark:focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
