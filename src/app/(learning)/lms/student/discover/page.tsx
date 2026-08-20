"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCourseDiscover } from "@/hooks/lms/student/useCourseDiscover";
import { DiscoverHeader } from "@/components/lms/student/discover/DiscoverHeader";
import { DiscoverCourseGrid } from "@/components/lms/student/discover/DiscoverCourseGrid";
import { DiscoverPreferenceModal } from "@/components/lms/student/discover/DiscoverPreferenceModal";
import { PersonalizedCourseDiscovery } from "@/components/lms/student/PersonalizedCourseDiscovery";
import { CourseCard, Alert, Select } from "@/components/lms/shared";
import { Sparkles, SlidersHorizontal, RotateCcw, CheckCircle2 } from "lucide-react";
import { trackRecommendationEvent } from "@/services/lms/recommendationService";
import { useAuth } from "@/contexts/AuthContext";
import enrollmentService from "@/services/lms/enrollmentService";

export default function DiscoverPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    publishedCourses,
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
  } = useCourseDiscover();

  // Active filters counter
  const activeFiltersCount = (selectedTag !== "all" ? 1 : 0) + (selectedLevel !== "all" ? 1 : 0) + (search ? 1 : 0);

  // Prevent browser auto scroll restoration and reset scroll position to top on initial page mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  // Ensure scroll position remains at top when recommendations load asynchronously (if user hasn't scrolled)
  useEffect(() => {
    if (recommendedCourses.length > 0 && typeof window !== "undefined" && window.scrollY < 50) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [recommendedCourses]);

  // Keyboard shortcut '/' listener to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (showPreferences) {
          setShowPreferences(false);
        } else if (search) {
          setSearch("");
          handleSearchFilter("", selectedTag, selectedLevel);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPreferences, search, selectedTag, selectedLevel, handleSearchFilter, setSearch, setShowPreferences]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedTag("all");
    setSelectedLevel("all");
    handleSearchFilter("", "all", "all");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B18] flex flex-col w-full">
      {/* Discover Header & Search */}
      <DiscoverHeader
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          handleSearchFilter(val, selectedTag, selectedLevel);
        }}
        onOpenPreferences={() => setShowPreferences(true)}
        searchInputRef={searchInputRef}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-grow [overflow-anchor:none]">
        {error && <Alert type="error">{error}</Alert>}

        {/* Skill-Based Personalized Course Discovery */}
        {user && !search && selectedTag === "all" && selectedLevel === "all" && (
          <PersonalizedCourseDiscovery
            studentId={user.id}
            onNavigateToCourse={(courseId) => router.push(`/lms/student/discover/${courseId}`)}
            onEnrollCourse={async (courseId) => {
              try {
                await enrollmentService.enrollCourse(courseId);
                // Reload page to update enrolled courses
                window.location.reload();
              } catch (error) {
                console.error("Failed to enroll:", error);
              }
            }}
          />
        )}

        {/* AI Personalized Recommendations Section */}
        {recommendedCourses.length > 0 && !search && selectedTag === "all" && selectedLevel === "all" && (
          <section className="space-y-4 [overflow-anchor:none]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Gợi Ý Dành Cho Bạn
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dựa trên mục tiêu học tập & lĩnh vực quan tâm đã thiết lập
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.slice(0, 3).map(({ course, item, recommendationSetId }, idx) => {
                const matchPercentage = Math.round((item.score ?? 0.85) * 100);
                const matchReason = preferenceGoal ? `Mục tiêu ${preferenceGoal.split(" ")[0] || "nghề nghiệp"}` : "Phù hợp học tập";
                return (
                  <CourseCard
                    key={`rec-${course.id}`}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    category={course.category ?? undefined}
                    level={course.level ?? undefined}
                    teacherName={course.creator_name ?? undefined}
                    thumbnailUrl={course.thumbnail_url ?? undefined}
                    enrollmentCount={course.enrollment_count ?? 0}
                    createdAt={course.published_at ?? course.created_at ?? undefined}
                    onClick={() => {
                      trackRecommendationEvent(item, recommendationSetId, "click", "course_discovery");
                      router.push(`/lms/student/discover/${course.id}`);
                    }}
                    actions={
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-slate-900/90 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-500/30 flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                        <span>{matchPercentage}% Match</span>
                      </span>
                    }
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 p-4 rounded-2xl shadow-xs">
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => {
                setSelectedTag("all");
                handleSearchFilter(search, "all", selectedLevel);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTag === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-[#0D192E] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#162644]"
              }`}
            >
              Tất cả danh mục
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  handleSearchFilter(search, tag, selectedLevel);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#0D192E] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#162644]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-auto">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0D192E]"
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc ({activeFiltersCount})</span>
              </button>
            )}

            <div className="w-[160px]">
              <Select
                value={selectedLevel}
                onValueChange={(val) => {
                  setSelectedLevel(val);
                  handleSearchFilter(search, selectedTag, val);
                }}
                icon={<SlidersHorizontal className="w-4 h-4 text-slate-400" />}
                placeholder="Trình độ"
                options={[
                  { value: "all", label: "Mọi trình độ" },
                  { value: "BEGINNER", label: "Cơ bản" },
                  { value: "INTERMEDIATE", label: "Trung cấp" },
                  { value: "ADVANCED", label: "Nâng cao" },
                ]}
                triggerClassName="h-9 text-xs font-semibold bg-slate-50 dark:bg-[#0D192E] border-slate-200 dark:border-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <DiscoverCourseGrid
          courses={publishedCourses}
          enrolledCourseIds={enrolledCourseIds}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onNavigateToDetail={(courseId) => router.push(`/lms/student/discover/${courseId}`)}
        />
      </main>

      {/* AI Preferences Modal */}
      <DiscoverPreferenceModal
        open={showPreferences}
        onClose={() => setShowPreferences(false)}
        preferenceCategories={preferenceCategories}
        onCategoriesChange={setPreferenceCategories}
        preferenceGoal={preferenceGoal}
        onGoalChange={setPreferenceGoal}
        preferenceLevel={preferenceLevel}
        onLevelChange={setPreferenceLevel}
        savingPreferences={savingPreferences}
        onSave={handleSavePreferences}
      />
    </div>
  );
}

