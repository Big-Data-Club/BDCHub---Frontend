"use client";

import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/lms/shared";
import { StudentCourseSidebar } from "@/components/lms/student/StudentCourseSidebar";
import { StudentCourseAnalytics } from "@/components/lms/student/StudentCourseAnalytics";
import { StudentDashboardHeader } from "@/components/lms/student/StudentDashboardHeader";
import { useScrollSnap } from "@/hooks/common/useScrollSnap";
import { useStudentDashboard } from "@/hooks/lms/student/useStudentDashboard";
import { trackRecommendationEvent } from "@/services/lms/recommendationService";

export default function StudentDashboard() {
  const router = useRouter();

  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-snap: when user scrolls past the header, snap to content area
  useScrollSnap(headerRef, contentRef, { stickyHeaderHeight: 64 });

  const {
    mounted,
    acceptedEnrollments,
    loadingEnrolled,
    error,
    courseSearchQuery,
    setCourseSearchQuery,
    courseStatusFilter,
    setCourseStatusFilter,
    courseSortOrder,
    setCourseSortOrder,
    selectedCourseId,
    setSelectedCourseId,
    loadingAnalytics,
    heatmapData,
    flashcardStats,
    quizScores,
    lessonProgress,
    microInteractions,
    spacedRepQuizzes,
    analyticsTab,
    setAnalyticsTab,
    loadAllData,
    filteredAndSortedEnrollments,
    completedCount,
    inProgressCount,
    notStartedCount,
    totalCount,
    completedPercent,
    inProgressPercent,
    notStartedPercent,
    focusCourse,
    focusRecommendation,
    courseRecommendationSetId,
    courseRecommendations,
    currentCourse,
  } = useStudentDashboard();

  const archivedEnrollments = useMemo(
    () => acceptedEnrollments.filter((enrollment) => enrollment.course_status === "ARCHIVED"),
    [acceptedEnrollments],
  );

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* ── Header with Grid Background (Full-width, tràn viền) ── */}
      <div ref={headerRef}>
        <StudentDashboardHeader
          focusCourse={focusCourse}
          focusRecommendation={focusRecommendation}
          totalCount={totalCount}
          completedCount={completedCount}
          inProgressCount={inProgressCount}
          notStartedCount={notStartedCount}
          completedPercent={completedPercent}
          inProgressPercent={inProgressPercent}
          notStartedPercent={notStartedPercent}
          loadingEnrolled={loadingEnrolled}
          loadAllData={loadAllData}
          onNavigateToCourse={(courseId) => {
            if (focusRecommendation?.entity.course_id === courseId && courseRecommendationSetId) {
              trackRecommendationEvent(focusRecommendation, courseRecommendationSetId, "click", "dashboard");
              trackRecommendationEvent(focusRecommendation, courseRecommendationSetId, "started", "dashboard");
            }
            router.push(`/lms/student/courses/${courseId}`);
          }}
          onNavigateToDiscover={() => router.push("/lms/student/discover")}
        />
      </div>

      {/* ── Content Container (Middle and Bottom) ── */}
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-grow">
        {/* ── Error alert ── */}
        {error && <Alert type="error">{error}</Alert>}
        {currentCourse?.course_status === "ARCHIVED" && (
          <Alert type="error">
            Khóa học &quot;{currentCourse.course_title}&quot; tạm thời bị vô hiệu hóa để xem xét lại nội dung vi phạm.
          </Alert>
        )}

        {/* ── Dashboard Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Main Area (lg:col-span-8) ── */}
          <div className="lg:col-span-8 space-y-8 min-w-0 order-last">
            <StudentCourseAnalytics
              selectedCourseId={selectedCourseId}
              currentCourseTitle={currentCourse?.course_title}
              acceptedEnrollments={acceptedEnrollments.filter((enrollment) => enrollment.course_status !== "ARCHIVED")}
              setSelectedCourseId={setSelectedCourseId}
              loadingAnalytics={loadingAnalytics}
              analyticsTab={analyticsTab}
              setAnalyticsTab={setAnalyticsTab}
              heatmapData={heatmapData}
              flashcardStats={flashcardStats}
              quizScores={quizScores}
              lessonProgress={lessonProgress}
              microInteractions={microInteractions}
              spacedRepQuizzes={spacedRepQuizzes}
              mounted={mounted}
            />
          </div>

          {/* ── Right Column: Sidebar (lg:col-span-4) ── */}
          <div className="lg:col-span-4 space-y-6 min-w-0 order-first lg:sticky lg:top-20">
            <StudentCourseSidebar
              acceptedEnrollments={acceptedEnrollments}
              filteredAndSortedEnrollments={filteredAndSortedEnrollments}
              courseRecommendations={courseRecommendations}
              loadingEnrolled={loadingEnrolled}
              selectedCourseId={selectedCourseId}
              setSelectedCourseId={setSelectedCourseId}
              courseSearchQuery={courseSearchQuery}
              setCourseSearchQuery={setCourseSearchQuery}
              courseStatusFilter={courseStatusFilter}
              setCourseStatusFilter={setCourseStatusFilter}
              courseSortOrder={courseSortOrder}
              setCourseSortOrder={setCourseSortOrder}
              onNavigateToDiscover={() => router.push("/lms/student/discover")}
              onNavigateToCourse={(courseId) => router.push(`/lms/student/courses/${courseId}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
