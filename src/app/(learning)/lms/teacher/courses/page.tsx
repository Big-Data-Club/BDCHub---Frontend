"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import lmsService from "@/services/lms/lmsService";
import {
  Plus, Search, BookOpen, Settings, Trash2, Archive, ArchiveRestore,
  Eye, EyeOff, ChevronRight, Users, RefreshCw, Home, X, ArrowUpDown,
  SlidersHorizontal, Calendar, Tag, Award, ExternalLink, MoreVertical
} from "lucide-react";
import {
  Card, Badge, PrimaryBtn, GhostBtn,
  EmptyState, PageLoader, Alert, TabBar, Spinner,
  InfiniteScrollTrigger, GridBackground, ConfirmModal, TeacherSummaryCard, FilterDropdown, LmsPageHeader,
  DataTable
} from "@/components/lms/shared";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Course } from "@/types";
import { cn } from "@/lib/utils";
import { CourseTableRow, CourseMobileCard, formatDate } from "@/components/lms/teacher/CourseRowComponents";

type StatusFilter = "all" | "draft" | "published" | "archived";
type SortOption = "newest" | "oldest" | "enrollments-desc" | "enrollments-asc" | "title-asc" | "title-desc";

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
      if (urlSort && ["newest", "oldest", "enrollments-desc", "enrollments-asc", "title-asc", "title-desc"].includes(urlSort)) {
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
            await lmsService.unpublishCourse(course.id);
            setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: "DRAFT" } : c));
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
    if (sortBy === "enrollments-asc") {
      return (a.enrollment_count ?? 0) - (b.enrollment_count ?? 0);
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
  const handleHeaderSort = (field: string) => {
    if (field === "title") {
      setSortBy(prev => prev === "title-asc" ? "title-desc" : "title-asc");
    } else if (field === "enrollments") {
      setSortBy(prev => prev === "enrollments-desc" ? "enrollments-asc" : "enrollments-desc");
    } else if (field === "date" || field === "updated_at") {
      setSortBy(prev => prev === "newest" ? "oldest" : "newest");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-[#050B18]">
      {/* ── Premium Full-width Header with LmsPageHeader ── */}
      <LmsPageHeader
        categoryLabel="Hệ thống quản lý học tập (LMS)"
        title="Khóa học của tôi"
        description="Quản lý danh sách khóa học của bạn, theo dõi trạng thái xuất bản và số lượng học viên."
        sideWidget={
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
            <>
              <DataTable<Course>
                data={sortedAndFilteredCourses}
                keyExtractor={(course) => course.id}
                sortBy={sortBy}
                onSort={(key) => handleHeaderSort(key as "title" | "enrollments" | "date")}
                onRowClick={(course) => {
                  if (course.status !== "ARCHIVED") {
                    router.push(`/lms/teacher/courses/${course.id}`);
                  }
                }}
                columns={[
                  {
                    key: "title",
                    sortKey: "title",
                    sortable: true,
                    width: "35%",
                    minWidth: "240px",
                    header: ({ sortBy }) => (
                      <div className="flex items-center gap-1">
                        Khóa học
                        <ArrowUpDown className={cn(
                          "w-3 h-3 transition-opacity duration-200",
                          sortBy?.startsWith("title") ? "opacity-100 text-blue-600 dark:text-cyan-400" : "opacity-0 group-hover/th:opacity-60"
                        )} />
                      </div>
                    ),
                    cell: (course) => (
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0D192E] dark:to-[#0F1E35] flex items-center justify-center flex-shrink-0 relative border border-slate-200/80 dark:border-blue-500/15 group-hover:border-blue-500/30 dark:group-hover:border-cyan-400/40 transition-all duration-300">
                          {course.thumbnail_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={course.thumbnail_url} alt={course.title} className="object-cover w-full h-full" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform duration-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate max-w-xs lg:max-w-md">
                            {course.title}
                          </p>
                          <p className="text-xs text-slate-550 dark:text-slate-400 truncate max-w-xs lg:max-w-md mt-1 font-medium">
                            {course.description || "Chưa có mô tả"}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "category",
                    width: "20%",
                    minWidth: "140px",
                    header: "Phân loại",
                    cell: (course) => {
                      const items: React.ReactNode[] = [];
                      if (course.level) {
                        items.push(
                          <Badge key="level" variant={
                            course.level === "BEGINNER" ? "green" :
                            course.level === "INTERMEDIATE" ? "yellow" :
                            course.level === "ADVANCED" ? "red" : "blue"
                          }>
                            {course.level === "BEGINNER" ? "Cơ bản" :
                             course.level === "INTERMEDIATE" ? "Trung cấp" :
                             course.level === "ADVANCED" ? "Nâng cao" : "Mọi cấp"}
                          </Badge>
                        );
                      }
                      const categories = course.category
                        ? (course.category as string).split(",").map(c => c.trim()).filter(Boolean)
                        : [];
                      categories.forEach((cat, idx) => {
                        items.push(
                          <Badge key={`cat-${idx}`} variant="gray">
                            {cat}
                          </Badge>
                        );
                      });

                      const maxVisible = 2;
                      const visibleItems = items.slice(0, maxVisible);
                      const remainingCount = items.length - maxVisible;
                      const tooltipText = [
                        course.level && `Cấp độ: ${
                          course.level === "BEGINNER" ? "Cơ bản" :
                          course.level === "INTERMEDIATE" ? "Trung cấp" :
                          course.level === "ADVANCED" ? "Nâng cao" : "Mọi cấp"
                        }`,
                        categories.length > 0 && `Danh mục: ${categories.join(", ")}`
                      ].filter(Boolean).join(" | ");

                      return (
                        <div title={tooltipText} className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                          {visibleItems}
                          {remainingCount > 0 && (
                            <Badge variant="gray">
                              +{remainingCount}
                            </Badge>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    key: "enrollments",
                    sortKey: "enrollments",
                    sortable: true,
                    width: "12%",
                    minWidth: "90px",
                    align: "center",
                    header: ({ sortBy }) => (
                      <div className="flex items-center justify-center gap-1">
                        Học viên
                        <ArrowUpDown className={cn(
                          "w-3 h-3 transition-opacity duration-200",
                          sortBy?.startsWith("enrollments") ? "opacity-100 text-blue-600 dark:text-cyan-400" : "opacity-0 group-hover/th:opacity-60"
                        )} />
                      </div>
                    ),
                    cell: (course) => (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-355 bg-slate-100/80 dark:bg-[#0D192E] border border-slate-200/60 dark:border-blue-500/10">
                        <Users className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                        {course.enrollment_count ?? 0}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    width: "13%",
                    minWidth: "100px",
                    header: "Trạng thái",
                    cell: (course) => (
                      <Badge variant={course.status === "PUBLISHED" ? "green" : course.status === "ARCHIVED" ? "gray" : "yellow"}>
                        {course.status === "PUBLISHED" ? "Đã xuất bản" : course.status === "ARCHIVED" ? "Đã lưu trữ" : "Nháp"}
                      </Badge>
                    ),
                  },
                  {
                    key: "updated_at",
                    sortKey: "date",
                    sortable: true,
                    width: "12%",
                    minWidth: "110px",
                    header: ({ sortBy }) => (
                      <div className="flex items-center gap-1">
                        Cập nhật
                        <ArrowUpDown className={cn(
                          "w-3 h-3 transition-opacity duration-200",
                          sortBy === "newest" || sortBy === "oldest" ? "opacity-100 text-blue-600 dark:text-cyan-400" : "opacity-0 group-hover/th:opacity-60"
                        )} />
                      </div>
                    ),
                    cell: (course) => (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(course.updated_at || course.created_at)}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    width: "8%",
                    minWidth: "120px",
                    align: "right",
                    header: "Thao tác",
                    cell: (course) => (
                      <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-end gap-1.5">
                        {course.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handlePublish(course)}
                            disabled={publishing === course.id}
                            className={cn(
                              "p-2 rounded-xl transition-all duration-200 text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-cyan-400/40",
                              course.status === "PUBLISHED"
                                ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                                : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 text-slate-550 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                            )}
                            title={course.status === "PUBLISHED" ? "Gỡ xuất bản (chuyển về nháp)" : "Xuất bản khóa học"}
                          >
                            {publishing === course.id ? (
                              <Spinner className="w-4 h-4 border-2" />
                            ) : course.status === "PUBLISHED" ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                              title="Thao tác khác"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/20 shadow-xl rounded-2xl p-1.5 min-w-[170px] z-50">
                            <DropdownMenuItem
                              onClick={() => router.push(`/lms/teacher/courses/${course.id}`)}
                              className="text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-blue-950/60 focus:text-blue-600 dark:focus:text-cyan-400 cursor-pointer flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors"
                            >
                              <Settings className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                              <span>Chỉnh sửa chi tiết</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleArchive(course)}
                              disabled={archiving === course.id}
                              className="text-amber-600 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-950/40 cursor-pointer flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors"
                            >
                              {archiving === course.id ? (
                                <Spinner className="w-4 h-4" />
                              ) : course.status === "ARCHIVED" ? (
                                <ArchiveRestore className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Archive className="w-4 h-4 text-amber-500" />
                              )}
                              <span>{course.status === "ARCHIVED" ? "Khôi phục" : "Lưu trữ"}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDelete(course)}
                              disabled={deleting === course.id}
                              className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors"
                            >
                              {deleting === course.id ? (
                                <Spinner className="w-4 h-4" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-500" />
                              )}
                              <span>Xóa khóa học</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ),
                  },
                ]}
                renderMobileCard={(course) => (
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
                )}
              />
            </>

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
