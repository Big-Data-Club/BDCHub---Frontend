"use client";

import { cn } from "@/lib/utils";

export function Divider({ className }: { className?: string }) {
  return <div className={cn("border-t border-slate-200 dark:border-slate-800", className)} />;
}