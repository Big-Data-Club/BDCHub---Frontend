import { useEffect, useState, useCallback, useRef } from "react";
import { lmsService } from "@/services/lms/lmsService";
import {
  getRecommendations,
  getLearningPreferenceProfile,
  saveLearningPreferenceProfile,
  trackRecommendationEvent,
  type LearningPreferenceProfile,
  type RecommendationItem,
} from "@/services/lms/recommendationService";
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
  // Synchronous guard against concurrent loadMore() calls.
  // React state (loadingMore) is batched and may not reflect the latest
  // value when the IntersectionObserver callback fires. This ref is
  // set to true synchronously at the START of loadMore() and cleared
  // at the END, so any concurrent invocation is reliably blocked.
  const isLoadingRef = useRef(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 9;

  const checkHasMore = useCallback((res: any, currentCount: number, pageSize: number) => {
    const itemsCount = res?.items?.length ?? 0;
    if (itemsCount < pageSize) return false;

    const totalPages = res?.pagination?.total_pages;
    const currentPage = res?.pagination?.page;
    if (typeof totalPages === "number" && typeof currentPage === "number") {
      return currentPage < totalPages;
    }

    const total = res?.pagination?.total ?? res?.total ?? res?.total_items;
    if (typeof total === "number") {
      return currentCount < total;
    }

    return itemsCount >= pageSize;
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [allCourses, accepted, profile] = await Promise.all([
        lmsService.listPublishedCourses({ page_size: 100 }),
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
      setHasMore(checkHasMore(paginatedRes, items.length, PAGE_SIZE));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  }, [PAGE_SIZE, checkHasMore]);

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
      setHasMore(checkHasMore(res, items.length, PAGE_SIZE));
    } catch (err: any) {
      setError(err?.message || "Lỗi tìm kiếm khóa học");
    } finally {
      setLoading(false);
    }
  }, [PAGE_SIZE, checkHasMore]);

  const loadMore = useCallback(async () => {
    // Use ref for the primary guard — it updates synchronously,
    // unlike loadingMore state which is subject to React batching.
    if (isLoadingRef.current || !hasMore) return;
    isLoadingRef.current = true;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const params: Record<string, any> = { page: nextPage, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (selectedTag && selectedTag !== "all") params.category = selectedTag;
      if (selectedLevel && selectedLevel !== "all") params.level = selectedLevel;

      const res = await lmsService.listPublishedCourses(params);
      const items = (res?.items || []) as Course[];
      setPublishedCourses(prev => {
        const nextList = [...prev, ...items];
        setHasMore(checkHasMore(res, nextList.length, PAGE_SIZE));
        return nextList;
      });
      setPage(nextPage);
    } catch (err: any) {
      console.error("Failed to load more courses:", err);
    } finally {
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [hasMore, page, search, selectedTag, selectedLevel, PAGE_SIZE, checkHasMore]);

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
