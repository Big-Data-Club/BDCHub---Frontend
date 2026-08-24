"use client";

import { cn } from "@/lib/utils";

interface ClarificationCardProps {
  question: string;
  options: (string | { label: string; value: string })[];
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
      {question && (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {question}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => {
          const label = typeof opt === "string" ? opt : opt.label;
          // Structured options carry a machine value (e.g. course_id). Send
          // "label (#value)" so the backend can resolve the exact entity by
          // ID instead of re-running fuzzy title matching, while the text
          // stays natural for chitchat-style replies.
          const value = typeof opt === "string"
            ? opt
            : opt.value && /^\d+$/.test(opt.value) && opt.value !== opt.label
              ? `${opt.label} (#${opt.value})`
              : opt.label;
          return (
            <button
              key={i}
              onClick={() => onSelect(value)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold",
                "bg-white dark:bg-[#0F1E35]",
                "border border-slate-200 dark:border-blue-500/15",
                "text-slate-700 dark:text-slate-200",
                "hover:bg-blue-50/80 dark:hover:bg-[#12223a]",
                "hover:border-blue-400 dark:hover:border-cyan-500/40",
                "hover:text-blue-600 dark:hover:text-cyan-400",
                "transition-all duration-200 active:scale-95 cursor-pointer shadow-xs dark:shadow-none",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
