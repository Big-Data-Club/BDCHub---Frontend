"use client";

import { cn } from "@/lib/utils";

export function TabBar<T extends string>({
  tabs, active, onChange
}: { tabs: { id: T; label: string; badge?: number }[]; active: T; onChange: (id: T) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-lms-input border border-slate-200/50 dark:border-blue-500/10 rounded-xl p-1">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-98",
            active === t.id
              ? "bg-white text-blue-600 border border-slate-200/50 dark:border-blue-500/15 dark:bg-lms-card dark:text-cyan-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          {t.label}
          {t.badge !== undefined && t.badge > 0 && (
            <span className={cn(
              "text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-colors duration-200",
              active === t.id
                ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950"
                : "bg-slate-200 text-slate-700 dark:bg-[#162644] dark:text-slate-300"
            )}>
              {t.badge > 99 ? "99+" : t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}