"use client";

import React from "react";
import { Target, ChevronRight, Search, TrendingUp } from "lucide-react";
import { PrimaryBtn } from "../shared/Button";
import {
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";

interface FocusCourse {
  course_id: number;
  course_title?: string;
  progress_percent?: number;
}

interface CourseProgressAndGoalCardProps {
  focusCourse: FocusCourse | null;
  onNavigateToCourse?: (courseId: number) => void;
  onNavigateToDiscover?: () => void;
  totalCount: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  completedPercent: number;
  inProgressPercent: number;
  notStartedPercent: number;
  loading?: boolean;
}

export function CourseProgressAndGoalCard({
  focusCourse,
  onNavigateToCourse,
  onNavigateToDiscover,
  totalCount,
  completedCount,
  inProgressCount,
  notStartedCount,
  completedPercent,
  inProgressPercent,
  notStartedPercent,
  loading = false,
}: CourseProgressAndGoalCardProps) {
  if (loading) {
    return (
      <div className="h-[162px] w-full bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/10 animate-pulse" />
    );
  }

  return (
    <div className="bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-xs border border-slate-200/85 dark:border-blue-500/15 rounded-2xl p-4 shadow-xs hover:border-blue-300 dark:hover:border-blue-500/25 transition-all duration-200 w-full grid grid-cols-1 md:grid-cols-[1fr_1.25px_1fr] gap-x-6 md:gap-x-6 gap-y-2.5 md:gap-y-1.5 relative">

      {/* 1. Left column: Title & Info (Col 1, Row 1) */}
      <div className="md:col-start-1 md:row-start-1 flex flex-col justify-start">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50/80 text-blue-600 dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiến độ khóa học</h4>
          </div>
        </div>

        {totalCount > 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Đã tham gia <span className="text-blue-600 dark:text-cyan-400 font-bold">{totalCount}</span> khóa học
          </p>
        ) : (
          <div className="h-4 mt-2" />
        )}
      </div>

      {/* 2. Left column: Progress Bar (Col 1, Row 2) */}
      <div className="md:col-start-1 md:row-start-2 flex items-center h-6">
        {totalCount > 0 ? (
          <div className="h-2.5 w-full">
            {/* Segmented Progress Bar */}
            <TooltipProvider delayDuration={55}>
              <div className="h-2.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-[#080F1E]">
                {completedCount > 0 && (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div
                        style={{ width: `${completedPercent}%` }}
                        className="bg-emerald-500 dark:bg-emerald-450 transition-all duration-300 hover:brightness-110 hover:scale-y-125 cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-white rounded-xl shadow-lg px-3 py-1.5 text-xs font-semibold">
                      Đã xong: {completedCount} khóa ({Math.round(completedPercent)}%)
                    </TooltipContent>
                  </UITooltip>
                )}
                {inProgressCount > 0 && (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div
                        style={{ width: `${inProgressPercent}%` }}
                        className="bg-blue-600 dark:bg-cyan-500 transition-all duration-300 hover:brightness-110 hover:scale-y-125 cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-white rounded-xl shadow-lg px-3 py-1.5 text-xs font-semibold">
                      Đang học: {inProgressCount} khóa ({Math.round(inProgressPercent)}%)
                    </TooltipContent>
                  </UITooltip>
                )}
                {notStartedCount > 0 && (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div
                        style={{ width: `${notStartedPercent}%` }}
                        className="bg-slate-300 dark:bg-slate-700 transition-all duration-300 hover:brightness-110 hover:scale-y-125 cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-white rounded-xl shadow-lg px-3 py-1.5 text-xs font-semibold">
                      Chưa học: {notStartedCount} khóa ({Math.round(notStartedPercent)}%)
                    </TooltipContent>
                  </UITooltip>
                )}
              </div>
            </TooltipProvider>
          </div>
        ) : (
          <div className="h-2.5 w-full" />
        )}
      </div>

      {/* 3. Left column: Footer Stats (Col 1, Row 3) */}
      <div className="md:col-start-1 md:row-start-3 w-full border-t border-slate-200/60 dark:border-blue-500/10 pt-2 min-h-[38px] flex items-center">
        {totalCount === 0 ? (
          <div className="text-center py-2 text-xs text-slate-500 dark:text-slate-400 w-full">
            Chưa đăng ký khóa học nào
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-450 flex-shrink-0" />
                <span>Đã xong</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 w-full text-center">{completedCount}</p>
            </div>

            <div className="flex flex-col items-center justify-center text-center border-x border-slate-200/60 dark:border-blue-500/10">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-500 flex-shrink-0" />
                <span>Đang học</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 w-full text-center">{inProgressCount}</p>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 flex-shrink-0" />
                <span>Chưa học</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 w-full text-center">{notStartedCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Single unbroken Vertical Divider (Col 2, Row 1-3 Span) */}
      <div className="hidden md:block md:col-start-2 md:row-start-1 md:row-span-3 w-[1.5px] bg-slate-300/80 dark:bg-blue-500/30 self-stretch my-1 flex-shrink-0" />

      {/* 5. Right column: Title & Info (Col 3, Row 1) */}
      <div className="md:col-start-3 md:row-start-1 flex flex-col justify-start">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50/80 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Học phần tiếp theo</h4>
          </div>
        </div>

        {focusCourse ? (
          <div className="flex items-center justify-between gap-3 mt-1.5 w-full">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 min-w-0" title={focusCourse.course_title}>
              {focusCourse.course_title}
            </h3>
            {focusCourse.progress_percent !== undefined && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20 whitespace-nowrap flex-shrink-0">
                {focusCourse.progress_percent}%
              </span>
            )}
          </div>
        ) : totalCount > 0 ? (
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
            Đã hoàn thành mục tiêu
          </h3>
        ) : (
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
            Chưa có mục tiêu học tập
          </h3>
        )}
      </div>

      {/* 6. Right column: Progress Bar (Col 3, Row 2) */}
      <div className="md:col-start-3 md:row-start-2 flex items-center h-6">
        {focusCourse && focusCourse.progress_percent !== undefined && focusCourse.progress_percent > 0 ? (
          <TooltipProvider delayDuration={55}>
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="h-2.5 bg-slate-200 dark:bg-[#0D192E] rounded-full overflow-hidden w-full flex cursor-pointer group/progress">
                  <div
                    className="h-full bg-amber-600 dark:bg-amber-600 rounded-full transition-all duration-500 group-hover/progress:brightness-110 group-hover/progress:scale-y-125"
                    style={{ width: `${focusCourse.progress_percent}%` }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-white rounded-xl shadow-lg px-3 py-1.5 text-xs font-semibold">
                Tiến độ: {Math.round(focusCourse.progress_percent)}%
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        ) : focusCourse ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Bắt đầu bài học đầu tiên
          </p>
        ) : totalCount > 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Hoàn thành toàn bộ các khóa học
          </p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tiến hành khám phá các khóa học
          </p>
        )}
      </div>

      {/* 7. Right column: Action Button (Col 3, Row 3) */}
      <div className="md:col-start-3 md:row-start-3 w-full border-t border-slate-200/60 dark:border-blue-500/10 pt-2 min-h-[38px] flex items-center">
        {focusCourse ? (
          <PrimaryBtn
            onClick={() => onNavigateToCourse?.(focusCourse.course_id)}
            className="w-full bg-none bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-2 rounded-xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-1.5 dark:bg-none dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white"
            icon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            {focusCourse.progress_percent === 0 ? "Bắt đầu học" : "Học tiếp"}
          </PrimaryBtn>
        ) : (
          <PrimaryBtn
            onClick={onNavigateToDiscover}
            className="w-full text-xs py-2 bg-none bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl active:scale-[0.97] flex items-center justify-center gap-1.5 dark:bg-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            icon={<Search className="w-3.5 h-3.5" />}
          >
            {totalCount > 0 ? "Tìm khóa học mới" : "Khám phá khóa học"}
          </PrimaryBtn>
        )}
      </div>

    </div>
  );
}
