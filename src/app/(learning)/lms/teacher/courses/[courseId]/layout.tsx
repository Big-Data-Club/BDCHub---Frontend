"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Edit3, BookOpen, Users, Shield, Activity, Eye, User, Calendar, Clock } from "lucide-react";
import lmsService from "@/services/lmsService";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/BreadcrumbNav";
import { Badge, Spinner, GridBackground, NavTabBar } from "@/components/lms/shared";
import { Course, Section } from "@/types";
import { cn } from "@/lib/utils";
import { useSetPageContext } from "@/hooks/usePageContext";
import { CourseReadinessPopover } from "@/components/lms/teacher/page/CourseReadinessPopover";

// Lazy-load modal - only needed when user clicks "Chỉnh sửa"
const EditCourseModal = dynamic(
  () => import("@/components/lms/teacher/EditCourseModal").then(m => ({ default: m.EditCourseModal })),
  { ssr: false },
);

// ─── Tab definitions ─────────────────────────────────────────────────────────

const COURSE_TABS = [
  { id: "overview", label: "Tổng quan", path: "/overview" },
  { id: "content", label: "Nội dung bài học", path: "/content" },
  { id: "students", label: "Học viên & Tiến độ", path: "/students" },
  { id: "analytics", label: "Phân tích & AI", path: "/analytics" },
];

