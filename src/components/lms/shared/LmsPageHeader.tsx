"use client";

import React, { ReactNode } from "react";
import { GridBackground } from "./GridBackground";
import { cn } from "@/lib/utils";

export interface LmsPageHeaderProps {
  /** Label/Category text on top (e.g. "Khóa học học viên") */
  categoryLabel?: string;
  /** Main page title */
  title: ReactNode;
  /** Subtitle/description text */
  description?: ReactNode;
  /** Optional breadcrumbs element */
  breadcrumbs?: ReactNode;
  /** Right-hand side action / widget element (e.g. ProgressCard, Action buttons) */
  sideWidget?: ReactNode;
  /** Alias for sideWidget / right-hand side action element */
  actions?: ReactNode;
  /** Bottom bar element (e.g. NavTabBar, Search filter) */
  bottomBar?: ReactNode;
  /** Custom container styling */
  className?: string;
  /** Custom inner flex wrapper styling */
  contentClassName?: string;
  /** Controls max-width of container (default: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", pass "w-full px-4 sm:px-6 lg:px-8 xl:px-12" for wide) */
  fullWidth?: boolean;
}

export function LmsPageHeader({
  categoryLabel,
  title,
  description,
  breadcrumbs,
  sideWidget,
  actions,
  bottomBar,
  className,
  contentClassName,
  fullWidth = false,
}: LmsPageHeaderProps) {
  const rightContent = actions ?? sideWidget;

  return (
    <header
      className={cn(
        "relative w-full overflow-visible border-b border-slate-200/80 dark:border-blue-500/15 bg-white/40 dark:bg-[#070E1C]/60 backdrop-blur-xl pt-7 pb-6 md:pt-9 md:pb-8 z-20 flex-shrink-0",
        className
      )}
    >
      <GridBackground />

      <div
        className={cn(
          "relative z-10 w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8",
          fullWidth
            ? "w-full px-4 sm:px-6 lg:px-8 xl:px-12"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
          contentClassName
        )}
      >
        <div className="min-w-0 flex-1 space-y-3">
          {breadcrumbs}

          {categoryLabel && (
            <p className="text-xs text-blue-600 dark:text-cyan-400 uppercase tracking-widest font-extrabold mb-2 leading-normal">
              {categoryLabel}
            </p>
          )}

          <div className="pt-1 pb-1">
            {typeof title === "string" ? (
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.35] truncate py-1">
                {title}
              </h1>
            ) : (
              title
            )}

            {description && (
              typeof description === "string" ? (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1.5 max-w-2xl line-clamp-2 leading-relaxed">
                  {description}
                </p>
              ) : (
                description
              )
            )}
          </div>

          {bottomBar && (
            <div className="pt-1 flex items-center gap-3 flex-wrap">
              {bottomBar}
            </div>
          )}
        </div>

        {rightContent && (
          <div className="w-full lg:w-auto flex-shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}
