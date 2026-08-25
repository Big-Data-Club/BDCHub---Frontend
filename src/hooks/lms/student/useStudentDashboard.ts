"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { lmsService } from "@/services/lms/lmsService";
import { analyticsService } from "@/services/lms/analyticsService";
import { Enrollment } from "@/types";
import {
  getRecommendations,
  getLearningPreferenceProfile,
  trackRecommendationEvent,
  type LearningPreferenceProfile,
  type RecommendationItem,
} from "@/services/lms/recommendationService";

export function useStudentDashboard() {
  const [mounted, setMounted] = useState(false);
  const [acceptedEnrollments, setAcceptedEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [error, setError] = useState("");
  
  // Filter & Search states
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState<"ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [courseSortOrder, setCourseSortOrder] = useState<"recommended" | "desc" | "asc">("recommended");
  const [courseRecommendations, setCourseRecommendations] = useState<RecommendationItem[]>([]);
  const [courseRecommendationSetId, setCourseRecommendationSetId] = useState<string | null>(null);

  // Selected Course details for Analytics
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [flashcardStats, setFlashcardStats] = useState<any>(null);
  const [quizScores, setQuizScores] = useState<any[]>([]);
  const [lessonProgress, setLessonProgress] = useState<any>(null);
  const [microInteractions, setMicroInteractions] = useState<any>(null);
  const [spacedRepQuizzes, setSpacedRepQuizzes] = useState<any>(null);
  const [analyticsTab, setAnalyticsTab] = useState<"lessons" | "mastery" | "flashcards">("lessons");

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Load general enrollments data ─────────────────────────────────────────

  const loadAllData = useCallback(async () => {
    setLoadingEnrolled(true);
    setError("");
    try {
      const [accepted, profile] = await Promise.all([
        lmsService.getMyEnrollments("ACCEPTED"),
        getLearningPreferenceProfile().catch((): LearningPreferenceProfile => ({
          interested_categories: [],
          profile_available: false,
        })),
      ]);
      const enrollList = accepted || [];
      setAcceptedEnrollments(enrollList);

      const availableEnrollments = enrollList.filter(
        (enrollment: Enrollment) => enrollment.course_status !== "ARCHIVED",
      );

      if (availableEnrollments.length === 0) {
        setCourseRecommendations([]);
        setCourseRecommendationSetId(null);
        setSelectedCourseId(null);
        return;
      }

      try {
        const recommendationSet = await getRecommendations({
          surface: "dashboard",
          limit: Math.min(50, Math.max(1, availableEnrollments.length)),
          goal: profile.target_career || undefined,
          interestedCategories: profile.interested_categories,
          experienceLevel: profile.experience_level || undefined,
          profileResolved: true,
          candidates: availableEnrollments.map((enrollment: Enrollment) => ({
            entity_id: enrollment.course_id,
            title: enrollment.course_title ?? `Khóa học #${enrollment.course_id}`,
            description: enrollment.course_description,
            category: enrollment.course_category,
            level: enrollment.course_level,
            enrolled: true,
            progress_percent: enrollment.progress_percent ?? 0,
            published_at: enrollment.course_published_at,
            updated_at: enrollment.course_updated_at,
            last_activity_at: enrollment.last_activity_at,
            new_content_count: enrollment.new_content_count ?? 0,
            href: `/lms/student/courses/${enrollment.course_id}/learn`,
          })),
        });
        setCourseRecommendations(recommendationSet.items);
        setCourseRecommendationSetId(recommendationSet.recommendation_set_id);
        const topItem = recommendationSet.items[0];
        if (topItem) {
          trackRecommendationEvent(topItem, recommendationSet.recommendation_set_id, "impression", "dashboard");
        }
      } catch (recommendationError) {
        // Enrollment rendering remains available when the ranking service is down.
        console.warn("Recommendation ranking unavailable, using enrollment order", recommendationError);
        setCourseRecommendations([]);
        setCourseRecommendationSetId(null);
      }

      // Select first course by default for analytics
      setSelectedCourseId((prev) => {
        if (availableEnrollments.length > 0 && !prev) {
          return availableEnrollments[0].course_id;
        }
        if (prev && !availableEnrollments.some((enrollment) => enrollment.course_id === prev)) return availableEnrollments[0]?.course_id ?? null;
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
        setFlashcardStats(summary.flashcards);
        setQuizScores(summary.quiz_scores || []);
        setLessonProgress(summary.lesson_progress);
        setMicroInteractions(summary.micro_interactions);
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

  // ── Computed properties (useMemo for optimal rendering) ─────────────────────

  const availableEnrollments = useMemo(
    () => acceptedEnrollments.filter((e) => e.course_status !== "ARCHIVED"),
    [acceptedEnrollments],
  );

  const completedEnrollments = useMemo(
    () => availableEnrollments.filter((e) => (e.progress_percent || 0) === 100),
    [availableEnrollments]
  );

  const inProgressEnrollments = useMemo(
    () => availableEnrollments.filter((e) => (e.progress_percent || 0) > 0 && (e.progress_percent || 0) < 100),
    [availableEnrollments]
  );

  const notStartedEnrollments = useMemo(
    () => availableEnrollments.filter((e) => (e.progress_percent || 0) === 0),
    [availableEnrollments]
  );

  const filteredAndSortedEnrollments = useMemo(() => {
    return acceptedEnrollments
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
        if (courseSortOrder === "recommended") {
          const rankByCourse = new Map(
            courseRecommendations.map((item) => [item.entity.course_id, item.rank])
          );
          return (rankByCourse.get(a.course_id) ?? Number.MAX_SAFE_INTEGER)
            - (rankByCourse.get(b.course_id) ?? Number.MAX_SAFE_INTEGER);
        }
        const dateA = new Date(a.accepted_at || a.enrolled_at || 0).getTime();
        const dateB = new Date(b.accepted_at || b.enrolled_at || 0).getTime();
        return courseSortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [acceptedEnrollments, courseSearchQuery, courseStatusFilter, courseSortOrder, courseRecommendations]);

  const completedCount = completedEnrollments.length;
  const inProgressCount = inProgressEnrollments.length;
  const notStartedCount = notStartedEnrollments.length;
  const totalCount = availableEnrollments.length;

  const completedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const inProgressPercent = totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0;
  const notStartedPercent = totalCount > 0 ? Math.max(0, 100 - completedPercent - inProgressPercent) : 0;

  const focusCourse = useMemo(() => {
    const recommendedCourseId = courseRecommendations[0]?.entity.course_id;
    const recommendedCourse = availableEnrollments.find((enrollment) => enrollment.course_id === recommendedCourseId);
    if (recommendedCourse) return recommendedCourse;
    if (inProgressEnrollments.length > 0) {
      return inProgressEnrollments.reduce(
        (max, curr) => ((curr.progress_percent || 0) > (max.progress_percent || 0) ? curr : max),
        inProgressEnrollments[0]
      );
    }
    if (notStartedEnrollments.length > 0) {
      return notStartedEnrollments[0];
    }
    return null;
  }, [availableEnrollments, courseRecommendations, inProgressEnrollments, notStartedEnrollments]);

  const focusRecommendation = useMemo(
    () => courseRecommendations.find((item) => item.entity.course_id === focusCourse?.course_id) ?? null,
    [courseRecommendations, focusCourse]
  );

  const currentCourse = useMemo(
    () => availableEnrollments.find((e) => e.course_id === selectedCourseId),
    [availableEnrollments, selectedCourseId]
  );

  return {
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
  };
}
