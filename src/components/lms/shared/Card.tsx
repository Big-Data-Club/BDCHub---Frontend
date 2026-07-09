"use client";

import { cn } from "@/lib/utils";

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-lms-card border border-slate-200 dark:border-blue-500/10 rounded-2xl shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-blue-500/25 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}