"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "blue"|"green"|"yellow"|"red"|"gray"|"purple";

export function Badge({ children, variant = "gray" }: { children: ReactNode; variant?: BadgeVariant }) {
  const VARIANT_CLS: Record<BadgeVariant, string> = {
    blue:   "bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-300 border border-blue-200/80 dark:border-cyan-500/30",
    green:  "bg-green-50/80 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200/80 dark:border-green-500/30",
    yellow: "bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30",
    red:    "bg-red-50/80 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-500/30",
    gray:   "bg-slate-100/80 dark:bg-[#0D192E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-blue-500/15",
    purple: "bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-violet-300 border border-purple-200/80 dark:border-purple-500/30",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide", VARIANT_CLS[variant])}>
      {children}
    </span>
  );
}