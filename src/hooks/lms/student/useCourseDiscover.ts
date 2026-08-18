import { useEffect, useState, useCallback } from "react";
import { lmsService } from "@/services/lmsService";
import {
  getRecommendations,
  getLearningPreferenceProfile,
  saveLearningPreferenceProfile,
  trackRecommendationEvent,
  type LearningPreferenceProfile,
  type RecommendationItem,
} from "@/services/recommendationService";
import { Course, Enrollment } from "@/types";

export function useCourseDiscover() {
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Array<{
    course: Course;
    item: RecommendationItem;
    recommendationSetId: string;
  }>>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferenceCategories, setPreferenceCategories] = useState("");
  const [preferenceGoal, setPreferenceGoal] = useState("");
  const [preferenceLevel, setPreferenceLevel] = useState<"" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED">("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 9;

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [allCourses, accepted, profile] = await Promise.all([
        lmsService.listPublishedCourses({ page_size: 20 }),
        lmsService.getMyEnrollments("ACCEPTED"),
        getLearningPreferenceProfile().catch((): LearningPreferenceProfile => ({
          interested_categories: [],
          profile_available: false,
        })),
      ]);
      setEnrollments(accepted || []);
      setPreferenceCategories(profile.interested_categories.join(", "));
      setPreferenceGoal(profile.target_career || "");
      setPreferenceLevel(profile.experience_level || "");

      const allCoursesList = (allCourses?.items || []) as Course[];
      const enrolledIds = new Set((accepted || []).map((enrollment: Enrollment) => enrollment.course_id));
      const tags = Array.from(
        new Set(
          allCoursesList
            .flatMap(c => (c.category as string | null | undefined)?.split(",").map(t => t.trim()) ?? [])
            .filter(Boolean)
        )
      );
      setAllTags(tags);

      try {
        const recommendationSet = await getRecommendations({
          surface: "course_discovery",
          limit: 6,
          goal: profile.target_career || undefined,
          interestedCategories: profile.interested_categories,
          experienceLevel: profile.experience_level || undefined,
          profileResolved: true,
          candidates: allCoursesList.map((course) => ({
            entity_id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            enrollment_count: course.enrollment_count ?? 0,
            published_at: course.published_at,
            updated_at: course.updated_at,
            enrolled: enrolledIds.has(course.id),
            href: `/lms/student/discover/${course.id}`,
          })),
        });
        const coursesById = new Map(allCoursesList.map((course) => [course.id, course]));
        const recommendations = recommendationSet.items.flatMap((item) => {
          const course = item.entity.course_id ? coursesById.get(item.entity.course_id) : undefined;
          return course ? [{ course, item, recommendationSetId: recommendationSet.recommendation_set_id }] : [];
        });
        setRecommendedCourses(recommendations);
        recommendations.slice(0, 3).forEach(({ item, recommendationSetId }) => {
          trackRecommendationEvent(item, recommendationSetId, "impression", "course_discovery");
        });
      } catch (recommendationError) {
        console.warn("Discovery recommendations unavailable", recommendationError);
        setRecommendedCourses([]);
      }

      const paginatedRes = await lmsService.listPublishedCourses({ page: 1, page_size: PAGE_SIZE });
      const items = (paginatedRes?.items || []) as Course[];
      setPublishedCourses(items);
      setPage(1);
      const totalItems = (paginatedRes as any)?.total ?? (paginatedRes as any)?.total_items ?? items.length;
      setHasMore(items.length >= PAGE_SIZE && totalItems > items.length);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  }, [PAGE_SIZE]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSearchFilter = useCallback(async (
    searchTerm: string,
    tag: string,
    level: string
  ) => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page: 1, page_size: PAGE_SIZE };
      if (searchTerm) params.search = searchTerm;
      if (tag && tag !== "all") params.category = tag;
      if (level && level !== "all") params.level = level;

      const res = await lmsService.listPublishedCourses(params);
      const items = (res?.items || []) as Course[];
      setPublishedCourses(items);
      setPage(1);
      const totalItems = (res as any)?.total ?? (res as any)?.total_items ?? items.length;
      setHasMore(items.length >= PAGE_SIZE && totalItems > items.length);
    } catch (err: any) {
      setError(err?.message || "Lỗi tìm kiếm khóa học");
    } finally {
      setLoading(false);
    }
  }, [PAGE_SIZE]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const params: Record<string, any> = { page: nextPage, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (selectedTag && selectedTag !== "all") params.category = selectedTag;
      if (selectedLevel && selectedLevel !== "all") params.level = selectedLevel;

      const res = await lmsService.listPublishedCourses(params);
      const items = (res?.items || []) as Course[];
      setPublishedCourses(prev => [...prev, ...items]);
      setPage(nextPage);
      setHasMore(items.length >= PAGE_SIZE);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, search, selectedTag, selectedLevel, PAGE_SIZE]);

  const handleSavePreferences = useCallback(async () => {
    try {
      setSavingPreferences(true);
      const categories = preferenceCategories
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      await saveLearningPreferenceProfile({
        interested_categories: categories,
        target_career: preferenceGoal.trim() || undefined,
        experience_level: preferenceLevel || undefined,
      });
      setShowPreferences(false);
      await loadInitialData();
    } catch (err: any) {
      alert(err?.message || "Không thể lưu thông tin gợi ý cá nhân hóa");
    } finally {
      setSavingPreferences(false);
    }
  }, [preferenceCategories, preferenceGoal, preferenceLevel, loadInitialData]);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  return {
    publishedCourses,
    enrollments,
    enrolledCourseIds,
    allTags,
    recommendedCourses,
    showPreferences,
    setShowPreferences,
    savingPreferences,
    preferenceCategories,
    setPreferenceCategories,
    preferenceGoal,
    setPreferenceGoal,
    preferenceLevel,
    setPreferenceLevel,
    loading,
    loadingMore,
    error,
    search,
    setSearch,
    selectedTag,
    setSelectedTag,
    selectedLevel,
    setSelectedLevel,
    hasMore,
    handleSearchFilter,
    loadMore,
    handleSavePreferences,
    loadInitialData,
  };
}
