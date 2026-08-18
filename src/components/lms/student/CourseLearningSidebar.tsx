"use client";

import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronLeft } from "lucide-react";
import { useStudentCourse } from "./StudentCourseContext";
import { SidebarSection } from "./SidebarSection";

import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user/UserAvatar";

import { CourseDetailProgressCard } from "./CourseDetailProgressCard";

interface CourseLearningSidebarProps {
  onCollapseToggle?: () => void;
  isCollapsed?: boolean;
}

export function CourseLearningSidebar({ onCollapseToggle, isCollapsed }: CourseLearningSidebarProps) {
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

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#070E1C]">
      {/* Top Header Dock Bar with Toggle Trigger & Bulk Expand/Collapse */}
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-blue-500/10 flex items-center justify-between bg-slate-50/50 dark:bg-[#091224]">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate">
            Nội dung khóa học
          </span>
        </div>
        <div className="flex items-center gap-1">
          {sections.length > 0 && (
            <button
              onClick={() => {
                const allExpanded = sections.every(s => expanded.has(s.id));
                sections.forEach(s => {
                  if (allExpanded && expanded.has(s.id)) {
                    toggleSection(s.id);
                  } else if (!allExpanded && !expanded.has(s.id)) {
                    toggleSection(s.id);
                  }
                });
              }}
              className="px-2 py-1 rounded text-[10px] font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title={sections.every(s => expanded.has(s.id)) ? "Thu gọn tất cả" : "Mở rộng tất cả"}
            >
              {sections.every(s => expanded.has(s.id)) ? "Thu gọn" : "Mở tất cả"}
            </button>
          )}
          {onCollapseToggle && (
            <button
              onClick={onCollapseToggle}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Thu gọn sidebar (Ctrl+B)"
              aria-label="Thu gọn sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Instructor Section (Clean, non-nested row) */}
      {(course?.creator_name || (coTeachers && coTeachers.length > 0)) && (
        <div className="px-4 py-2.5 border-b border-slate-200/80 dark:border-blue-500/10 bg-slate-50/20 dark:bg-[#070E1C]">
          <button
            onClick={() => setIsTeachersExpanded(!isTeachersExpanded)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <span>Giảng viên phụ trách</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isTeachersExpanded ? "rotate-180" : "")} />
          </button>

          {isTeachersExpanded && (
            <div className="space-y-2 pt-2.5">
              {course?.creator_name && (
                <div className="flex items-center gap-2.5">
                  <UserAvatar name={course.creator_name} src={course.creator_avatar_url} className="h-7 w-7 shadow-xs" fallbackClassName="text-xs font-bold" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {course.creator_name}
                    </span>
                    <span className="block truncate text-xs font-medium text-blue-600 dark:text-cyan-400">Người tạo khóa học</span>
                  </div>
                </div>
              )}
              {coTeachers?.map((ct: any) => (
                <div key={ct.id} className="flex items-center gap-2.5" title={ct.email}>
                  <UserAvatar name={ct.full_name} src={ct.avatar_url} className="h-7 w-7 border border-slate-300/30 dark:border-blue-500/10" fallbackClassName="text-xs font-bold" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {ct.full_name}
                    </span>
                    <span className="block truncate text-xs font-normal text-slate-400">Đồng giáo viên</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section list */}
      <div className="flex-1 overflow-y-auto">
        {sections.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Khóa học chưa công bố nội dung</p>
            <p className="text-xs text-slate-400 mt-1">Các bài học sẽ hiển thị tại đây khi giảng viên phát hành.</p>
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
