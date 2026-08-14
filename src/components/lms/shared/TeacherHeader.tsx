"use client";

import React, { ReactNode } from "react";
import { GridBackground } from "./GridBackground";
import { cn } from "@/lib/utils";

export interface TeacherHeaderProps {
  categoryLabel?: string;
  title: string;
  description?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function TeacherHeader({
  categoryLabel = "Hệ thống quản lý học tập (LMS)",
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: TeacherHeaderProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-4 md:py-5",
        className
      )}
    >
      <GridBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 w-full">
        <div className="min-w-0 flex-1">
          {breadcrumbs ? (
            <div className="mb-2">{breadcrumbs}</div>
          ) : (
            <p className="text-[11px] text-blue-600 dark:text-cyan-400 uppercase tracking-widest font-extrabold mb-1">
              {categoryLabel}
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {title}
          </h1>

          {description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 font-medium max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
