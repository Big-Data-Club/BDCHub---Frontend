"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import lmsService from "@/services/lmsService";
import {
  Plus, Search, BookOpen, Settings, Trash2, Archive, ArchiveRestore,
  Eye, EyeOff, ChevronRight, Users, RefreshCw, Home, X, ArrowUpDown,
  SlidersHorizontal, Calendar, Tag, Award, ExternalLink
} from "lucide-react";
import {
  Card, Badge, PrimaryBtn, GhostBtn,
  EmptyState, PageLoader, Alert, TabBar, Spinner,
  InfiniteScrollTrigger, GridBackground, ConfirmModal, TeacherSummaryCard, FilterDropdown, TeacherHeader
} from "@/components/lms/shared";
import { Course } from "@/types";
import { cn } from "@/lib/utils";
import { CourseTableRow, CourseMobileCard, formatDate } from "@/components/lms/teacher/CourseRowComponents";

type StatusFilter = "all" | "draft" | "published" | "archived";
type SortOption = "newest" | "oldest" | "enrollments-desc" | "title-asc" | "title-desc";

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CoursesListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [publishing, setPublishing] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [archiving, setArchiving] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keydown listener for focusing search input (/) or (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") ||
        ((e.metaKey || e.ctrlKey) && e.key === "k")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load initial filters from URL params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlFilter = params.get("status") as StatusFilter;
      const urlSearch = params.get("search");
      const urlTag = params.get("tag");
      const urlLevel = params.get("level");
      const urlSort = params.get("sort") as SortOption;

      if (urlFilter && ["all", "draft", "published", "archived"].includes(urlFilter)) {
        setFilter(urlFilter);
      }
      if (urlSearch) setSearch(urlSearch);
      if (urlTag) setSelectedTag(urlTag);
      if (urlLevel) setSelectedLevel(urlLevel);
      if (urlSort && ["newest", "oldest", "enrollments-desc", "title-asc", "title-desc"].includes(urlSort)) {
        setSortBy(urlSort);
      }
    }
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (search.trim()) params.set("search", search.trim());
      if (selectedTag !== "all") params.set("tag", selectedTag);
      if (selectedLevel !== "all") params.set("level", selectedLevel);
      if (sortBy !== "newest") params.set("sort", sortBy);

      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [filter, search, selectedTag, selectedLevel, sortBy]);

  const load = useCallback(async (status?: StatusFilter, pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    setError("");
    try {
      const params: {
        status?: string;
        category?: string;
        level?: string;
        search?: string;
        page: number;
        page_size: number;
      } = { page: pageNum, page_size: 15 };
      if (status && status !== "all") params.status = status.toUpperCase();
      if (search.trim()) params.search = search.trim();
      if (selectedTag !== "all") params.category = selectedTag;
      if (selectedLevel !== "all") params.level = selectedLevel;
      const res = await lmsService.listMyCourses(params);
      const items = (res?.items || []) as Course[];
      setCourses(previous => append ? [...previous, ...items] : items);
      setPage(pageNum);
      setHasMore((res?.pagination?.page || pageNum) < (res?.pagination?.total_pages || 0));
    } catch {
      setError("Không thể tải danh sách khóa học.");
    } finally {
      if (!append) setLoading(false);
    }
  }, [search, selectedTag, selectedLevel]);

  useEffect(() => { load(filter); }, [filter, load]);

  // Confirm modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: "danger" | "warning" | "info";
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Xác nhận",
    variant: "danger",
    onConfirm: async () => {},
  });

  const handlePublish = (course: Course) => {
    const isDraft = course.status === "DRAFT";
    setConfirmConfig({
      isOpen: true,
      title: isDraft ? "Xuất bản khóa học" : "Gỡ xuất bản khóa học",
      description: isDraft
        ? `Bạn có chắc chắn muốn xuất bản khóa học "${course.title}" để tất cả học viên có thể học?`
        : `Bạn có muốn gỡ xuất bản khóa học "${course.title}" về trạng thái bản nháp?`,
      confirmText: isDraft ? "Xuất bản" : "Đưa về nháp",
      variant: "info",
      onConfirm: async () => {
        setPublishing(course.id);
        try {
          if (isDraft) {
            await lmsService.publishCourse(course.id);
            setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: "PUBLISHED" } : c));
          } else {
            await lmsService.unarchiveCourse(course.id);
            await load(filter);
          }
        } catch {
          setError(isDraft ? "Không thể xuất bản." : "Không thể gỡ xuất bản.");
        } finally {
          setPublishing(null);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDelete = (course: Course) => {
    setConfirmConfig({
      isOpen: true,
      title: "Xóa khóa học",
      description: `Bạn có chắc chắn muốn xóa khóa học "${course.title}"? Hành động này không thể hoàn tác và dữ liệu học tập liên quan sẽ bị loại bỏ.`,
      confirmText: "Xóa khóa học",
      variant: "danger",
      onConfirm: async () => {
        setDeleting(course.id);
        try {
          await lmsService.deleteCourse(course.id);
          setCourses(prev => prev.filter(c => c.id !== course.id));
        } catch {
          setError("Không thể xóa khóa học.");
        } finally {
          setDeleting(null);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleArchive = (course: Course) => {
    const restoring = course.status === "ARCHIVED";
    const actionLabel = restoring ? "Khôi phục" : "Lưu trữ";
    setConfirmConfig({
      isOpen: true,
      title: `${actionLabel} khóa học`,
      description: restoring
        ? `Khôi phục khóa học "${course.title}"? Người học có thể truy cập lại theo trạng thái trước đó.`
        : `Lưu trữ khóa học "${course.title}"? Tất cả người dùng sẽ tạm thời không thể truy cập cho đến khi bạn khôi phục.`,
      confirmText: actionLabel,
      variant: restoring ? "info" : "warning",
      onConfirm: async () => {
        setArchiving(course.id);
        try {
          await (restoring ? lmsService.unarchiveCourse(course.id) : lmsService.archiveCourse(course.id));
          setCourses(prev => prev.map(item => item.id === course.id ? { ...item, status: restoring ? "DRAFT" : "ARCHIVED" } : item));
          if (restoring) await load(filter);
        } catch {
          setError(`Không thể ${restoring ? "khôi phục" : "lưu trữ"} khóa học.`);
        } finally {
          setArchiving(null);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const allTags = Array.from(
    new Set(
      courses
        .flatMap(c => (c.category as string | null | undefined)?.split(",").map(t => t.trim()) ?? [])
        .filter(Boolean)
    )
  );

  // Client-side sorting logic
  const sortedAndFilteredCourses = [...courses].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at || b.updated_at || 0).getTime() - new Date(a.created_at || a.updated_at || 0).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.created_at || a.updated_at || 0).getTime() - new Date(b.created_at || b.updated_at || 0).getTime();
    }
    if (sortBy === "enrollments-desc") {
      return (b.enrollment_count ?? 0) - (a.enrollment_count ?? 0);
    }
    if (sortBy === "title-asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "title-desc") {
      return (b.title || "").localeCompare(a.title || "");
    }
    return 0;
  });

  const published = courses.filter(c => c.status === "PUBLISHED").length;
  const draft = courses.filter(c => c.status === "DRAFT").length;
  const archived = courses.filter(c => c.status === "ARCHIVED").length;

  const totalEnrollments = courses.reduce((acc, c) => acc + (c.enrollment_count ?? 0), 0);
  const totalCoursesCount = courses.length;
  const publishedPercent = totalCoursesCount > 0 ? (published / totalCoursesCount) * 100 : 0;
  const draftPercent = totalCoursesCount > 0 ? (draft / totalCoursesCount) * 100 : 0;
  const archivedPercent = totalCoursesCount > 0 ? (archived / totalCoursesCount) * 100 : 0;

  // Clickable headers handler
  const handleHeaderSort = (field: "title" | "enrollments" | "date") => {
    if (field === "title") {
      setSortBy(prev => prev === "title-asc" ? "title-desc" : "title-asc");
    } else if (field === "enrollments") {
      setSortBy("enrollments-desc");
    } else if (field === "date") {
      setSortBy(prev => prev === "newest" ? "oldest" : "newest");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-[#050B18]">
      {/* ── Premium Full-width Header synced with Teacher Suite ── */}
      <TeacherHeader
        title="Khóa học của tôi"
        description="Quản lý danh sách khóa học của bạn, theo dõi trạng thái xuất bản và số lượng học viên."
        actions={
          <div className="w-full lg:max-w-xl xl:max-w-2xl flex-shrink-0">
            <TeacherSummaryCard
              totalCourses={totalCoursesCount}
              publishedCourses={published}
              draftCourses={draft}
              archivedCourses={archived}
              totalStudents={totalEnrollments}
            />
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full flex-grow">

        {error && <Alert type="error">{error}</Alert>}

        {/* Dynamic Filter / Sort Control Dashboard */}
        <Card className="p-5 border border-slate-200/80 dark:border-blue-500/10 bg-white/70 dark:bg-[#0F1E35]/65 backdrop-blur-md rounded-3xl">
          <div className="flex flex-col gap-5">
            {/* Row 1: Clean TabBar directly on top & Create Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-blue-500/5 pb-4">
              <TabBar
                tabs={[
                  { id: "all" as StatusFilter,       label: "Tất cả",    badge: courses.length },
                  { id: "published" as StatusFilter,  label: "Xuất bản",  badge: published },
                  { id: "draft" as StatusFilter,      label: "Nháp",      badge: draft },
                  { id: "archived" as StatusFilter,   label: "Lưu trữ",   badge: archived },
                ]}
                active={filter}
                onChange={setFilter}
              />
              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 hidden lg:block">
                  Hiển thị {sortedAndFilteredCourses.length} khóa học
                </span>
                <PrimaryBtn
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => router.push("/lms/teacher/courses/create")}
                  className="py-2 px-4 text-xs font-bold shadow-xs whitespace-nowrap"
                >
                  Tạo khóa học mới
                </PrimaryBtn>
              </div>
            </div>

            {/* Row 2: Filtering Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search text input */}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm khóa học... (/)"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-blue-500/15 rounded-xl text-sm
                             bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100
                             placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/40 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-750 dark:hover:text-slate-200 transition-colors p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#1a2d48]"
                    aria-label="Xóa nội dung tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tag selector */}
              <FilterDropdown
                value={selectedTag}
                onValueChange={setSelectedTag}
                icon={<Tag className="w-4 h-4 text-slate-400" />}
                placeholder="Tất cả danh mục"
                options={[
                  { value: "all", label: "Tất cả danh mục (tag)" },
                  ...allTags.map(tag => ({ value: tag, label: tag }))
                ]}
              />

              {/* Level selector */}
              <FilterDropdown
                value={selectedLevel}
                onValueChange={setSelectedLevel}
                icon={<Award className="w-4 h-4 text-slate-400" />}
                placeholder="Tất cả cấp độ"
                options={[
                  { value: "all", label: "Tất cả cấp độ" },
                  { value: "BEGINNER", label: "Cơ bản" },
                  { value: "INTERMEDIATE", label: "Trung cấp" },
                  { value: "ADVANCED", label: "Nâng cao" },
                  { value: "ALL_LEVELS", label: "Mọi cấp độ" },
                ]}
              />

              {/* Sort selector */}
              <FilterDropdown
                value={sortBy}
                onValueChange={(val) => setSortBy(val as SortOption)}
                icon={<ArrowUpDown className="w-4 h-4 text-slate-400" />}
                placeholder="Sắp xếp"
                options={[
                  { value: "newest", label: "Mới nhất trước" },
                  { value: "oldest", label: "Cũ nhất trước" },
                  { value: "enrollments-desc", label: "Nhiều học viên nhất" },
                  { value: "title-asc", label: "Tên (A-Z)" },
                  { value: "title-desc", label: "Tên (Z-A)" },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Premium Table Content Layout */}
        <Card className="overflow-hidden border border-slate-200/80 dark:border-blue-500/10 bg-white/90 dark:bg-[#0F1E35]/85 backdrop-blur-md rounded-3xl">
          {loading ? (
            <PageLoader />
          ) : sortedAndFilteredCourses.length === 0 ? (
            search ? (
              <EmptyState
                icon={<Search className="w-12 h-12 text-slate-400" />}
                title="Không tìm thấy kết quả"
                description={`Không có khóa học nào khớp với nội dung tìm kiếm "${search}".`}
                action={<GhostBtn onClick={() => setSearch("")} className="border-slate-200 dark:border-slate-800">Xóa bộ lọc</GhostBtn>}
              />
            ) : (
              <EmptyState
                icon={<BookOpen className="w-12 h-12 text-slate-400" />}
                title="Chưa có khóa học nào"
                description="Bắt đầu hành trình giảng dạy của bạn bằng việc tạo khóa học đầu tiên."
                action={
                  <PrimaryBtn
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => router.push("/lms/teacher/courses/create")}
                  >
                    Tạo khóa học
                  </PrimaryBtn>
                }
              />
            )
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                  <colgroup>
                    <col className="w-[35%] min-w-[240px]" />
                    <col className="w-[20%] min-w-[140px]" />
                    <col className="w-[12%] min-w-[90px]" />
                    <col className="w-[13%] min-w-[100px]" />
                    <col className="w-[12%] min-w-[110px]" />
                    <col className="w-[8%] min-w-[120px]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-blue-500/10 text-xs font-bold text-slate-550 dark:text-slate-450 uppercase tracking-wider bg-slate-50/50 dark:bg-[#070e1c]/40 select-none">
                      <th
                        className={cn(
                          "px-6 py-4 cursor-pointer transition-colors group/th",
                          sortBy.startsWith("title")
                            ? "text-blue-600 dark:text-cyan-400 font-bold"
                            : "hover:text-blue-600 dark:hover:text-cyan-400"
                        )}
                        onClick={() => handleHeaderSort("title")}
                      >
                        <div className="flex items-center gap-1">
                          Khóa học
                          <ArrowUpDown className={cn(
                            "w-3 h-3 transition-opacity duration-200",
                            sortBy.startsWith("title") ? "opacity-100 text-blue-600 dark:text-cyan-400" : "opacity-0 group-hover/th:opacity-60"
                          )} />
                        </div>
                      </th>
                      <th className="px-6 py-4">Phân loại</th>
                      <th
                        className={cn(
                          "px-6 py-4 text-center cursor-pointer transition-colors group/th",
                          sortBy === "enrollments-desc"
                            ? "text-blue-600 dark:text-cyan-400 font-bold"
                            : "hover:text-blue-600 dark:hover:text-cyan-400"
                        )}
                        onClick={() => handleHeaderSort("enrollments")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Học viên
                          <ArrowUpDown className={cn(
                            "w-3 h-3 transition-opacity duration-200",
                            sortBy === "enrollments-desc" ? "opacity-100 text-blue-600 dark:text-cyan-400" : "opacity-0 group-hover/th:opacity-60"
                          )} />
                        </div>
                      </th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th
                        className={cn(
                          "px-6 py-4 cursor-pointer transition-colors group/th",
                          sortBy === "newest" || sortBy === "oldest"
                            ? "text-blue-600 dark:text-cyan-400 font-bold"
                            : "hover:text-blue-600 dark:hover:text-cyan-400"
                        )}
                        onClick={() => handleHeaderSort("date")}
                      >
                        <div className="flex items-center gap-1">
                          Cập nhật
                          <ArrowUpDown className={cn(
                            "w-3 h-3 transition-opacity duration-200",
                            sortBy === "newest" || sortBy === "oldest" ? "opacity-100 text-blue-600 dark:text-cyan-400" : "opacity-0 group-hover/th:opacity-60"
                          )} />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-blue-500/5">
                    {sortedAndFilteredCourses.map(course => (
                      <CourseTableRow
                        key={course.id}
                        course={course}
                        onOpen={() => router.push(`/lms/teacher/courses/${course.id}`)}
                        onPublish={() => handlePublish(course)}
                        onArchive={() => handleArchive(course)}
                        onDelete={() => handleDelete(course)}
                        publishing={publishing === course.id}
                        archiving={archiving === course.id}
                        deleting={deleting === course.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-blue-500/5">
                {sortedAndFilteredCourses.map(course => (
                  <CourseMobileCard
                    key={course.id}
                    course={course}
                    onOpen={() => router.push(`/lms/teacher/courses/${course.id}`)}
                    onPublish={() => handlePublish(course)}
                    onArchive={() => handleArchive(course)}
                    onDelete={() => handleDelete(course)}
                    publishing={publishing === course.id}
                    archiving={archiving === course.id}
                    deleting={deleting === course.id}
                  />
                ))}
              </div>

              {/* Load More Pagination */}
              <InfiniteScrollTrigger
                key={page}
                hasMore={hasMore}
                onLoadMore={() => load(filter, page + 1, true)}
              />
            </>
          )}
        </Card>

        {/* Global Confirm Modal for course management actions */}
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmText={confirmConfig.confirmText}
          variant={confirmConfig.variant}
          loading={publishing !== null || deleting !== null || archiving !== null}
        />

      </div>
    </div>
  );
}
