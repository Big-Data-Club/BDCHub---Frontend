"use client";

import { ReactNode } from "react";

export function SectionHeader({
  title, subtitle, action
}: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}