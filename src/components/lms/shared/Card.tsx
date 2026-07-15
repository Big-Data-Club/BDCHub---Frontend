"use client";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentColor?: "blue" | "green" | "purple" | "orange" | "red" | "cyan";
}

const ACCENT_BAR_STYLE = {
  blue: "before:bg-blue-600 dark:before:bg-blue-500",
  green: "before:bg-green-500 dark:before:bg-green-400",
  purple: "before:bg-purple-500 dark:before:bg-purple-400",
  orange: "before:bg-orange-500 dark:before:bg-orange-400",
  red: "before:bg-red-500 dark:before:bg-red-400",
  cyan: "before:bg-cyan-500 dark:before:bg-cyan-400",
};

export function Card({ children, className, accentColor, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-lms-card border border-slate-200 dark:border-blue-500/15 rounded-2xl shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden",
        accentColor && cn(
          "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1",
          ACCENT_BAR_STYLE[accentColor]
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}