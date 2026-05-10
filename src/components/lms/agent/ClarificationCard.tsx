"use client";

import { cn } from "@/lib/utils";

interface ClarificationCardProps {
  question: string;
  options: string[];
  onSelect: (option: string) => void;
}

export function ClarificationCard({
  question,
  options,
  onSelect,
}: ClarificationCardProps) {
  if (!options.length) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onSelect(opt)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium",
              "bg-white dark:bg-slate-800",
              "border border-slate-300 dark:border-slate-700",
              "text-slate-700 dark:text-slate-300",
              "hover:bg-blue-50 dark:hover:bg-slate-700",
              "hover:border-blue-400 dark:hover:border-blue-500",
              "hover:text-blue-700 dark:hover:text-blue-400",
              "transition-all duration-200 active:scale-95",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
