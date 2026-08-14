"use client";

import React from "react";
import { BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TeacherSummaryCardProps {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses?: number;
  totalStudents: number;
  className?: string;
}

export function TeacherSummaryCard({
  totalCourses,
  publishedCourses,
  draftCourses,
  archivedCourses = 0,
  totalStudents,
  className,
}: TeacherSummaryCardProps) {
  const publishedPercent = totalCourses > 0 ? (publishedCourses / totalCourses) * 100 : 0;
  const draftPercent = totalCourses > 0 ? (draftCourses / totalCourses) * 100 : 0;
  const archivedPercent = totalCourses > 0 ? (archivedCourses / totalCourses) * 100 : 0;

  const hasArchivedCol = archivedCourses > 0;

  return (
    <div
      className={cn(
        "group/card bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-xs border border-slate-200/85 dark:border-blue-500/15 rounded-2xl p-4 shadow-xs hover:border-slate-355 dark:hover:border-blue-500/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:hover:shadow-[0_8px_30px_rgba(6,182,212,0.03)] w-full grid grid-cols-1 md:grid-cols-[1fr_1.25px_1fr] gap-x-6 gap-y-3 relative",
        className
      )}
    >
      {/* Left column: Courses status */}
      <div className="md:col-start-1 flex flex-col justify-start">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50/80 text-blue-600 dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/20 group-hover/card:scale-105 transition-all duration-300">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trạng thái Khóa học</h4>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Tổng số: <span className="text-blue-600 dark:text-cyan-400 font-bold">{totalCourses}</span> khóa học
        </p>

        {/* Status progress bar */}
        <div className="h-2.5 w-full mt-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-[#080F1E]">
          {publishedCourses > 0 && (
            <div style={{ width: `${publishedPercent}%` }} className="bg-emerald-500 dark:bg-emerald-400" title={`Đã xuất bản: ${publishedCourses}`} />
          )}
          {draftCourses > 0 && (
            <div style={{ width: `${draftPercent}%` }} className="bg-amber-500 dark:bg-amber-450" title={`Bản nháp: ${draftCourses}`} />
          )}
          {archivedCourses > 0 && (
            <div style={{ width: `${archivedPercent}%` }} className="bg-slate-400 dark:bg-slate-550" title={`Đã lưu trữ: ${archivedCourses}`} />
          )}
        </div>

        <div className={cn("grid gap-1 mt-4 pt-3 border-t border-slate-200/60 dark:border-blue-500/10", hasArchivedCol ? "grid-cols-3" : "grid-cols-2")}>
          <div className="text-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Xuất bản</span>
            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{publishedCourses}</p>
          </div>
          <div className="text-center border-l border-slate-200/60 dark:border-blue-500/10">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Bản nháp</span>
            <p className="text-sm font-extrabold text-amber-600 dark:text-amber-450 mt-0.5">{draftCourses}</p>
          </div>
          {hasArchivedCol && (
            <div className="text-center border-l border-slate-200/60 dark:border-blue-500/10">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Lưu trữ</span>
              <p className="text-sm font-extrabold text-slate-500 dark:text-slate-400 mt-0.5">{archivedCourses}</p>
            </div>
          )}
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden md:block md:col-start-2 w-[1.5px] bg-slate-200 dark:bg-blue-500/15 self-stretch my-1 transition-all duration-300 flex-shrink-0" />

      {/* Right column: Learner Engagement */}
      <div className="md:col-start-3 flex flex-col justify-start">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-50/80 text-purple-600 dark:bg-purple-950/65 dark:text-purple-300 border border-purple-200/50 dark:border-purple-500/20 group-hover/card:scale-105 transition-all duration-300">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tác động giảng dạy</h4>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Tổng số học viên trong các lớp học của bạn
        </p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalStudents}
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Học viên</span>
        </div>

        <div className="mt-auto border-t border-slate-200/60 dark:border-blue-500/10 pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
            <span>Lớp đang hoạt động</span>
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">24/7 Live</span>
        </div>
      </div>
    </div>
  );
}
