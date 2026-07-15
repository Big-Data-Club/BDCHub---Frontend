"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  gridOpacity?: string;
  showGlow?: boolean;
  glowTopClass?: string;
  glowBottomClass?: string;
  children?: ReactNode;
  className?: string;
}

export function GridBackground({
  gridOpacity = "opacity-40 dark:opacity-20",
  showGlow = true,
  glowTopClass = "absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none",
  glowBottomClass = "absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none",
  children,
  className,
}: GridBackgroundProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {/* Glow ambient background spots */}
      {showGlow && (
        <>
          <div className={cn(glowTopClass)} />
          <div className={cn(glowBottomClass)} />
        </>
      )}

      {/* Moving Grid Background */}
      <div className={cn("absolute -inset-32 bg-grid-paper rotate-[10deg] animate-grid-slide", gridOpacity)} />

      {/* Children for custom overlays */}
      {children ? (
        children
      ) : (
        <>
          {/* Default overlays for Discover and dashboard headers */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-100/40 to-slate-100 dark:via-[#050B18]/40 dark:to-[#050B18]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_60%,#050B18_100%)]" />
        </>
      )}
    </div>
  );
}
