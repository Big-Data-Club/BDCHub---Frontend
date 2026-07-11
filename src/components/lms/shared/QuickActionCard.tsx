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
            "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 border",
            "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-cyan-400 border-transparent dark:border-cyan-500/10",
            "group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950"
          )}
        >
          {icon}
        </div>

        {/* Title & Description */}
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
          {title}
        </h4>
        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4 flex-grow">
          {description}
        </p>

        {/* Action button */}
        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-400 mt-auto group-hover:gap-2 transition-all">
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </InteractiveGlowCard>
  );
}
