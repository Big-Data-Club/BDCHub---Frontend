"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "blue"|"green"|"yellow"|"red"|"gray"|"purple";

export function Badge({ children, variant = "gray" }: { children: ReactNode; variant?: BadgeVariant }) {
  const VARIANT_CLS: Record<BadgeVariant, string> = {
    blue:   "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/20",
    green:  "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/30",
    yellow: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30",
    red:    "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30",
    gray:   "bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50",
    purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-violet-400 border border-purple-200 dark:border-purple-500/20",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", VARIANT_CLS[variant])}>
      {children}
    </span>
  );
}