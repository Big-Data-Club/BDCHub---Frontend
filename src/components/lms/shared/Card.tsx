"use client";

import { cn } from "@/lib/utils";

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}