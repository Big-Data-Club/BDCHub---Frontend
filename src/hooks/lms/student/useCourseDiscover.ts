import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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

  // Monotonic request sequence: only the most recently started listing
  // (initial / filter / load-more) may apply its results. Prevents an
  // in-flight response for old filters from mutating the current list.
  const requestSeqRef = useRef(0);
  // Display-order freeze: once the user starts paging (loadMore), courses
  // already on screen must never move. Before that, the list is freely
  // curated (AI recommendations hoisted to top).
  const orderFrozenRef = useRef(false);
  const displayOrderRef = useRef<number[]>([]);

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
    const seq = ++requestSeqRef.current;
    orderFrozenRef.current = false;
    displayOrderRef.current = [];
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
      if (seq !== requestSeqRef.current) return;
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
          return course
            ? [{ course, item, recommendationSetId: recommendationSet.recommendation_set_id }]
            : [];
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
      if (seq !== requestSeqRef.current) return;
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
    const seq = ++requestSeqRef.current;
    orderFrozenRef.current = false;
    displayOrderRef.current = [];
    try {
      setLoading(true);
      const params: Record<string, any> = { page: 1, page_size: PAGE_SIZE };
      if (searchTerm) params.search = searchTerm;
      if (tag && tag !== "all") params.category = tag;
      if (level && level !== "all") params.level = level;

      const res = await lmsService.listPublishedCourses(params);
      if (seq !== requestSeqRef.current) return;
      const items = (res?.items || []) as Course[];
      setPublishedCourses(items);
      setPage(1);
      setHasMore(checkHasMore(res, items.length, PAGE_SIZE));
    } catch (err: any) {
      if (seq === requestSeqRef.current) setError(err?.message || "Lỗi tìm kiếm khóa học");
    } finally {
      if (seq === requestSeqRef.current) setLoading(false);
    }
  }, [PAGE_SIZE, checkHasMore]);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;
    isLoadingRef.current = true;
    // From this point on, whatever is on screen is frozen in place.
    orderFrozenRef.current = true;
    const seq = requestSeqRef.current;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const params: Record<string, any> = { page: nextPage, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (selectedTag && selectedTag !== "all") params.category = selectedTag;
      if (selectedLevel && selectedLevel !== "all") params.level = selectedLevel;

      const res = await lmsService.listPublishedCourses(params);
      if (seq !== requestSeqRef.current) return;
      const items = (res?.items || []) as Course[];
      // Offset pagination can overlap when the catalogue shifts between
      // page fetches - drop anything already displayed instead of letting
      // duplicate React keys corrupt the grid.
      setPublishedCourses(prev => {
        const seen = new Set(prev.map(c => c.id));
        const fresh = items.filter(c => (seen.has(c.id) ? false : (seen.add(c.id), true)));
        return [...prev, ...fresh];
      });
      setPage(nextPage);
      setHasMore(
        items.length >= PAGE_SIZE
          ? checkHasMore(res, nextPage * PAGE_SIZE, PAGE_SIZE)
          : false,
      );
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

  const enrolledCourseIds = useMemo(
    () => new Set(enrollments.map((e) => e.course_id)),
    [enrollments],
  );

  const recommendationsByCourseId = useMemo(
    () => new Map(recommendedCourses.map((recommendation) => [recommendation.course.id, recommendation])),
    [recommendedCourses],
  );

  /**
   * Curated ranking: un-enrolled first, then AI recommendation score,
   * then popularity. Used for the initial screen and, after paging
   * starts, only to order NEW arrivals relative to each other.
   */
  const rankCourses = useCallback((courses: Course[]) => {
    return [...courses].sort((a, b) => {
      const isEnrolledA = enrolledCourseIds.has(a.id);
      const isEnrolledB = enrolledCourseIds.has(b.id);

      // 1. Non-enrolled courses prioritized over enrolled courses
      if (isEnrolledA !== isEnrolledB) {
        return isEnrolledA ? 1 : -1;
      }

      // 2. High recommendation score prioritized
      const recA = recommendationsByCourseId.get(a.id);
      const recB = recommendationsByCourseId.get(b.id);
      const scoreA = recA?.item?.score ?? 0;
      const scoreB = recB?.item?.score ?? 0;

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      // 3. Fallback: enrollment count or ID
      const enrollCountA = a.enrollment_count ?? 0;
      const enrollCountB = b.enrollment_count ?? 0;
      if (enrollCountA !== enrollCountB) {
        return enrollCountB - enrollCountA;
      }

      return b.id - a.id;
    });
  }, [enrolledCourseIds, recommendationsByCourseId]);

  const displayedCourses = useMemo(() => {
    // Filtered view follows the API order exactly.
    if (search || selectedTag !== "all" || selectedLevel !== "all") {
      return publishedCourses;
    }

    const seenCourseIds = new Set<number>();
    const pool = [...recommendedCourses.map(({ course }) => course), ...publishedCourses].filter((course) => {
      if (seenCourseIds.has(course.id)) return false;
      seenCourseIds.add(course.id);
      return true;
    });

    // Before the first loadMore, curate freely (recommendations on top).
    if (!orderFrozenRef.current) {
      const ranked = rankCourses(pool);
      displayOrderRef.current = ranked.map((c) => c.id);
      return ranked;
    }

    // Once paging has started, courses already shown keep their exact
    // positions - newcomers are appended after them in their own ranked
    // order. Re-sorting the whole accumulated list here is what made the
    // grid visibly jump around while scrolling.
    const knownIds = new Set(pool.map((c) => c.id));
    const keptOrder = displayOrderRef.current.filter((id) => knownIds.has(id));
    const keptSet = new Set(keptOrder);
    const newcomers = rankCourses(pool.filter((c) => !keptSet.has(c.id)));

    displayOrderRef.current = [...keptOrder, ...newcomers.map((c) => c.id)];
    const positionById = new Map(displayOrderRef.current.map((id, index) => [id, index]));
    return [...pool].sort(
      (a, b) => (positionById.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (positionById.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [publishedCourses, recommendedCourses, rankCourses, search, selectedLevel, selectedTag]);

  return {
    publishedCourses: displayedCourses,
    enrollments,
    enrolledCourseIds,
    allTags,
    recommendedCourses,
    recommendationsByCourseId,
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
