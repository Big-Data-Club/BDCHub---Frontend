"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InteractiveGlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  accentColor?: "blue" | "green" | "purple" | "orange" | "red" | "cyan";
  interactive?: boolean;
  showGlow?: boolean;
  showOffset?: boolean;
  isSelected?: boolean;
  innerClassName?: string;
}

const GLOW_COLOR = {
  blue: "bg-blue-500/10 dark:bg-cyan-500/5",
  green: "bg-green-500/10 dark:bg-green-500/5",
  purple: "bg-purple-500/10 dark:bg-violet-500/5",
  orange: "bg-orange-500/10 dark:bg-orange-500/5",
  red: "bg-red-500/10 dark:bg-red-500/5",
  cyan: "bg-cyan-500/10 dark:bg-cyan-500/5",
};

const UNDERLAY_COLOR = {
  blue: "bg-blue-600 dark:bg-cyan-500",
  green: "bg-green-600 dark:bg-green-500",
  purple: "bg-purple-600 dark:bg-violet-500",
  orange: "bg-orange-600 dark:bg-orange-500",
  red: "bg-red-600 dark:bg-red-500",
  cyan: "bg-cyan-600 dark:bg-cyan-500",
};

const HOVER_BORDER = {
  blue: "hover:border-blue-600 dark:hover:border-cyan-500 dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  green: "hover:border-green-600 dark:hover:border-green-500 dark:hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]",
  purple: "hover:border-purple-600 dark:hover:border-violet-500 dark:hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
  orange: "hover:border-orange-600 dark:hover:border-orange-500 dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]",
  red: "hover:border-red-600 dark:hover:border-red-500 dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]",
  cyan: "hover:border-cyan-600 dark:hover:border-cyan-500 dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
};

export function InteractiveGlowCard({
  children,
  className,
  accentColor = "blue",
  interactive = true,
  showGlow = true,
  showOffset = true,
  isSelected = false,
  innerClassName,
  ...props
}: InteractiveGlowCardProps) {
  return (
    <div className={cn("relative", interactive ? "group" : "", className)} {...props}>
      {/* Glow Ambient spot behind the card */}
      {showGlow && (
        <div
          className={cn(
            "absolute -inset-2 rounded-3xl blur-xl opacity-0 transition-opacity duration-300 pointer-events-none",
            interactive ? "group-hover:opacity-100" : "",
            GLOW_COLOR[accentColor]
          )}
        />
      )}

      {/* Underlay / Offset Solid Background */}
      {showOffset && interactive && (
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 translate-y-0 group-hover:translate-x-1.5 group-hover:translate-y-1.5",
            UNDERLAY_COLOR[accentColor]
          )}
        />
      )}

      {/* Main Interactive Card */}
      <div
        className={cn(
          "w-full h-full bg-white dark:bg-[#0F1E35] border rounded-2xl p-6 transition-all duration-300",
          isSelected
            ? "border-transparent ring-2 ring-blue-500/80 dark:ring-cyan-400/85 shadow-[0_0_15px_rgba(59,130,246,0.12)] dark:shadow-[0_0_15px_rgba(6,182,212,0.12)]"
            : "border-slate-200 dark:border-blue-500/15",
          interactive
            ? cn(
                "relative z-10 transform translate-x-0 translate-y-0 group-hover:-translate-x-1 group-hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40",
                HOVER_BORDER[accentColor]
              )
            : "",
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
