"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "blue" | "green" | "yellow" | "red" | "gray" | "purple" | "orange" | "cyan";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  glow?: boolean;
}

export function Badge({
  children,
  variant = "gray",
  size = "sm",
  dot = false,
  glow = false,
  className,
  ...props
}: BadgeProps) {
  const VARIANT_CLS: Record<BadgeVariant, string> = {
    blue:   "bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-400 border-blue-200/80 dark:border-blue-500/25",
    cyan:   "bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-500/25",
    green:  "bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-500/25",
    yellow: "bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-500/25",
    orange: "bg-orange-50/70 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-500/25",
    red:    "bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-500/25",
    gray:   "bg-slate-100/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800",
    purple: "bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200/80 dark:border-purple-500/25",
  };

  const DOT_CLS: Record<BadgeVariant, string> = {
    blue: "bg-blue-500 dark:bg-cyan-400",
    cyan: "bg-cyan-500 dark:bg-cyan-300",
    green: "bg-emerald-500 dark:bg-emerald-400",
    yellow: "bg-amber-500 dark:bg-amber-400",
    orange: "bg-orange-500 dark:bg-orange-400",
    red: "bg-rose-500 dark:bg-rose-400",
    gray: "bg-slate-400 dark:bg-slate-500",
    purple: "bg-purple-500 dark:bg-purple-400",
  };

  const SIZE_CLS: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-150",
        SIZE_CLS[size],
        VARIANT_CLS[variant],
        glow && "shadow-xs shadow-current/10",
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", DOT_CLS[variant])} />}
      {children}
    </span>
  );
}