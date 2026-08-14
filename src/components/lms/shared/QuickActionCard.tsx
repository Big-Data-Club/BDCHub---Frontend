"use client";

import { ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
  actionLabel?: string;
  accentColor?: "blue" | "green" | "purple" | "orange" | "red" | "cyan";
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  actionLabel,
  accentColor = "blue",
  variant = "default",
  className,
}: QuickActionCardProps) {
  const variantStyles = {
    default: "border-slate-200/80 dark:border-blue-500/10 hover:border-slate-300 dark:hover:border-blue-500/25 bg-white/80 dark:bg-[#0D192E]/60 text-slate-700 dark:text-slate-300",
    primary: "border-blue-200/60 dark:border-blue-800/30 hover:border-blue-400/60 dark:hover:border-blue-600/50 bg-blue-50/40 dark:bg-blue-950/20 text-blue-600 dark:text-cyan-400",
    success: "border-emerald-200/60 dark:border-emerald-800/30 hover:border-emerald-400/60 dark:hover:border-emerald-600/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    warning: "border-amber-200/60 dark:border-amber-800/30 hover:border-amber-400/60 dark:hover:border-amber-600/50 bg-amber-50/40 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
  };

  const selectedVariant = variant !== "default" ? variant : (
    accentColor === "green" ? "success" :
    accentColor === "orange" || accentColor === "red" ? "warning" :
    accentColor === "blue" || accentColor === "cyan" ? "primary" : "default"
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-4 p-4.5 rounded-2xl border transition-all duration-200 ease-out",
        "active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none w-full text-left backdrop-blur-xs shadow-2xs hover:shadow-md",
        variantStyles[selectedVariant],
        className
      )}
    >
      {/* Icon container */}
      <div className="flex-shrink-0 mt-0.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-current transition-transform duration-300 ease-out group-hover:scale-110 border border-slate-200/50 dark:border-blue-500/10">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
            {title}
          </h4>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-1 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-all duration-200 ease-out flex-shrink-0" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
          {description}
        </p>
        {actionLabel && (
          <div className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-400 group-hover:gap-1.5 transition-all duration-200">
            <span>{actionLabel}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
          </div>
        )}
      </div>
    </button>
  );
}


