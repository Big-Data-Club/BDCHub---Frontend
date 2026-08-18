"use client";

import React, { memo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* -------------------------------------------------------------------------- */
/* LMS Tab CVA Variants                                                      */
/* -------------------------------------------------------------------------- */

export const lmsTabsListVariants = cva(
  "inline-flex items-center justify-center text-muted-foreground",
  {
    variants: {
      variant: {
        pill: "gap-1 p-1 bg-slate-100/90 dark:bg-[#0D192E] border border-slate-200/60 dark:border-blue-500/15 rounded-2xl shadow-inner overflow-x-auto max-w-full scrollbar-none",
        underline: "flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-blue-500/15 scrollbar-none",
      },
    },
    defaultVariants: {
      variant: "pill",
    },
  }
);

export const lmsTabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        pill:
          "gap-2 rounded-xl font-bold transition-all duration-150 cursor-pointer border active:opacity-80 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-slate-200 data-[state=active]:shadow-xs dark:data-[state=active]:bg-cyan-500 dark:data-[state=active]:text-slate-950 dark:data-[state=active]:border-transparent dark:data-[state=active]:shadow-[0_0_15px_rgba(6,182,212,0.3)] data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-500 dark:data-[state=inactive]:text-slate-400 data-[state=inactive]:border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-blue-900/20",
        underline:
          "gap-2 px-4 py-2.5 text-xs md:text-sm font-bold border-b-2 -mb-px transition-colors duration-150 cursor-pointer active:opacity-80 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:border-cyan-400 dark:data-[state=active]:text-cyan-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-blue-500/30",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-xs md:text-sm",
        lg: "px-5 py-2.5 text-sm md:text-base",
      },
    },
    defaultVariants: {
      variant: "pill",
      size: "md",
    },
  }
);

export const lmsTabBadgeVariants = cva(
  "text-xs font-bold rounded-full transition-colors duration-150",
  {
    variants: {
      variant: {
        pill: "",
        underline: "px-1.5 py-0.5",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "underline",
        active: true,
        className:
          "bg-blue-100 text-blue-700 dark:bg-cyan-950/80 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30",
      },
      {
        variant: "underline",
        active: false,
        className:
          "bg-slate-200 text-slate-700 dark:bg-[#162644] dark:text-slate-300",
      },
      {
        variant: "pill",
        active: true,
        className:
          "w-5 h-5 flex items-center justify-center bg-blue-600 text-white dark:bg-slate-950 dark:text-cyan-400",
      },
      {
        variant: "pill",
        active: false,
        className:
          "w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-700 dark:bg-[#162644] dark:text-slate-300",
      },
    ],
    defaultVariants: {
      variant: "pill",
      active: false,
    },
  }
);

export interface TabBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof lmsTabBadgeVariants> {
  badge?: number;
}

export function TabBadge({
  badge,
  active = false,
  variant = "pill",
  className,
  ...props
}: TabBadgeProps) {
  if (badge === undefined || badge <= 0) return null;

  const displayBadge = badge > 99 ? "99+" : badge;

  return (
    <span
      className={cn(lmsTabBadgeVariants({ variant, active, className }))}
      {...props}
    >
      {displayBadge}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* TabBar Component (State-based Main Tab)                                    */
/* -------------------------------------------------------------------------- */

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

export interface TabBarProps<T extends string = string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  variant?: "pill" | "underline";
  size?: "sm" | "md" | "lg";
  className?: string;
  tabClassName?: string;
  fullWidth?: boolean;
}

function TabBarInner<T extends string>({
  tabs,
  active,
  onChange,
  variant = "pill",
  size = "md",
  className,
  tabClassName,
  fullWidth = false,
}: TabBarProps<T>) {
  return (
    <Tabs
      value={active}
      onValueChange={(val) => onChange(val as T)}
      className={cn(
        variant === "pill" && "flex pb-1 overflow-x-auto scrollbar-none",
        fullWidth && "w-full",
        className
      )}
    >
      <TabsList
        className={cn(lmsTabsListVariants({ variant }), fullWidth && "w-full")}
      >
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <TabsTrigger
              key={t.id}
              value={t.id}
              disabled={t.disabled}
              className={cn(
                lmsTabsTriggerVariants({ variant, size }),
                fullWidth && "flex-1",
                tabClassName
              )}
            >
              {t.icon}
              <span>{t.label}</span>
              <TabBadge badge={t.badge} active={isActive} variant={variant} />
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

export const TabBar = memo(TabBarInner) as typeof TabBarInner;