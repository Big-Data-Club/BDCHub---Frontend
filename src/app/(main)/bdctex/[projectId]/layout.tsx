import React from "react";

export default function LatexEditorLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-[calc(100vh-40px)] w-full overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950/20">{children}</div>;
}
