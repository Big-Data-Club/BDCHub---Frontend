"use client";

import React, { memo } from "react";

interface CyberBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "blue" | "cyan" | "slate";
  className?: string;
}

const CyberBadge = memo(function CyberBadge({
  children,
  variant = "blue",
  className = "",
  ...props
}: CyberBadgeProps) {
  const variantClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-500/20",
    cyan: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30",
    slate: "bg-slate-100 dark:bg-[#070E1C] text-slate-800 dark:text-cyan-300 border-slate-200 dark:border-blue-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

export default CyberBadge;
