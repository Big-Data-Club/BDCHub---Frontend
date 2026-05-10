"use client";

import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin", className)} />
  );
}

export function PageLoader({ message = "Đang tải..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner />
      <p className="text-sm text-slate-500 dark:text-slate-500">{message}</p>
    </div>
  );
}