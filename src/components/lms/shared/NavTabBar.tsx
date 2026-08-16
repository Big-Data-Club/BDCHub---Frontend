"use client";

import React, { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavTabItem {
  id: string;
  label: string;
  path: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface NavTabBarProps {
  tabs: NavTabItem[];
  basePath?: string;
  variant?: "pill" | "underline";
  size?: "sm" | "md";
  className?: string;
  fullWidth?: boolean;
}

function NavTabBarInner({
  tabs,
  basePath = "",
  variant = "pill",
  size = "sm",
  className,
  fullWidth = false,
}: NavTabBarProps) {
  const pathname = usePathname();

  const getHref = (tab: NavTabItem) => {
    if (tab.href) return tab.href;
    return `${basePath}${tab.path}`;
  };

  const isTabActive = (tab: NavTabItem) => {
    const targetHref = getHref(tab);
    if (tab.id === "overview" || tab.id === "learn") {
      return pathname === targetHref || pathname.startsWith(`${targetHref}/`);
    }
    return pathname.includes(tab.path) || pathname.startsWith(targetHref);
  };

  if (variant === "underline") {
    return (
      <nav
        className={cn(
          "flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-blue-500/15 scrollbar-none",
          className
        )}
      >
        {tabs.map((tab) => {
          const href = getHref(tab);
          const active = isTabActive(tab);
          return (
            <Link
              key={tab.id}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold whitespace-nowrap border-b-2 -mb-px transition-colors duration-150 cursor-pointer active:opacity-80",
                active
                  ? "border-blue-600 text-blue-600 dark:border-cyan-400 dark:text-cyan-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-blue-500/30"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    "text-xs font-bold rounded-full px-1.5 py-0.5 transition-colors duration-150",
                    active
                      ? "bg-blue-100 text-blue-700 dark:bg-cyan-950/80 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30"
                      : "bg-slate-200 text-slate-700 dark:bg-[#162644] dark:text-slate-300"
                  )}
                >
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Standard Pill Variant (Original LMS Cyan-Blue active style + fixed tab width)
  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-slate-100/80 dark:bg-[#0D192E] border border-slate-200/60 dark:border-blue-500/15 rounded-xl p-1 shadow-inner overflow-x-auto max-w-full scrollbar-none",
        size === "sm" ? "h-10" : "h-11",
        fullWidth && "w-full",
        className
      )}
    >
      {tabs.map((tab) => {
        const href = getHref(tab);
        const active = isTabActive(tab);
        return (
          <Link
            key={tab.id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap h-full border active:opacity-80",
              fullWidth && "flex-1",
              active
                ? "bg-white text-blue-600 border-slate-200 shadow-xs dark:bg-cyan-500 dark:text-slate-950 dark:border-transparent dark:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "bg-transparent text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-blue-900/20"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn(
                  "text-xs font-bold rounded-full px-1.5 py-0.5 transition-colors duration-150",
                  active
                    ? "bg-blue-600 text-white dark:bg-slate-950 dark:text-cyan-400"
                    : "bg-slate-200 text-slate-700 dark:bg-[#162644] dark:text-slate-300"
                )}
              >
                {tab.badge > 99 ? "99+" : tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export const NavTabBar = memo(NavTabBarInner);