function renderCategoryBadges(catString?: string) {
  if (!catString) return null;
  const tags = catString.split(",").map(t => t.trim()).filter(Boolean);
  if (tags.length === 0) return null;
  
  const visible = tags.slice(0, 2);
  const hiddenTags = tags.slice(2);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visible.map((tag, i) => (
        <Badge key={i} variant="gray">{tag}</Badge>
      ))}

      {hiddenTags.length > 0 && (
        <div className="relative group/tagpopover">
          <span 
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200/90 dark:bg-slate-800/90 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/60 dark:border-blue-500/25 cursor-pointer transition-all active:scale-95 shadow-2xs"
            tabIndex={0}
            role="button"
            aria-label={`Xem ${hiddenTags.length} danh mục khác`}
          >
            +{hiddenTags.length}
          </span>

          {/* Interactive Hover Popover Dropdown */}
          <div className="absolute left-0 top-full mt-1.5 z-50 invisible opacity-0 group-hover/tagpopover:visible group-hover/tagpopover:opacity-100 group-focus-within/tagpopover:visible group-focus-within/tagpopover:opacity-100 transition-all duration-200 ease-out transform -translate-y-1 group-hover/tagpopover:translate-y-0 pointer-events-none group-hover/tagpopover:pointer-events-auto min-w-[180px] max-w-xs">
            <div className="bg-white/95 dark:bg-[#0D192E]/95 backdrop-blur-md border border-slate-200 dark:border-blue-500/30 rounded-2xl p-2.5 shadow-xl space-y-1.5 ring-1 ring-slate-900/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-cyan-400 block px-1">
                Danh mục bổ sung ({hiddenTags.length})
              </span>
              <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto scrollbar-none">
                {hiddenTags.map((tag, idx) => (
                  <Badge key={idx} variant="blue">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function CourseDetailLayout({ children }: { children: React.ReactNode }) {
  const { courseId } = useParams<{ courseId: string }>();
  const pathname = usePathname();
  const id = Number(courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const basePath = `/lms/teacher/courses/${id}`;

  const loadCourse = useCallback(async () => {
    try {
      const [courseRes, sectionsRes] = await Promise.all([
        lmsService.getCourse(id),
        lmsService.listSections(id),
      ]);
      setCourse(courseRes?.data ?? null);
      setSections(sectionsRes?.data ?? []);
    } catch { }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  const handlePublish = async () => {
    if (!confirm("Xuất bản khóa học này? Học viên sẽ có thể đăng ký.")) return;
    setPublishing(true);
    try {
      await lmsService.publishCourse(id);
      await loadCourse();
    } catch {
      alert("Không thể xuất bản khóa học.");
    } finally {
      setPublishing(false);
    }
  };

  // ── Determine active tab ────────────────────────────────────────────────────
  const activeTab =
    COURSE_TABS.find(tab => {
      const fullPath = `${basePath}${tab.path}`;
      if (tab.id === "content") return pathname.startsWith(fullPath);
      return pathname === fullPath;
    }) ??
    COURSE_TABS[0];

  // ── Breadcrumb items ────────────────────────────────────────────────────────
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Khóa học", href: "/lms/teacher/courses" },
    {
      label: loading ? "..." : (course?.title ?? "Khóa học"),
      href: `${basePath}/overview`,
    },
    ...(activeTab.id !== "overview" ? [{ label: activeTab.label }] : []),
  ];

  // ── Push page context for AI sidebar ─────────────────────────────────────

  const { setPageContext, clearPageContext } = useSetPageContext();

  useEffect(() => {
    if (!course) return;
    setPageContext({
      pageType: "course_detail",
      courseId: id,
      courseName: course.title,
    });
    return () => clearPageContext();
  }, [course, id, setPageContext, clearPageContext]);

  const isPublished = course?.status === "PUBLISHED";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B18] flex flex-col transition-colors duration-300">
      
      {/* ── Premium Full-width Header synced with Student Layout ── */}
      <header className="relative w-full overflow-visible border-b border-slate-200/80 dark:border-blue-500/15 bg-white/40 dark:bg-[#070E1C]/60 backdrop-blur-xl py-6 z-30 flex-shrink-0">
        <GridBackground />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full flex flex-col gap-6">
          {/* Top row: Breadcrumb + Title + Streamlined Header Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left side: Main Course Overview Header */}
            <div className="lg:col-span-7 space-y-4 min-w-0">
              <BreadcrumbNav items={breadcrumbItems} />
              
              <div>
                {loading ? (
                  <div className="flex items-center gap-3 py-4">
                    <Spinner className="w-4 h-4 border-2 animate-spin text-blue-600 dark:text-cyan-400" />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Đang tải khóa học…
                    </span>
                  </div>
                ) : course ? (
                  <div className="space-y-3">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance">
                      {course.title}
                    </h1>

                    {course.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal max-w-2xl line-clamp-2 leading-relaxed tracking-normal">
                        {course.description}
                      </p>
                    )}

                    {/* Metadata Pill Bar: Tags, Creator, Dates & Action buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        {renderCategoryBadges(course.category)}
                        {course.level && <Badge variant="blue">{course.level}</Badge>}
                      </div>

                      <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {course.creator_avatar_url ? (
                          <img 
                            src={course.creator_avatar_url} 
                            alt={course.creator_name || "Giảng viên"} 
                            className="w-4 h-4 rounded-full object-cover ring-1 ring-blue-500/20"
                          />
                        ) : (
                          <User className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 p-0.5 text-slate-500" />
                        )}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Tạo bởi: <strong className="font-semibold">{course.creator_name || "Giảng viên"}</strong>
                        </span>
                      </div>

                      <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                      {/* Timestamps Pill */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 font-normal" title={`Khởi tạo: ${new Date(course.created_at).toLocaleString("vi-VN")}`}>
                          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>Tạo {new Date(course.created_at).toLocaleDateString("vi-VN")}</span>
                        </span>

                        {course.published_at && (
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400" title={`Xuất bản: ${new Date(course.published_at).toLocaleString("vi-VN")}`}>
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Xuất bản {new Date(course.published_at).toLocaleDateString("vi-VN")}</span>
                          </span>
                        )}
                      </div>

                      <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                      <button
                        onClick={() => setShowEditModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-xl active:scale-95 transition-all shadow-xs border border-slate-200 dark:border-blue-500/20 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Chỉnh sửa thông tin</span>
                      </button>

                      {!isPublished && (
                        <button
                          onClick={handlePublish}
                          disabled={publishing}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-xl active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{publishing ? "Đang xuất bản…" : "Xuất bản khóa học"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Không tìm thấy khóa học
                  </h1>
                )}
              </div>
            </div>

            {/* Right side: Expanded Header Dashboard Hero Panel */}
            {!loading && course && (
              <div className="lg:col-span-5 w-full">
                <div className="bg-white/90 dark:bg-[#0F1E35]/90 backdrop-blur-md border border-slate-200/90 dark:border-blue-500/20 rounded-2xl p-4.5 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/10 pb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-cyan-400">
                      Tổng quan chỉ số
                    </span>
                    <Badge variant={isPublished ? "green" : "yellow"}>
                      {isPublished ? "Đã xuất bản" : "Bản nháp"}
                    </Badge>
                  </div>

                  {/* 2x2 Compact Metric Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Metric 1: Visibility */}
                    <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#0D192E]/90 border border-slate-100 dark:border-blue-500/10 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phạm vi</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {course.visibility === "PUBLIC" ? "Công khai" : "Nội bộ"}
                        </p>
                      </div>
                      <Shield className="w-4 h-4 text-blue-500 dark:text-cyan-400 flex-shrink-0" />
                    </div>

                    {/* Metric 2: Enrollment */}
                    <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#0D192E]/90 border border-slate-100 dark:border-blue-500/10 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Học viên</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {course.enrollment_count ?? 0} học viên
                        </p>
                      </div>
                      <Users className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    </div>

                    {/* Metric 3: Sections */}
                    <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#0D192E]/90 border border-slate-100 dark:border-blue-500/10 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Chương học</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {sections.length} chương
                        </p>
                      </div>
                      <BookOpen className="w-4 h-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
                    </div>

                    {/* Metric 4: Interactive Readiness Dropdown Popover */}
                    <CourseReadinessPopover course={course} sections={sections} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom row: Compact NavTabBar */}
          <div className="pt-1">
            <NavTabBar
              tabs={COURSE_TABS}
              basePath={basePath}
            />
          </div>
        </div>
      </header>

      {/* ── Main content (child pages with page-switch transition) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow flex flex-col">
        <div key={pathname} className="w-full flex-grow flex flex-col animate-fadeIn duration-300">
          {children}
        </div>
      </main>

      {/* ── Edit course modal ── */}
      {showEditModal && course && (
        <EditCourseModal
          course={course}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => { setShowEditModal(false); loadCourse(); }}
        />
      )}
    </div>
  );
}
