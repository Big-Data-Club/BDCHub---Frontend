"use client";

import { cn } from "@/lib/utils";

export function TabBar<T extends string>({
  tabs, active, onChange
}: { tabs: { id: T; label: string; badge?: number }[]; active: T; onChange: (id: T) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            active === t.id
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          {t.label}
          {t.badge !== undefined && t.badge > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {t.badge > 99 ? "99+" : t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}