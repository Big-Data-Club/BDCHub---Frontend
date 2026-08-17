"use client";

import React from "react";
import { Course, Section } from "@/types";
import { CheckCircle, Activity, Sparkles, ChevronDown } from "lucide-react";
import { ProgressBar } from "@/components/lms/shared/ProgressBar";

interface CourseReadinessPopoverProps {
  course: Course;
  sections: Section[];
}

export function CourseReadinessPopover({ course, sections }: CourseReadinessPopoverProps) {
  const isPublished = course.status === "PUBLISHED";
  const hasDescription = !!course.description;
  const hasCategory = !!course.category;
  const hasLevel = !!course.level;
  const hasSections = sections.length > 0;

  const checklistItems = [
    { label: "Cập nhật mô tả chi tiết khóa học", checked: hasDescription },
    { label: "Phân loại danh mục và cấp độ học", checked: hasCategory && hasLevel },
    { label: "Biên soạn tối thiểu 01 chương học", checked: hasSections },
    { label: "Xuất bản khóa học công khai", checked: isPublished },
  ];

  const checkedCount = checklistItems.filter(item => item.checked).length;
  const readinessPercent = Math.round((checkedCount / checklistItems.length) * 100);

  return (
    <div className="relative group/readinesspopover">
      {/* Metric Trigger Button */}
      <div 
        tabIndex={0}
        role="button"
        aria-label="Xem chi tiết độ sẵn sàng vận hành"
        className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#0D192E]/90 border border-slate-100 dark:border-blue-500/10 hover:border-blue-400/40 dark:hover:border-cyan-400/40 flex items-center justify-between cursor-pointer transition-all duration-200 shadow-2xs"
      >
        <div>
          <div className="flex items-center gap-1">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Mức hoàn thiện
            </p>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover/readinesspopover:rotate-180 transition-transform duration-200" />
          </div>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {readinessPercent}% hoàn tất
          </p>
        </div>

        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          readinessPercent === 100 
            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/20" 
            : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/20"
        }`}>
          {readinessPercent === 100 ? (
            <CheckCircle className="w-4 h-4 stroke-[2.2]" />
          ) : (
            <Activity className="w-4 h-4 stroke-[2.2]" />
          )}
        </div>
      </div>

      {/* Hover Dropdown / Popover Content */}
      <div className="absolute right-0 top-full mt-2 z-50 invisible opacity-0 group-hover/readinesspopover:visible group-hover/readinesspopover:opacity-100 group-focus-within/readinesspopover:visible group-focus-within/readinesspopover:opacity-100 transition-all duration-200 ease-out transform -translate-y-1 group-hover/readinesspopover:translate-y-0 pointer-events-none group-hover/readinesspopover:pointer-events-auto w-72 sm:w-80">
        <div className="bg-white/95 dark:bg-[#0D192E]/95 backdrop-blur-md border border-slate-200/90 dark:border-blue-500/30 rounded-2xl p-4 shadow-xl space-y-3 ring-1 ring-slate-900/5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                Tiêu chuẩn phát hành
              </span>
            </div>
            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-lg border ${
              readinessPercent === 100 
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30" 
                : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
            }`}>
              {readinessPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <ProgressBar 
            value={readinessPercent} 
            max={100} 
            color={readinessPercent === 100 ? "green" : "blue"} 
            showPercent={false} 
            className="w-full h-1.5" 
          />

          {/* Description */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-snug">
            {readinessPercent === 100 
              ? "Khóa học đã đáp ứng đầy đủ tiêu chuẩn và sẵn sàng phát hành tới học viên."
              : `Đã hoàn thành ${checkedCount}/${checklistItems.length} tiêu chuẩn phát hành.`}
          </p>

          {/* Checklist items */}
          <div className="space-y-1.5 pt-1">
            {checklistItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                  item.checked 
                    ? "bg-slate-50/70 dark:bg-[#0F1E35]/60 border-slate-200/60 dark:border-blue-500/10 text-slate-700 dark:text-slate-200" 
                    : "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/30 text-amber-900 dark:text-amber-200"
                }`}
              >
                {item.checked ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 shrink-0 animate-pulse" />
                )}
                <span className={`text-[11px] truncate ${
                  item.checked 
                    ? "line-through text-slate-400 dark:text-slate-500 decoration-slate-300 dark:decoration-slate-600" 
                    : "text-slate-800 dark:text-slate-200 font-semibold"
                }`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
