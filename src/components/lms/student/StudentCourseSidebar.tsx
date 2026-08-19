"use client";

import React from "react";
import { toast } from "react-hot-toast";
import { BookOpen, Search } from "lucide-react";
import {
  EmptyState,
  PageLoader,
  PrimaryBtn,
  ProgressCard,
  SearchBar,
  Select,
} from "@/components/lms/shared";
import { Enrollment } from "@/types";
import type { RecommendationItem } from "@/services/lms/recommendationService";

interface StudentCourseSidebarProps {
  acceptedEnrollments: Enrollment[];
  filteredAndSortedEnrollments: Enrollment[];
  courseRecommendations: RecommendationItem[];
  loadingEnrolled: boolean;
  selectedCourseId: number | null;
  setSelectedCourseId: (id: number) => void;
  courseSearchQuery: string;
  setCourseSearchQuery: (query: string) => void;
  courseStatusFilter: "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  setCourseStatusFilter: (filter: "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED") => void;
  courseSortOrder: "recommended" | "desc" | "asc";
  setCourseSortOrder: (order: "recommended" | "desc" | "asc") => void;
  onNavigateToDiscover: () => void;
  onNavigateToCourse: (courseId: number) => void;
}

export function StudentCourseSidebar({
  acceptedEnrollments,
  filteredAndSortedEnrollments,
  courseRecommendations,
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
          <SearchBar
            placeholder="Tìm kiếm khóa học..."
            value={courseSearchQuery}
            onChange={setCourseSearchQuery}
            size="sm"
          />

          {/* Filter Dropdowns Row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Status Filter */}
            <Select
              label="Trạng thái"
              size="sm"
              value={courseStatusFilter}
              onValueChange={(val: any) => setCourseStatusFilter(val)}
              options={[
                { value: "ALL", label: "Tất cả" },
                { value: "NOT_STARTED", label: "Chưa học" },
                { value: "IN_PROGRESS", label: "Đang học" },
                { value: "COMPLETED", label: "Đã xong" },
              ]}
            />

            {/* Date Sort Filter */}
            <Select
              label="Sắp xếp"
              size="sm"
              value={courseSortOrder}
              onValueChange={(val: any) => setCourseSortOrder(val)}
              options={[
                { value: "recommended", label: "Phù hợp nhất" },
                { value: "desc", label: "Mới nhất" },
                { value: "asc", label: "Cũ nhất" },
              ]}
            />
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
        <div className="max-h-[480px] lg:max-h-[calc(100vh-250px)] min-h-[200px] overflow-y-auto overflow-x-hidden overscroll-contain pl-3 pr-3.5 py-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-blue-900/50 space-y-3">
          {filteredAndSortedEnrollments.map((en) => {
            const isSelected = en.course_id === selectedCourseId;
            const isArchived = en.course_status === "ARCHIVED";
            const recommendation = courseRecommendations.find(item => item.entity.course_id === en.course_id);
            return (
              <ProgressCard
                key={en.id}
                courseId={en.course_id}
                title={en.course_title ?? `Khóa học #${en.course_id}`}
                teacherName={en.teacher_name}
                teacherAvatarUrl={en.teacher_avatar_url}
                progress={en.progress_percent || 0}
                isSelected={isSelected}
                enrolledAt={en.accepted_at || en.enrolled_at}
                recommendationBadge={recommendation?.badges[0]?.text}
                isUnavailable={isArchived}
                unavailableMessage={isArchived ? "Khóa học tạm thời bị vô hiệu hóa để xem xét lại nội dung vi phạm." : undefined}
                onUnavailableClick={isArchived ? () => toast.error("Khóa học tạm thời đóng để kiểm duyệt lại nội dung/bản quyền.", { duration: 5000 }) : undefined}
                onClick={() => !isArchived && setSelectedCourseId(en.course_id)}
                onOpenDetails={() => !isArchived && onNavigateToCourse(en.course_id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
