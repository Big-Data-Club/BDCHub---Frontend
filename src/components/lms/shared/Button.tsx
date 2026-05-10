"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLS = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" };

export function PrimaryBtn({ children, loading, icon, size = "md", className, disabled, ...rest }: BtnProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 font-semibold rounded-xl bg-blue-600 text-white",
        "hover:bg-blue-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
        SIZE_CLS[size], className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner className="w-4 h-4 border-2" /> : icon}
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, loading, icon, size = "md", className, disabled, ...rest }: BtnProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 font-medium rounded-xl",
        "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700",
        "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
        "active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        SIZE_CLS[size], className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner className="w-4 h-4 border-2" /> : icon}
      {children}
    </button>
  );
}

export function GhostBtn({ children, loading, icon, size = "md", className, disabled, ...rest }: BtnProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 font-medium rounded-xl",
        "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
        "hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        SIZE_CLS[size], className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner className="w-4 h-4 border-2" /> : icon}
      {children}
    </button>
  );
}