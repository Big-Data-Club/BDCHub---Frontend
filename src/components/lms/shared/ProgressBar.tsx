"use client";

import { cn } from "@/lib/utils";

export function ProgressBar({
  value, max, color = "blue", label, showPercent = true, className
}: {
  value: number; max: number; color?: "blue"|"green"|"purple"|"orange";
  label?: string; showPercent?: boolean; className?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const TRACK = { blue: "bg-blue-600", green: "bg-green-500", purple: "bg-purple-500", orange: "bg-orange-500" };

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>}
          {showPercent && <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{pct}%</span>}
        </div>
      )}
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", TRACK[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}