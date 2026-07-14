"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { GhostBtn } from "@/components/lms/shared";
import { CourseProgressAndGoalCard } from "./CourseProgressAndGoalCard";

interface FocusCourse {
  course_id: number;
  course_title?: string;
  progress_percent?: number;
}

interface StudentDashboardHeaderProps {
  focusCourse: FocusCourse | null;
  totalCount: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  completedPercent: number;
  inProgressPercent: number;
  notStartedPercent: number;
  loadingEnrolled: boolean;
  loadAllData: () => void;
  onNavigateToCourse: (courseId: number) => void;
  onNavigateToDiscover: () => void;
}

export function StudentDashboardHeader({
  focusCourse,
  totalCount,
  completedCount,
  inProgressCount,
  notStartedCount,
  completedPercent,
  inProgressPercent,
  notStartedPercent,
  loadingEnrolled,
  loadAllData,
  onNavigateToCourse,
  onNavigateToDiscover,
}: StudentDashboardHeaderProps) {
  return (
    <div className="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-4 md:py-5">
      {/* Tilted Grid background utilizing the exact global css class bg-grid-paper (40px 40px) and slide animation */}
      <div className="absolute -inset-32 bg-grid-paper pointer-events-none opacity-40 dark:opacity-20 rotate-[10deg] animate-grid-slide" />

      {/* Soft gradient overlays to fade out the grid gracefully */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-100/40 to-slate-100 dark:via-[#050B18]/40 dark:to-[#050B18] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_60%,#050B18_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 w-full">
        <div className="min-w-0 flex-1 lg:max-w-md">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Tổng quan học tập
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
            Theo dõi tiến độ, phân tích và tối ưu hóa lộ trình học tập của bạn.
          </p>
          <div className="mt-3.5">
            <GhostBtn
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={loadAllData}
              className="active:scale-95 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0D192E]/60 backdrop-blur-xs font-semibold"
            >
              Làm mới dữ liệu
            </GhostBtn>
          </div>
        </div>

        <div className="w-full lg:max-w-2xl xl:max-w-3xl flex-shrink-0">
          <CourseProgressAndGoalCard
            focusCourse={focusCourse}
            totalCount={totalCount}
            completedCount={completedCount}
            inProgressCount={inProgressCount}
            notStartedCount={notStartedCount}
            completedPercent={completedPercent}
            inProgressPercent={inProgressPercent}
            notStartedPercent={notStartedPercent}
            loading={loadingEnrolled}
            onNavigateToCourse={onNavigateToCourse}
            onNavigateToDiscover={onNavigateToDiscover}
          />
        </div>
      </div>
    </div>
  );
}
