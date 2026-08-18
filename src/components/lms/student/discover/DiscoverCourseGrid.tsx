import { CourseCard, EmptyState, InfiniteScrollTrigger } from "@/components/lms/shared";
import { Course } from "@/types";

interface DiscoverCourseGridProps {
  courses: Course[];
  enrolledCourseIds: Set<number>;
  loading: boolean;
  loadingMore?: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onNavigateToDetail: (courseId: number) => void;
}

function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/15 overflow-hidden animate-pulse shadow-sm h-80 flex flex-col justify-between">
      <div className="h-44 bg-slate-200 dark:bg-[#0D192E]" />
      <div className="p-4 space-y-3 flex-1">
        <div className="flex gap-1.5">
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

export function DiscoverCourseGrid({
  courses,
  enrolledCourseIds,
  loading,
  loadingMore = false,
  hasMore,
  onLoadMore,
  onNavigateToDetail,
}: DiscoverCourseGridProps) {
  if (loading && courses.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!loading && courses.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy khóa học nào"
        description="Thử thay đổi từ khóa hoặc bộ lọc để tìm kết quả phù hợp hơn."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isEnrolled = enrolledCourseIds.has(course.id);
          return (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              category={course.category ?? undefined}
              level={course.level ?? undefined}
              teacherName={course.creator_name ?? undefined}
              thumbnailUrl={course.thumbnail_url ?? undefined}
              enrollmentCount={course.enrollment_count ?? 0}
              createdAt={course.published_at ?? course.created_at ?? undefined}
              onClick={() => onNavigateToDetail(course.id)}
              actions={
                isEnrolled ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    ✓ Đã đăng ký
                  </span>
                ) : undefined
              }
            />
          );
        })}
      </div>

      <InfiniteScrollTrigger
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        loading={loadingMore}
      />
    </div>
  );
}
