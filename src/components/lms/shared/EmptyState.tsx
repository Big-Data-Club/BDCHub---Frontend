"use client";

import { ReactNode } from "react";

export function EmptyState({
  icon, title, description, action
}: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-slate-300 dark:text-slate-700 mb-4">{icon}</div>}
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}