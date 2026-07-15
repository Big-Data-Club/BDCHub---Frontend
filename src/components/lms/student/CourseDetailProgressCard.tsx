"use client";

import React from "react";
import { Target, ChevronRight, BookOpen } from "lucide-react";
import { PrimaryBtn } from "../shared/Button";
import {
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import { Content, Section, Course } from "@/types";
import { CourseProgress } from "@/services/progressService";

interface CourseDetailProgressCardProps {
  course: Course | null;
  progress: CourseProgress | null;
  completedIds: Set<number>;
  sections: Section[];
  sectionContents: Record<number, Content[]>;
  onSelectContent: (content: Content) => void;
  loading?: boolean;
}

export function CourseDetailProgressCard({
  course,
  progress,
  completedIds,
  sections,
  sectionContents,
  onSelectContent,
  loading = false,
}: CourseDetailProgressCardProps) {
  if (loading) {
    return (
      <div className="h-[140px] w-full bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/10 animate-pulse" />
    );
  }

  const flatContents = sections.flatMap(s => sectionContents[s.id] ?? []);
  const mandatoryContents = flatContents.filter(c => c.is_mandatory);
  const completedCount = progress?.completed_count ?? flatContents.filter(c => completedIds.has(c.id) && c.is_mandatory).length;
  const totalMandatory = progress?.total_mandatory ?? mandatoryContents.length;
  const progressPct = totalMandatory > 0 ? Math.round((completedCount / totalMandatory) * 100) : 0;

  // Find next uncompleted content (prefer mandatory first, then any)
  const nextLesson = flatContents.find(c => c.is_mandatory && !completedIds.has(c.id))
    || flatContents.find(c => !completedIds.has(c.id));

  const completedPercent = progressPct;
  const remainingPercent = 100 - completedPercent;

  return (
    <div className="group/card bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-xs border border-slate-200/85 dark:border-blue-500/15 rounded-2xl p-4 shadow-xs hover:border-slate-350 dark:hover:border-blue-500/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(6,182,212,0.03)] w-full grid grid-cols-1 md:grid-cols-[1fr_1.25px_1fr] gap-x-6 gap-y-2.5 md:gap-y-1.5 relative">
      
      {/* 1. Left column: Progress Title */}
      <div className="md:col-start-1 md:row-start-1 flex flex-col justify-start">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50/80 text-blue-600 dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/20 group-hover/card:scale-105 group-hover/card:bg-blue-100/90 dark:group-hover/card:bg-blue-900/80 transition-all duration-300">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiến trình học tập</h4>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
          Khóa học gồm <span className="text-blue-600 dark:text-cyan-400 font-bold">{flatContents.length}</span> bài học
        </p>
      </div>

      {/* 2. Left column: Progress Bar */}
      <div className="md:col-start-1 md:row-start-2 flex items-center h-6">
        <div className="h-2.5 w-full">
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
                    Đã hoàn thành: {completedCount}/{totalMandatory} bài bắt buộc ({completedPercent}%)
                  </TooltipContent>
                </UITooltip>
              )}
              {totalMandatory - completedCount > 0 && (
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div
                      style={{ width: `${remainingPercent}%` }}
                      className="bg-slate-300 dark:bg-slate-700 transition-all duration-300 hover:brightness-110 hover:scale-y-125 cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-white rounded-xl shadow-lg px-3 py-1.5 text-xs font-semibold">
                    Chưa học: {totalMandatory - completedCount}/{totalMandatory} bài bắt buộc ({remainingPercent}%)
                  </TooltipContent>
                </UITooltip>
              )}
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* 3. Left column: Footer Stats */}
      <div className="md:col-start-1 md:row-start-3 w-full border-t border-slate-200/60 dark:border-blue-500/10 pt-2 min-h-[38px] flex items-center">
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-450 flex-shrink-0" />
              <span>Đã hoàn thành</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 w-full text-center">{completedCount}</p>
          </div>

          <div className="flex flex-col items-center justify-center text-center border-l border-slate-200/60 dark:border-blue-500/10">
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 flex-shrink-0" />
              <span>Bắt buộc</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 w-full text-center">{totalMandatory}</p>
          </div>
        </div>
      </div>

      {/* 4. Vertical Divider */}
      <div className="hidden md:block md:col-start-2 md:row-start-1 md:row-span-3 w-[1.5px] bg-slate-200 dark:bg-blue-500/15 group-hover/card:bg-blue-300/40 dark:group-hover/card:bg-blue-500/35 self-stretch my-1 transition-all duration-300 flex-shrink-0" />

      {/* 5. Right column: Next Task Title */}
      <div className="md:col-start-3 md:row-start-1 flex flex-col justify-start">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50/80 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20 group-hover/card:scale-105 group-hover/card:bg-amber-100/90 dark:group-hover/card:bg-amber-900/60 transition-all duration-300">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nhiệm vụ tiếp theo</h4>
          </div>
        </div>

        {nextLesson ? (
          <div className="flex items-center justify-between gap-3 mt-1.5 w-full">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 min-w-0" title={nextLesson.title}>
              {nextLesson.title}
            </h3>
            {nextLesson.is_mandatory && (
              <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/40 dark:border-amber-500/25 px-1.5 py-0.5 rounded-md whitespace-nowrap flex-shrink-0 uppercase tracking-wider">
                Bắt buộc
              </span>
            )}
          </div>
        ) : (
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">
            Đã xong toàn bộ bài học
          </h3>
        )}
      </div>

      {/* 6. Right column: Subtitle or Status description */}
      <div className="md:col-start-3 md:row-start-2 flex items-center h-6">
        {nextLesson ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            Loại hình: <span className="font-bold">{nextLesson.type}</span>
          </p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Chúc mừng bạn đã hoàn tất mục tiêu khóa học!
          </p>
        )}
      </div>

      {/* 7. Right column: Action Button */}
      <div className="md:col-start-3 md:row-start-3 w-full border-t border-slate-200/60 dark:border-blue-500/10 pt-2 min-h-[38px] flex items-center">
        {nextLesson ? (
          <PrimaryBtn
            onClick={() => onSelectContent(nextLesson)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-2 rounded-xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-1.5"
            icon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            {completedCount === 0 ? "Bắt đầu học" : "Học tiếp"}
          </PrimaryBtn>
        ) : (
          <div className="w-full text-center py-1.5 text-xs font-bold text-emerald-500 dark:text-emerald-450 border border-dashed border-emerald-200 dark:border-emerald-500/20 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/10">
            ✓ Khóa học hoàn thành
          </div>
        )}
      </div>
      
    </div>
  );
}
