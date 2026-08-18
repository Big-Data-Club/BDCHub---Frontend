"use client";

import React, { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TabsList } from "@/components/ui/tabs";
import {
  lmsTabsListVariants,
  lmsTabsTriggerVariants,
  TabBadge,
} from "./TabBar";

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

  return (
    <nav
      className={cn(
        variant === "pill" && "flex pb-1 overflow-x-auto scrollbar-none",
        fullWidth && "w-full",
        className
      )}
    >
      <TabsList
        className={cn(lmsTabsListVariants({ variant }), fullWidth && "w-full")}
      >
        {tabs.map((tab) => {
          const href = getHref(tab);
          const active = isTabActive(tab);
          return (
            <Link
              key={tab.id}
              href={href}
              aria-current={active ? "page" : undefined}
              data-state={active ? "active" : "inactive"}
              className={cn(
                lmsTabsTriggerVariants({ variant, size }),
                fullWidth && "flex-1",
                "active:scale-95"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <TabBadge badge={tab.badge} active={active} variant={variant} />
            </Link>
          );
        })}
      </TabsList>
    </nav>
  );
}

export const NavTabBar = memo(NavTabBarInner);
