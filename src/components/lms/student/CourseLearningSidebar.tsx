"use client";

import React, { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { useStudentCourse } from "./StudentCourseContext";
import { SidebarSection } from "./SidebarSection";
import { ProgressBar } from "@/components/lms/shared/ProgressBar";
import { cn } from "@/lib/utils";

export function CourseLearningSidebar() {
  const {
    course,
    sections,
    coTeachers,
    activeContent,
    setActiveContent,
    sectionContents,
    loadingSection,
    expanded,
    toggleSection,
    completedIds,
    progress,
  } = useStudentCourse();

  const [isTeachersExpanded, setIsTeachersExpanded] = useState(false);

  // Compute progress numbers
  const totalMandatory = progress?.total_mandatory
    ?? Object.values(sectionContents).flat().filter(c => c.is_mandatory).length;
  const completedCount = progress?.completed_count ?? completedIds.size;
  const progressPct = totalMandatory > 0 ? Math.round((completedCount / totalMandatory) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#070E1C]">
      {/* Sidebar header (Giảng viên & Trợ giảng) */}
      {(course?.teacher_name || (coTeachers && coTeachers.length > 0)) && (
        <div className="p-4 border-b border-slate-200/80 dark:border-blue-500/10 bg-slate-50/30 dark:bg-[#070E1C]">
          <div className="bg-slate-50/50 dark:bg-[#0F1E35]/40 border border-slate-200/40 dark:border-blue-500/8 rounded-2xl p-3.5 space-y-3">
            <button
              onClick={() => setIsTeachersExpanded(!isTeachersExpanded)}
              className="flex items-center justify-between w-full text-[9.5px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
            >
              <span>Giảng viên phụ trách</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isTeachersExpanded ? "rotate-180" : "")} />
            </button>

            {isTeachersExpanded && (
              <div className="space-y-2.5 pt-1">
                {/* Giảng viên chính */}
                {course?.teacher_name && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 flex items-center justify-center text-[10px] font-bold shadow-xs shrink-0">
                      {course.teacher_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {course.teacher_name}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Trợ giảng */}
                {coTeachers?.map((ct: any) => (
                  <div key={ct.id} className="flex items-center gap-2.5 group relative cursor-help shrink-0" title={ct.email}>
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-blue-950 text-slate-700 dark:text-slate-350 border border-slate-300/30 dark:border-blue-500/10 flex items-center justify-center text-[10px] font-bold group-hover:border-blue-500/30 dark:group-hover:border-cyan-500/30 transition-all shrink-0">
                      {(ct.full_name || "TA").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                        {ct.full_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section list */}
      <div className="flex-1 overflow-y-auto">
        {sections.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Khóa học chưa có nội dung</p>
          </div>
        ) : (
          sections.map((sec, i) => (
            <SidebarSection
              key={sec.id}
              section={sec}
              index={i}
              contents={sectionContents[sec.id] ?? []}
              loading={!!loadingSection[sec.id]}
              isExpanded={expanded.has(sec.id)}
              onToggle={() => toggleSection(sec.id)}
              activeContentId={activeContent?.id ?? null}
              onSelect={setActiveContent}
              completedIds={completedIds}
            />
          ))
        )}
      </div>
    </div>
  );
}
