"use client";

import React, { memo } from "react";

interface CyberBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "blue" | "cyan" | "emerald" | "amber" | "violet" | "rose" | "slate";
  className?: string;
}

const CyberBadge = memo(function CyberBadge({
  children,
  variant = "blue",
  className = "",
  ...props
}: CyberBadgeProps) {
  const variantClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-cyan-300 border-blue-200 dark:border-blue-500/25 shadow-sm shadow-blue-500/5",
    cyan: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30 shadow-sm shadow-cyan-500/5",
    emerald: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 shadow-sm shadow-emerald-500/5",
    amber: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 shadow-sm shadow-amber-500/5",
    violet: "bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-500/30 shadow-sm shadow-violet-500/5",
    rose: "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 shadow-sm shadow-rose-500/5",
    slate: "bg-slate-100 dark:bg-[#070E1C] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-blue-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

export default CyberBadge;

