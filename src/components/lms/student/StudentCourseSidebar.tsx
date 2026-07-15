"use client";

import React from "react";
import { BookOpen, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  PageLoader,
  PrimaryBtn,
  ProgressCard,
} from "@/components/lms/shared";
import { Enrollment } from "@/types";

interface StudentCourseSidebarProps {
  acceptedEnrollments: Enrollment[];
  filteredAndSortedEnrollments: Enrollment[];
  loadingEnrolled: boolean;
  selectedCourseId: number | null;
  setSelectedCourseId: (id: number) => void;
  courseSearchQuery: string;
  setCourseSearchQuery: (query: string) => void;
  courseStatusFilter: "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  setCourseStatusFilter: (filter: "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED") => void;
  courseSortOrder: "desc" | "asc";
  setCourseSortOrder: (order: "desc" | "asc") => void;
  onNavigateToDiscover: () => void;
  onNavigateToCourse: (courseId: number) => void;
}

export function StudentCourseSidebar({
  acceptedEnrollments,
  filteredAndSortedEnrollments,
  loadingEnrolled,
  selectedCourseId,
  setSelectedCourseId,
  courseSearchQuery,
  setCourseSearchQuery,
  courseStatusFilter,
  setCourseStatusFilter,
  courseSortOrder,
  setCourseSortOrder,
  onNavigateToDiscover,
  onNavigateToCourse,
}: StudentCourseSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="pb-2.5 border-b border-slate-200/80 dark:border-blue-500/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Khóa học của tôi
          </h2>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-[#0F1E35] text-blue-600 dark:text-cyan-400 font-extrabold border border-slate-200/60 dark:border-blue-500/10 shadow-xs">
            {filteredAndSortedEnrollments.length !== acceptedEnrollments.length
              ? `${filteredAndSortedEnrollments.length}/${acceptedEnrollments.length}`
              : acceptedEnrollments.length}
          </span>
        </div>
      </div>

      {acceptedEnrollments.length > 0 && (
        <div className="flex flex-col gap-2.5 bg-slate-50/50 dark:bg-[#0D192E]/40 border border-slate-200/80 dark:border-blue-500/10 rounded-2xl p-3">
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm học phần..."
              value={courseSearchQuery}
              onChange={(e) => setCourseSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-[#070E1C] border border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 focus:border-blue-500 dark:focus:border-cyan-450/40 transition-all duration-200 font-medium shadow-xs"
            />
          </div>

          {/* Filter Dropdowns Row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Status Filter */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Trạng thái</span>
              <Select
                value={courseStatusFilter}
                onValueChange={(val: any) => setCourseStatusFilter(val)}
              >
                <SelectTrigger className="w-full h-8.5 px-3 border border-slate-200 dark:border-blue-500/15 rounded-xl text-[11px] bg-white dark:bg-[#070E1C] text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all font-semibold shadow-xs">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0D192E] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs">
                  <SelectItem value="ALL" className="text-xs cursor-pointer">Tất cả</SelectItem>
                  <SelectItem value="NOT_STARTED" className="text-xs cursor-pointer">Chưa học</SelectItem>
                  <SelectItem value="IN_PROGRESS" className="text-xs cursor-pointer">Đang học</SelectItem>
                  <SelectItem value="COMPLETED" className="text-xs cursor-pointer">Đã xong</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Sort Filter */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Ngày đăng ký</span>
              <Select
                value={courseSortOrder}
                onValueChange={(val: any) => setCourseSortOrder(val)}
              >
                <SelectTrigger className="w-full h-8.5 px-3 border border-slate-200 dark:border-blue-500/15 rounded-xl text-[11px] bg-white dark:bg-[#070E1C] text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-cyan-400/10 transition-all font-semibold shadow-xs">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0D192E] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs">
                  <SelectItem value="desc" className="text-xs cursor-pointer">Mới nhất</SelectItem>
                  <SelectItem value="asc" className="text-xs cursor-pointer">Cũ nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {loadingEnrolled ? (
        <PageLoader message="Đang tải danh sách..." />
      ) : acceptedEnrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10 text-slate-400" />}
          title="Chưa đăng ký môn nào"
          description="Hãy khám phá và đăng ký khóa học phù hợp với bạn để bắt đầu."
          action={
            <PrimaryBtn icon={<Search className="w-4 h-4" />} onClick={onNavigateToDiscover}>
              Khám phá khóa học
            </PrimaryBtn>
          }
        />
      ) : filteredAndSortedEnrollments.length === 0 ? (
        <div className="text-center py-8 bg-slate-50/50 dark:bg-[#0D192E]/20 rounded-2xl border border-dashed border-slate-250 dark:border-blue-500/10">
          <Search className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Không tìm thấy học phần phù hợp.</p>
        </div>
      ) : (
        <div className="max-h-[480px] lg:max-h-[560px] overflow-y-auto overflow-x-hidden overscroll-contain pl-3 pr-3.5 py-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-blue-900/50 space-y-3">
          {filteredAndSortedEnrollments.map((en) => {
            const isSelected = en.course_id === selectedCourseId;
            return (
              <ProgressCard
                key={en.id}
                courseId={en.course_id}
                title={en.course_title ?? `Khóa học #${en.course_id}`}
                teacherName={en.teacher_name}
                progress={en.progress_percent || 0}
                isSelected={isSelected}
                enrolledAt={en.accepted_at || en.enrolled_at}
                onClick={() => setSelectedCourseId(en.course_id)}
                onOpenDetails={() => onNavigateToCourse(en.course_id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
