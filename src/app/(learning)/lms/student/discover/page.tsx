"use client";

import { useRouter } from "next/navigation";
import { useCourseDiscover } from "@/hooks/lms/student/useCourseDiscover";
import { DiscoverHeader } from "@/components/lms/student/discover/DiscoverHeader";
import { DiscoverCourseGrid } from "@/components/lms/student/discover/DiscoverCourseGrid";
import { DiscoverPreferenceModal } from "@/components/lms/student/discover/DiscoverPreferenceModal";
import { CourseCard, Alert } from "@/components/lms/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { trackRecommendationEvent } from "@/services/recommendationService";

export default function DiscoverPage() {
  const router = useRouter();

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
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-grow">
        {error && <Alert type="error">{error}</Alert>}

        {/* AI Personalized Recommendations Section */}
        {recommendedCourses.length > 0 && !search && selectedTag === "all" && selectedLevel === "all" && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Gợi Ý Dành Cho Bạn
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.slice(0, 3).map(({ course, item, recommendationSetId }) => (
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
                  onClick={() => {
                    trackRecommendationEvent(item, recommendationSetId, "click", "course_discovery");
                    router.push(`/lms/student/discover/${course.id}`);
                  }}
                  actions={
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Match
                    </span>
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 p-4 rounded-2xl shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedTag("all");
                handleSearchFilter(search, "all", selectedLevel);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTag === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-[#0D192E] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#162644]"
              }`}
            >
              Tất cả danh mục
            </button>
            {allTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  handleSearchFilter(search, tag, selectedLevel);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-[#0D192E] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#162644]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <Select
              value={selectedLevel}
              onValueChange={(val) => {
                setSelectedLevel(val);
                handleSearchFilter(search, selectedTag, val);
              }}
            >
              <SelectTrigger className="w-[160px] h-9 bg-slate-50 dark:bg-[#0D192E] border-slate-200 dark:border-blue-500/20 text-xs font-semibold rounded-xl">
                <SelectValue placeholder="Trình độ" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0F1E35] border-slate-200 dark:border-blue-500/20">
                <SelectItem value="all">Mọi trình độ</SelectItem>
                <SelectItem value="BEGINNER">Cơ bản</SelectItem>
                <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                <SelectItem value="ADVANCED">Nâng cao</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Course Grid */}
        <DiscoverCourseGrid
          courses={publishedCourses}
          enrolledCourseIds={enrolledCourseIds}
          loading={loading}
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
