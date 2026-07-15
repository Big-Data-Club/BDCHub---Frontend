"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, AlertCircle
} from "lucide-react";

export function Alert({ type = "info", children }: { type?: "info"|"warning"|"error"|"success"; children: ReactNode }) {
  const STYLE = {
    info:    "bg-blue-50/70 border-blue-200 border-l-blue-600 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:border-l-cyan-400 dark:text-cyan-200",
    warning: "bg-amber-50/70 border-amber-200 border-l-amber-500 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:border-l-amber-400 dark:text-amber-200",
    error:   "bg-red-50/70 border-red-200 border-l-red-500 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:border-l-red-400 dark:text-red-200",
    success: "bg-green-50/70 border-green-200 border-l-green-600 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:border-l-green-400 dark:text-green-200",
  };
  const ICON = {
    info: <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-cyan-400" />,
    warning: <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />,
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600 dark:text-green-400" />
  };
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-xl border border-l-4 shadow-sm", STYLE[type])}>
      {ICON[type]}
      <div className="text-sm font-medium flex-1 leading-relaxed">{children}</div>
    </div>
  );
}