"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";

interface DashboardHeaderProps {
  notificationCount?: number;
}

export function DashboardHeader({ notificationCount = 4 }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full
                    pb-6 border-b border-slate-200 dark:border-slate-800">
      <div>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          Dashboard
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quản lý sự kiện và thông báo của bạn
        </p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64 sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Tìm kiếm..."
            className="pl-9 w-full rounded-xl
                       border border-slate-300 dark:border-slate-700
                       bg-slate-50 dark:bg-slate-800
                       text-slate-900 dark:text-slate-100
                       placeholder:text-slate-400 dark:placeholder:text-slate-600
                       focus:bg-white dark:focus:bg-slate-900
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                       transition-all duration-200"
          />
        </div>

        <div className="relative flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="rounded-xl text-slate-600 dark:text-slate-400
                       hover:bg-slate-100 dark:hover:bg-slate-800
                       transition-all duration-200"
          >
            <Bell className="h-5 w-5" />
          </Button>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center
                             bg-red-500 text-white text-[10px] font-bold rounded-full leading-none
                             pointer-events-none">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}