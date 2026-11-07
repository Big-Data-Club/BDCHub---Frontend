"use client";

import { NotebookBrowser } from "@/features/notebook/components/NotebookBrowser";

export function AgentNotebookPanel({
  courseId,
  className,
}: {
  courseId?: number;
  className?: string;
}) {
  return (
    <NotebookBrowser
      key={courseId || "all"}
      courseId={courseId}
      className={className}
    />
  );
}
