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
  InfiniteScrollTrigger, GridBackground
} from "@/components/lms/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const handlePublish = async (course: Course) => {
    const isDraft = course.status === "DRAFT";
    if (!confirm(isDraft ? `Xuất bản khóa học "${course.title}"?` : `Gỡ xuất bản khóa học "${course.title}" về bản nháp?`)) return;
    setPublishing(course.id);
    try {
      if (isDraft) {
        await lmsService.publishCourse(course.id);
        setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: "PUBLISHED" } : c));
      } else {
        // Toggle publish back to draft is supported by API
        // For fallback if not supported, we load again
        await lmsService.unarchiveCourse(course.id); // Or alternative unpublish call if backend supports it
        await load(filter);
      }
    } catch { setError(isDraft ? "Không thể xuất bản." : "Không thể gỡ xuất bản."); }
    finally { setPublishing(null); }
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Xóa khóa học "${course.title}"? Hành động này không thể hoàn tác.`)) return;
    setDeleting(course.id);
    try {
      await lmsService.deleteCourse(course.id);
      setCourses(prev => prev.filter(c => c.id !== course.id));
    } catch { setError("Không thể xóa khóa học."); }
    finally { setDeleting(null); }
  };

  const handleArchive = async (course: Course) => {
    const restoring = course.status === "ARCHIVED";
    const action = restoring ? "khôi phục" : "lưu trữ";
    if (!confirm(`${restoring ? "Khôi phục" : "Lưu trữ"} khóa học "${course.title}"?${restoring ? " Người học có thể truy cập lại theo trạng thái trước đó." : " Tất cả người dùng sẽ không thể truy cập cho đến khi bạn khôi phục."}`)) return;
    setArchiving(course.id);
    try {
      await (restoring ? lmsService.unarchiveCourse(course.id) : lmsService.archiveCourse(course.id));
      setCourses(prev => prev.map(item => item.id === course.id ? { ...item, status: restoring ? "DRAFT" : "ARCHIVED" } : item));
      if (restoring) await load(filter);
    } catch {
      setError(`Không thể ${action} khóa học.`);
    } finally {
      setArchiving(null);
    }
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
      {/* ── Premium Full-width Header synced with Teacher Dashboard Header ── */}
      <div className="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-4 md:py-5">
        <GridBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 w-full">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <p className="text-xs text-blue-600 dark:text-cyan-400 uppercase tracking-widest font-extrabold mb-1">
              Hệ thống quản lý học tập (LMS)
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Khóa học của tôi
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Quản lý danh sách khóa học của bạn, theo dõi trạng thái xuất bản và số lượng học viên.
            </p>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <GhostBtn
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => load(filter)}
                className="active:scale-95 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0D192E]/60 backdrop-blur-xs font-semibold"
              >
                Làm mới
              </GhostBtn>
              <GhostBtn
                size="sm"
                icon={<Home className="w-3.5 h-3.5" />}
                onClick={() => router.push("/lms/teacher")}
                className="active:scale-95 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0D192E]/60 backdrop-blur-xs font-semibold"
              >
                Dashboard
              </GhostBtn>
              <PrimaryBtn
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => router.push("/lms/teacher/courses/create")}
                className="active:scale-95 font-semibold"
              >
                Tạo khóa học
              </PrimaryBtn>
            </div>
          </div>

          {/* Teacher Summary Mirror Card */}
          <div className="w-full lg:max-w-xl xl:max-w-2xl flex-shrink-0">
            <div className="group/card bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-xs border border-slate-200/85 dark:border-blue-500/15 rounded-2xl p-4 shadow-xs hover:border-slate-355 dark:hover:border-blue-500/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:hover:shadow-[0_8px_30px_rgba(6,182,212,0.03)] w-full grid grid-cols-1 md:grid-cols-[1fr_1.25px_1fr] gap-x-6 gap-y-3 relative">
              
              {/* Left column: Courses status */}
              <div className="md:col-start-1 flex flex-col justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50/80 text-blue-600 dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/20 group-hover/card:scale-105 transition-all duration-300">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trạng thái khóa học</h4>
                  </div>
                </div>

                <p className="text-xs text-slate-550 dark:text-slate-400 mt-2 font-medium">
                  Tổng số: <span className="text-blue-600 dark:text-cyan-400 font-bold">{totalCoursesCount}</span> khóa học
                </p>

                <div className="h-2.5 w-full mt-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-[#080F1E]">
                  {published > 0 && (
                    <div style={{ width: `${publishedPercent}%` }} className="bg-emerald-500 dark:bg-emerald-400" title={`Đã xuất bản: ${published}`} />
                  )}
                  {draft > 0 && (
                    <div style={{ width: `${draftPercent}%` }} className="bg-amber-500 dark:bg-amber-450" title={`Bản nháp: ${draft}`} />
                  )}
                  {archived > 0 && (
                    <div style={{ width: `${archivedPercent}%` }} className="bg-slate-400 dark:bg-slate-550" title={`Đã lưu trữ: ${archived}`} />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-slate-200/60 dark:border-blue-500/10">
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Xuất bản</span>
                    <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{published}</p>
                  </div>
                  <div className="text-center border-l border-slate-200/60 dark:border-blue-500/10">
                    <span className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Bản nháp</span>
                    <p className="text-sm font-extrabold text-amber-600 dark:text-amber-450 mt-0.5">{draft}</p>
                  </div>
                  <div className="text-center border-l border-slate-200/60 dark:border-blue-500/10">
                    <span className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Lưu trữ</span>
                    <p className="text-sm font-extrabold text-slate-500 dark:text-slate-400 mt-0.5">{archived}</p>
                  </div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden md:block md:col-start-2 w-[1.5px] bg-slate-200 dark:bg-blue-500/15 self-stretch my-1 transition-all duration-300 flex-shrink-0" />

              {/* Right column: Learner Engagement */}
              <div className="md:col-start-3 flex flex-col justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-50/80 text-purple-600 dark:bg-purple-950/65 dark:text-purple-300 border border-purple-200/50 dark:border-purple-500/20 group-hover/card:scale-105 transition-all duration-300">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">Tác động giảng dạy</h4>
                  </div>
                </div>

                <p className="text-xs text-slate-550 dark:text-slate-400 mt-2 font-medium">
                  Tổng số học viên đã đăng ký
                </p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {totalEnrollments}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Học viên</span>
                </div>

                <div className="mt-auto border-t border-slate-200/60 dark:border-blue-500/10 pt-2 flex items-center justify-between text-xs text-slate-550 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                    <span>Lớp đang hoạt động</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">24/7 Live</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full flex-grow">

        {error && <Alert type="error">{error}</Alert>}

        {/* Dynamic Filter / Sort Control Dashboard */}
        <Card className="p-5 border border-slate-200/80 dark:border-blue-500/10 bg-white/70 dark:bg-[#0F1E35]/65 backdrop-blur-md rounded-3xl">
          <div className="flex flex-col gap-5">
            {/* Row 1: Clean TabBar directly on top */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-blue-500/5 pb-4">
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
              <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 self-center hidden lg:block">
                Hiển thị {sortedAndFilteredCourses.length} khóa học
              </span>
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
              <div className="w-full">
                <Select value={selectedTag} onValueChange={(value) => setSelectedTag(value)}>
                  <SelectTrigger className="w-full h-[42px] bg-slate-50 dark:bg-[#0D192E] border border-slate-200 dark:border-blue-500/15 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 transition-all rounded-xl text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <SelectValue placeholder="Tất cả danh mục" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#0F1E35] dark:border-blue-500/15">
                    <SelectItem value="all">Tất cả danh mục (tag)</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level selector */}
              <div className="w-full">
                <Select value={selectedLevel} onValueChange={(value) => setSelectedLevel(value)}>
                  <SelectTrigger className="w-full h-[42px] bg-slate-50 dark:bg-[#0D192E] border border-slate-200 dark:border-blue-500/15 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 transition-all rounded-xl text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-400" />
                      <SelectValue placeholder="Tất cả cấp độ" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#0F1E35] dark:border-blue-500/15">
                    <SelectItem value="all">Tất cả cấp độ</SelectItem>
                    <SelectItem value="BEGINNER">Cơ bản</SelectItem>
                    <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                    <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                    <SelectItem value="ALL_LEVELS">Mọi cấp độ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort selector */}
              <div className="w-full">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-full h-[42px] bg-slate-50 dark:bg-[#0D192E] border border-slate-200 dark:border-blue-500/15 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 transition-all rounded-xl text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-slate-400" />
                      <SelectValue placeholder="Sắp xếp" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#0F1E35] dark:border-blue-500/15">
                    <SelectItem value="newest">Mới nhất trước</SelectItem>
                    <SelectItem value="oldest">Cũ nhất trước</SelectItem>
                    <SelectItem value="enrollments-desc">Nhiều học viên nhất</SelectItem>
                    <SelectItem value="title-asc">Tên (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Tên (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

      </div>
    </div>
  );
}
