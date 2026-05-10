"use client";

import { cn } from "@/lib/utils";

interface AgentThinkingIndicatorProps {
  steps?: { step: string; detail?: string }[];
  className?: string;
}

const STEP_LABELS: Record<string, string> = {
  intent: "Phân tích ý định",
  memory: "Truy xuất ngữ cảnh",
};

export function AgentThinkingIndicator({
  steps,
  className,
}: AgentThinkingIndicatorProps) {
  const latestStep = steps?.[steps.length - 1];
  const label = latestStep
    ? STEP_LABELS[latestStep.step] || latestStep.step
    : "Đang suy nghĩ";

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl",
        "bg-slate-100 dark:bg-slate-800",
        "text-sm text-slate-500 dark:text-slate-500",
        className,
      )}
    >
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span>{label}...</span>
    </div>
  );
}
