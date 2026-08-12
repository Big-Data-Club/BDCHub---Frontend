"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { lmsService } from "@/services/lmsService";
import {
  BookOpen, Search, RefreshCw, Eye, Sparkles, SlidersHorizontal, Save,
} from "lucide-react";
import {
  Card, CourseCard, Badge,
  PrimaryBtn, GhostBtn, SecondaryBtn,
  EmptyState, PageLoader, Alert,
  InfiniteScrollTrigger, Input, GridBackground
} from "@/components/lms/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/BreadcrumbNav";
import { Course, Enrollment } from "@/types";

import { cn } from "@/lib/utils";
import {
  getRecommendations,
  getLearningPreferenceProfile,
  saveLearningPreferenceProfile,
  rememberRecommendationAttribution,
  trackRecommendationEvent,
  type LearningPreferenceProfile,
  type RecommendationItem,
} from "@/services/recommendationService";

// ── Skeleton Loader ─────────────────────────────────────────────────────────

function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-lms-card rounded-2xl border border-slate-200 dark:border-blue-500/15 overflow-hidden animate-pulse shadow-sm">
      <div className="h-40 bg-slate-200 dark:bg-slate-800/60" />
      <div className="p-4 space-y-3">
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800/60 rounded-full" />
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800/60 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800/60 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800/60 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800/60 rounded" />
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800/60 rounded pt-2" />
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-blue-500/10 pt-3 mt-4">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800/60 rounded" />
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const router = useRouter();
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

  // ── Load initial metadata (tags & enrollments) ──────────────────────────────

  const loadInitialData = useCallback(async () => {
    try {
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
        // Discovery remains usable with the normal published-course list.
        console.warn("Discovery recommendations unavailable", recommendationError);
        setRecommendedCourses([]);
      }
    } catch {
      setError("Không thể tải thông tin khởi tạo.");
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ── Fetch courses from backend with filters & page ──────────────────────────

  const fetchCourses = useCallback(async (pageNum: number, isNewFilter: boolean) => {
    if (isNewFilter) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError("");

    try {
      const params: any = {
        page: pageNum,
        page_size: PAGE_SIZE,
      };
      if (search) params.search = search;
      if (selectedTag !== "all") params.category = selectedTag;
      if (selectedLevel !== "all") params.level = selectedLevel;

      const coursesPage = await lmsService.listPublishedCourses(params);
      const newCourses = (coursesPage?.items || []) as Course[];

      if (isNewFilter) {
        setPublishedCourses(newCourses);
      } else {
        setPublishedCourses(prev => [...prev, ...newCourses]);
      }

      setHasMore((coursesPage?.pagination?.page || pageNum) < (coursesPage?.pagination?.total_pages || 0));
    } catch {
      setError("Không thể tải danh sách khóa học.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, selectedTag, selectedLevel]);

  // Reset page & trigger initial fetch on filter change
  useEffect(() => {
    setPage(1);
    fetchCourses(1, true);
  }, [search, selectedTag, selectedLevel, fetchCourses]);

  // Load next page on scroll trigger
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCourses(nextPage, false);
  }, [page, hasMore, loadingMore, fetchCourses]);

  const handleRefresh = useCallback(() => {
    loadInitialData();
    setPage(1);
    fetchCourses(1, true);
  }, [loadInitialData, fetchCourses]);

  const handleSavePreferences = useCallback(async () => {
    setSavingPreferences(true);
    setError("");
    try {
      await saveLearningPreferenceProfile({
        interested_categories: preferenceCategories
          .split(",")
          .map(value => value.trim())
          .filter(Boolean),
        target_career: preferenceGoal.trim() || null,
        experience_level: preferenceLevel || null,
      });
      setShowPreferences(false);
      await loadInitialData();
    } catch {
      setError("Không thể lưu hồ sơ cá nhân hóa. Vui lòng thử lại.");
    } finally {
      setSavingPreferences(false);
    }
  }, [loadInitialData, preferenceCategories, preferenceGoal, preferenceLevel]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const enrolledIds = new Set(enrollments.map(e => e.course_id));

  const handleCardClick = (course: Course) => {
    if (enrolledIds.has(course.id)) {
      router.push(`/lms/student/courses/${course.id}/learn`);
    } else {
      router.push(`/lms/student/discover/${course.id}`);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Học tập", href: "/lms/student" },
    { label: "Khám phá" },
  ];

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50 dark:bg-[#050B18]">
      {/* ── Premium Header Section ── */}
      <div className="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-6 md:py-8">
        <GridBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <BreadcrumbNav items={breadcrumbItems} />
          <div className="flex items-start justify-between gap-4 flex-wrap mt-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Khám phá khóa học
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
                Tìm kiếm và đăng ký các khóa học phù hợp với bạn.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <GhostBtn
                size="sm"
                icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                onClick={() => setShowPreferences(value => !value)}
                className="active:scale-95 border border-violet-200 dark:border-violet-500/20 bg-violet-50/80 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 font-semibold"
              >
                Cá nhân hóa gợi ý
              </GhostBtn>
              <GhostBtn
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={handleRefresh}
                className="active:scale-95 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0D192E]/60 backdrop-blur-xs font-semibold"
              >
                Làm mới
              </GhostBtn>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* ── Error alert ── */}
        {error && <Alert type="error">{error}</Alert>}

        {showPreferences && (
          <section className="rounded-2xl border border-violet-200/80 dark:border-violet-500/20 bg-violet-50/60 dark:bg-violet-950/20 p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Bạn đang muốn học gì?</h2>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Các lựa chọn này giúp giải quyết cold start và luôn được ưu tiên hơn xu hướng chung.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Mục tiêu</span>
                <Input
                  value={preferenceGoal}
                  onChange={event => setPreferenceGoal(event.target.value)}
                  placeholder="VD: Data Engineer, nghiên cứu AI"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Chủ đề quan tâm</span>
                <Input
                  value={preferenceCategories}
                  onChange={event => setPreferenceCategories(event.target.value)}
                  placeholder="Python, AI, Big Data"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Trình độ hiện tại</span>
                <Select value={preferenceLevel || "UNSPECIFIED"} onValueChange={value => setPreferenceLevel(value === "UNSPECIFIED" ? "" : value as typeof preferenceLevel)}>
                  <SelectTrigger className="w-full h-11 bg-white dark:bg-[#0D192E] border border-slate-300 dark:border-violet-500/20 text-sm rounded-xl">
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNSPECIFIED">Chưa xác định</SelectItem>
                    <SelectItem value="BEGINNER">Mới bắt đầu</SelectItem>
                    <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                    <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <GhostBtn onClick={() => setShowPreferences(false)}>Hủy</GhostBtn>
              <PrimaryBtn
                icon={<Save className="w-3.5 h-3.5" />}
                onClick={handleSavePreferences}
                disabled={savingPreferences}
              >
                {savingPreferences ? "Đang lưu..." : "Lưu và cập nhật gợi ý"}
              </PrimaryBtn>
            </div>
          </section>
        )}

        {recommendedCourses.length > 0 && (
          <section aria-labelledby="recommended-courses-title" className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-violet-100 dark:bg-violet-950/50 p-2 text-violet-600 dark:text-violet-300 border border-violet-200/70 dark:border-violet-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 id="recommended-courses-title" className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Khóa học có thể phù hợp với bạn
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Được xếp hạng theo độ phù hợp, cấp độ, mức độ quan tâm và độ mới.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {recommendedCourses.slice(0, 3).map(({ course, item, recommendationSetId }) => (
                <CourseCard
                  key={`recommended-${course.id}`}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  category={course.category}
                  level={course.level}
                  teacherName={course.creator_name}
                  thumbnailUrl={course.thumbnail_url}
                  enrollmentCount={course.enrollment_count}
                  createdAt={course.created_at}
                  onClick={() => {
                    trackRecommendationEvent(item, recommendationSetId, "click", "course_discovery");
                    rememberRecommendationAttribution(item, recommendationSetId, "course_discovery");
                    handleCardClick(course);
                  }}
                  actions={
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="blue">{item.badges[0]?.text ?? "Gợi ý cho bạn"}</Badge>
                      <SecondaryBtn
                        size="sm"
                        onClick={event => {
                          event.stopPropagation();
                          trackRecommendationEvent(item, recommendationSetId, "click", "course_discovery");
                          rememberRecommendationAttribution(item, recommendationSetId, "course_discovery");
                          router.push(`/lms/student/discover/${course.id}`);
                        }}
                        className="active:scale-95 shadow-sm transition-all rounded-xl"
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Xem chi tiết
                      </SecondaryBtn>
                    </div>
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Search & Filter Control Panel ── */}
        <div className="bg-white/80 dark:bg-[#0F1E35]/80 border border-slate-200 dark:border-blue-500/10 rounded-2xl p-5 shadow-sm backdrop-blur-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="flex-1">
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm tên khóa học, mô tả hoặc chủ đề..."
                icon={<Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                className="w-full bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-w-[240px]">
              {/* Level Selector */}
              <div className="flex-1">
                <Select
                  value={selectedLevel}
                  onValueChange={value => setSelectedLevel(value)}
                >
                  <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20 text-sm rounded-xl">
                    <SelectValue placeholder="Tất cả cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả cấp độ</SelectItem>
                    <SelectItem value="BEGINNER">Cơ bản</SelectItem>
                    <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                    <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                    <SelectItem value="ALL_LEVELS">Mọi cấp độ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-slate-100 dark:border-blue-500/10 pt-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                Chủ đề:
              </span>
              <button
                onClick={() => setSelectedTag("all")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border",
                  selectedTag === "all"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm active:scale-95"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/35 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-blue-500/10 active:scale-95"
                )}
              >
                Tất cả
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border",
                    selectedTag.toLowerCase() === tag.toLowerCase()
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm active:scale-95"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/35 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-blue-500/10 active:scale-95"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Course list ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : publishedCourses.length === 0 ? (
          search || selectedTag !== "all" || selectedLevel !== "all" ? (
            <EmptyState
              icon={<Search className="w-12 h-12" />}
              title="Không tìm thấy"
              description="Không có khóa học nào khớp với bộ lọc hiện tại."
              action={
                <GhostBtn
                  onClick={() => {
                    setSearch("");
                    setSelectedTag("all");
                    setSelectedLevel("all");
                  }}
                  className="active:scale-95 border border-slate-200 dark:border-slate-800"
                >
                  Xóa tất cả bộ lọc
                </GhostBtn>
              }
            />
          ) : (
            <EmptyState
              icon={<BookOpen className="w-12 h-12" />}
              title="Chưa có khóa học"
              description="Hiện chưa có khóa học nào được xuất bản."
            />
          )
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Đã tải {publishedCourses.length} khóa học</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {publishedCourses.map(course => {
                const enrolled = enrolledIds.has(course.id);
                return (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    category={course.category}
                    level={course.level}
                    teacherName={course.creator_name}
                    thumbnailUrl={course.thumbnail_url}
                    enrollmentCount={course.enrollment_count}
                    createdAt={course.created_at}
                    onClick={() => handleCardClick(course)}
                    actions={
                      <div className="flex items-center gap-2 flex-wrap">
                        {course.visibility === "ORG_ONLY" && (
                          <Badge variant="gray">Tổ chức</Badge>
                        )}
                        {enrolled ? (
                          <Badge variant="green">Đã đăng ký</Badge>
                        ) : (
                          <SecondaryBtn
                            size="sm"
                            onClick={e => { e.stopPropagation(); router.push(`/lms/student/discover/${course.id}`); }}
                            className="active:scale-95 shadow-sm transition-all rounded-xl"
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Xem chi tiết
                          </SecondaryBtn>
                        )}
                      </div>
                    }
                  />
                );
              })}
              {loadingMore && Array.from({ length: 3 }).map((_, i) => (
                <CourseCardSkeleton key={`more-${i}`} />
              ))}
            </div>
            <InfiniteScrollTrigger
              key={page}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
            />
          </div>
        )}
      </div>
    </div>
  );
}
