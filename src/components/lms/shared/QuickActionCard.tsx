"use client";

import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { InteractiveGlowCard } from "./InteractiveGlowCard";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
  actionLabel?: string;
  accentColor?: "blue" | "green" | "purple" | "orange" | "red" | "cyan";
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  actionLabel = "Bắt đầu ngay",
  accentColor = "blue",
  className,
}: QuickActionCardProps) {
  return (
    <InteractiveGlowCard
      accentColor={accentColor}
      interactive={true}
      onClick={onClick}
      className={cn("h-full", className)}
    >
      <div className="flex flex-col h-full items-start">
        {/* Icon wrapper */}
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 border",
            "bg-slate-100 dark:bg-blue-950/40 text-slate-700 dark:text-cyan-400 border-slate-200/60 dark:border-blue-500/15",
            "group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-cyan-300"
          )}
        >
          {icon}
        </div>

        {/* Title & Description */}
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
          {title}
        </h4>
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-3 flex-grow font-normal">
          {description}
        </p>

        {/* Action link */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-cyan-400 mt-auto group-hover:gap-1.5 transition-all">
          <span>{actionLabel}</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </InteractiveGlowCard>
  );
}
