"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { lmsService } from "@/services/lmsService";
import { analyticsService } from "@/services/analyticsService";
import { Alert } from "@/components/lms/shared";
import { Enrollment } from "@/types";
import { StudentCourseSidebar } from "@/components/lms/student/StudentCourseSidebar";
import { StudentCourseAnalytics } from "@/components/lms/student/StudentCourseAnalytics";
import { StudentDashboardHeader } from "@/components/lms/student/StudentDashboardHeader";
import { useScrollSnap } from "@/hooks/useScrollSnap";

export default function StudentDashboard() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [acceptedEnrollments, setAcceptedEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [error, setError] = useState("");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState<"ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [courseSortOrder, setCourseSortOrder] = useState<"desc" | "asc">("desc");

  // Selected Course details for Analytics
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [flashcardStats, setFlashcardStats] = useState<any>(null);
  const [quizScores, setQuizScores] = useState<any[]>([]);
  const [lessonProgress, setLessonProgress] = useState<any>(null);
  const [microInteractions, setMicroInteractions] = useState<any>(null);
  const [spacedRepQuizzes, setSpacedRepQuizzes] = useState<any>(null);
  const [analyticsTab, setAnalyticsTab] = useState<"lessons" | "mastery" | "flashcards">("lessons");

  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-snap: when user scrolls past the header, snap to content area
  useScrollSnap(headerRef, contentRef, { stickyHeaderHeight: 64 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Load general data ───────────────────────────────────────────────────────

  const loadAllData = useCallback(async () => {
    setLoadingEnrolled(true);
    setError("");
    try {
      const accepted = await lmsService.getMyEnrollments("ACCEPTED");
      const enrollList = accepted || [];
      setAcceptedEnrollments(enrollList);

      // Select first course by default for analytics
      setSelectedCourseId((prev) => {
        if (enrollList.length > 0 && !prev) {
          return enrollList[0].course_id;
        }
        return prev;
      });
    } catch (e) {
      console.error(e);
      setError("Không thể tải thông tin tiến độ học tập.");
    } finally {
      setLoadingEnrolled(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ── Load course-specific analytics ──────────────────────────────────────────

  const loadCourseAnalytics = useCallback(async (courseId: number) => {
    setLoadingAnalytics(true);
    try {
      const result = await analyticsService.getStudentAnalyticsSummary(courseId);
      const summary = result?.data;

      if (summary) {
        // Format heatmap for radar chart (max 8 nodes for readable chart)
        const formattedHeatmap = (summary.heatmap || []).slice(0, 8).map((n: any) => ({
          subject: n.name_vi || n.node_name,
          "Độ thông thạo (%)": Math.round((n.avg_mastery || n.mastery_level || 0) * 100),
        }));
        setHeatmapData(formattedHeatmap);

        // Spaced repetition stats
        setFlashcardStats(summary.flashcards);

        // Quiz best scores
        setQuizScores(summary.quiz_scores || []);

        // Lesson progress
        setLessonProgress(summary.lesson_progress);

        // Micro interactions
        setMicroInteractions(summary.micro_interactions);

        // Spaced rep quizzes stats
        setSpacedRepQuizzes(summary.spaced_rep_quizzes);
      }
    } catch (e) {
      console.error("Error loading course analytics:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseAnalytics(selectedCourseId);
    }
  }, [selectedCourseId, loadCourseAnalytics]);

  // Computed properties for enrollment status & focus course
  const completedEnrollments = acceptedEnrollments.filter((e) => (e.progress_percent || 0) === 100);
  const inProgressEnrollments = acceptedEnrollments.filter(
    (e) => (e.progress_percent || 0) > 0 && (e.progress_percent || 0) < 100
  );
  const notStartedEnrollments = acceptedEnrollments.filter((e) => (e.progress_percent || 0) === 0);

  // Filtered and sorted enrollments for the list display
  const filteredAndSortedEnrollments = acceptedEnrollments
    .filter((en) => {
      const matchesSearch = (en.course_title || "").toLowerCase().includes(courseSearchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const progress = en.progress_percent || 0;
      if (courseStatusFilter === "NOT_STARTED") return progress === 0;
      if (courseStatusFilter === "IN_PROGRESS") return progress > 0 && progress < 100;
      if (courseStatusFilter === "COMPLETED") return progress === 100;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.accepted_at || a.enrolled_at || 0).getTime();
      const dateB = new Date(b.accepted_at || b.enrolled_at || 0).getTime();
      return courseSortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const completedCount = completedEnrollments.length;
  const inProgressCount = inProgressEnrollments.length;
  const notStartedCount = notStartedEnrollments.length;
  const totalCount = acceptedEnrollments.length;

  const completedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const inProgressPercent = totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0;
  const notStartedPercent = totalCount > 0 ? Math.max(0, 100 - completedPercent - inProgressPercent) : 0;

  // The next focus course is the one in progress that is closest to completion.
  // If there are none, we look for courses that have not been started yet.
  const focusCourse =
    inProgressEnrollments.length > 0
      ? inProgressEnrollments.reduce(
          (max, curr) => ((curr.progress_percent || 0) > (max.progress_percent || 0) ? curr : max),
          inProgressEnrollments[0]
        )
      : notStartedEnrollments.length > 0
      ? notStartedEnrollments[0]
      : null;

  const currentCourse = acceptedEnrollments.find((e) => e.course_id === selectedCourseId);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* ── Header with Grid Background (Full-width, tràn viền) ── */}
      <div ref={headerRef}>
        <StudentDashboardHeader
          focusCourse={focusCourse}
          totalCount={totalCount}
          completedCount={completedCount}
          inProgressCount={inProgressCount}
          notStartedCount={notStartedCount}
          completedPercent={completedPercent}
          inProgressPercent={inProgressPercent}
          notStartedPercent={notStartedPercent}
          loadingEnrolled={loadingEnrolled}
          loadAllData={loadAllData}
          onNavigateToCourse={(courseId) => router.push(`/lms/student/courses/${courseId}`)}
          onNavigateToDiscover={() => router.push("/lms/student/discover")}
        />
      </div>

      {/* ── Content Container (Middle and Bottom) ── */}
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-grow">
        {/* ── Error alert ── */}
        {error && <Alert type="error">{error}</Alert>}

        {/* ── Dashboard Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Main Area (lg:col-span-2) ── */}
          <div className="lg:col-span-8 space-y-8 min-w-0 order-last">
            <StudentCourseAnalytics
              selectedCourseId={selectedCourseId}
              currentCourseTitle={currentCourse?.course_title}
              acceptedEnrollments={acceptedEnrollments}
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

          {/* ── Right Column: Sidebar (lg:col-span-1) ── */}
          <div className="lg:col-span-4 space-y-6 min-w-0 order-first">
            <StudentCourseSidebar
              acceptedEnrollments={acceptedEnrollments}
              filteredAndSortedEnrollments={filteredAndSortedEnrollments}
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