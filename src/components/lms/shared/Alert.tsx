"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, AlertCircle
} from "lucide-react";

export function Alert({ type = "info", children }: { type?: "info"|"warning"|"error"|"success"; children: ReactNode }) {
  const STYLE = {
    info:    "bg-blue-50  border-blue-200  text-blue-600  dark:bg-blue-950/40  dark:border-blue-800/30  dark:text-cyan-400",
    warning: "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800/30 dark:text-amber-400",
    error:   "bg-red-50   border-red-200   text-red-500   dark:bg-red-950/40   dark:border-red-800/30   dark:text-red-400",
    success: "bg-green-50 border-green-200 text-green-600 dark:bg-green-950/40 dark:border-green-800/30 dark:text-green-400",
  };
  const ICON = { info: <AlertCircle className="w-4 h-4" />, warning: <AlertCircle className="w-4 h-4" />, error: <AlertCircle className="w-4 h-4" />, success: <CheckCircle2 className="w-4 h-4" /> };
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-xl border", STYLE[type])}>
      {ICON[type]}
      <div className="text-sm flex-1">{children}</div>
    </div>
  );
}