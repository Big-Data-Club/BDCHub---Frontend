"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCourseDiscover } from "@/hooks/lms/student/useCourseDiscover";
import { DiscoverHeader } from "@/components/lms/student/discover/DiscoverHeader";
import { DiscoverCourseGrid } from "@/components/lms/student/discover/DiscoverCourseGrid";
import { DiscoverPreferenceModal } from "@/components/lms/student/discover/DiscoverPreferenceModal";
import { Alert, Select } from "@/components/lms/shared";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

export default function DiscoverPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    publishedCourses,
    enrolledCourseIds,
    recommendationsByCourseId,
    activeProfile,
    recommendationStatus,
    preferencesSaved,
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

        <div className="rounded-2xl border border-blue-200 dark:border-blue-500/20 bg-white dark:bg-[#0F1E35] p-5 shadow-xs" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Gợi ý khóa học dành cho bạn</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {recommendationStatus === "loading" && "Đang xếp hạng khóa học theo mục tiêu và trình độ của bạn..."}
                {recommendationStatus === "personalized" && `Đã xếp hạng ${recommendedCourses.length} khóa học theo mục tiêu, trình độ và thông tin khóa học hiện có.`}
                {recommendationStatus === "general" && "Đang xếp hạng theo trình độ, độ mới và mức độ quan tâm chung. Hãy đặt mục tiêu để gợi ý sát hơn."}
                {recommendationStatus === "unavailable" && "Dịch vụ gợi ý đang tạm thời không sẵn sàng. Danh sách khóa học vẫn có thể duyệt bình thường."}
              </p>
            </div>
            {preferencesSaved && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Đã lưu mục tiêu học tập</span>}
          </div>
          {activeProfile && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Đang dùng: {[
                activeProfile.interested_categories.length ? activeProfile.interested_categories.join(", ") : null,
                activeProfile.target_career ? `mục tiêu ${activeProfile.target_career}` : null,
                activeProfile.experience_level ? `trình độ ${activeProfile.experience_level}` : null,
              ].filter(Boolean).join(" · ")}
            </p>
          )}
          {recommendationStatus === "personalized" && recommendedCourses[0] && (
            <p className="mt-2 text-xs text-blue-700 dark:text-cyan-300">
              Gợi ý đầu tiên: {recommendedCourses[0].course.title} — {recommendedCourses[0].item.description}
            </p>
          )}
        </div>

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

        {/* Course Grid - Integrated courses list */}
        <DiscoverCourseGrid
          courses={publishedCourses}
          enrolledCourseIds={enrolledCourseIds}
          recommendationsByCourseId={recommendationsByCourseId}
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
