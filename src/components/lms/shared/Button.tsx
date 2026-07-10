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
        "inline-flex items-center justify-center gap-2 font-bold rounded-xl",
        "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm shadow-blue-500/10",
        "hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200",
        "dark:bg-gradient-to-r dark:from-cyan-500 dark:to-cyan-600 dark:text-slate-950 dark:shadow-sm dark:shadow-cyan-950/10",
        "dark:hover:from-cyan-400 dark:hover:to-cyan-500",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        SIZE_CLS[size], className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner className="w-4 h-4 border-2 border-current" /> : icon}
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, loading, icon, size = "md", className, disabled, ...rest }: BtnProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl border transition-all duration-200",
        "bg-white border-slate-300 text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400",
        "dark:bg-lms-card dark:border-blue-500/20 dark:text-slate-300 dark:hover:bg-lms-hover dark:hover:border-blue-500/40 dark:hover:text-white",
        "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
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
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200",
        "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
        "dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-lms-hover",
        "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
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