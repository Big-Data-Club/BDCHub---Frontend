"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "blue"|"green"|"yellow"|"red"|"gray"|"purple";

export function Badge({ children, variant = "gray" }: { children: ReactNode; variant?: BadgeVariant }) {
  const VARIANT_CLS: Record<BadgeVariant, string> = {
    blue:   "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    green:  "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    red:    "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    gray:   "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", VARIANT_CLS[variant])}>
      {children}
    </span>
  );
}