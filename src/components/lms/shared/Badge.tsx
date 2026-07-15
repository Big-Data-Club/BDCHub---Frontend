"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "blue"|"green"|"yellow"|"red"|"gray"|"purple";

export function Badge({ children, variant = "gray" }: { children: ReactNode; variant?: BadgeVariant }) {
  const VARIANT_CLS: Record<BadgeVariant, string> = {
    blue:   "bg-blue-50/60 dark:bg-blue-950/30 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/20",
    green:  "bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
    yellow: "bg-amber-50/60 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
    red:    "bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20",
    gray:   "bg-slate-100/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800",
    purple: "bg-purple-50/60 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap", VARIANT_CLS[variant])}>
      {children}
    </span>
  );
}