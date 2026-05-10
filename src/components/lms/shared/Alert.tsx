"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, AlertCircle
} from "lucide-react";

export function Alert({ type = "info", children }: { type?: "info"|"warning"|"error"|"success"; children: ReactNode }) {
  const STYLE = {
    info:    "bg-blue-50  border-blue-200  text-blue-800  dark:bg-blue-900/20  dark:border-blue-800  dark:text-blue-300",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
    error:   "bg-red-50   border-red-200   text-red-800   dark:bg-red-900/20   dark:border-red-800   dark:text-red-300",
    success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
  };
  const ICON = { info: <AlertCircle className="w-4 h-4" />, warning: <AlertCircle className="w-4 h-4" />, error: <AlertCircle className="w-4 h-4" />, success: <CheckCircle2 className="w-4 h-4" /> };
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-xl border", STYLE[type])}>
      {ICON[type]}
      <div className="text-sm flex-1">{children}</div>
    </div>
  );
}