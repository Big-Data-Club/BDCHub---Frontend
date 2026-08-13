"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Edit3 } from "lucide-react";
import lmsService from "@/services/lmsService";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/BreadcrumbNav";
import { Badge, Spinner, GridBackground } from "@/components/lms/shared";
import { Course } from "@/types";
import { cn } from "@/lib/utils";
import { useSetPageContext } from "@/hooks/usePageContext";

// Lazy-load modal - only needed when user clicks "Chỉnh sửa"
const EditCourseModal = dynamic(
  () => import("@/components/lms/teacher/EditCourseModal").then(m => ({ default: m.EditCourseModal })),
  { ssr: false },
);

// ─── Tab definitions ─────────────────────────────────────────────────────────

const COURSE_TABS = [
  { id: "overview", label: "Tổng quan", path: "/overview" },
  { id: "content", label: "Nội dung", path: "/content" },
  { id: "learners", label: "Học viên", path: "/learners" },
  { id: "co-teachers", label: "Đồng giáo viên", path: "/co-teachers" },
  { id: "students", label: "Tiến độ học tập", path: "/students" },
  { id: "ai", label: "🤖 AI", path: "/ai" },
];

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function CourseDetailLayout({ children }: { children: React.ReactNode }) {
  const { courseId } = useParams<{ courseId: string }>();
  const pathname = usePathname();
  const id = Number(courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const basePath = `/lms/teacher/courses/${id}`;

  const loadCourse = useCallback(async () => {
    try {
      const res = await lmsService.getCourse(id);
      setCourse(res?.data ?? null);
    } catch { }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  // ── Determine active tab ────────────────────────────────────────────────────
  const activeTab =
    COURSE_TABS.find(tab => {
      const fullPath = `${basePath}${tab.path}`;
      if (tab.id === "content") return pathname.startsWith(fullPath);
      return pathname === fullPath;
    }) ??
    // Fallback: if at basePath itself (before redirect kicks in), treat as overview
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B18] flex flex-col transition-colors duration-300">
      
      {/* ── Premium Full-width Header synced with Student Layout ── */}
      <header className="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-4 md:py-5 z-30 flex-shrink-0">
        <GridBackground />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <BreadcrumbNav items={breadcrumbItems} />
            
            <div className="mt-4">
              {loading ? (
                <div className="flex items-center gap-3">
                  <Spinner className="w-4 h-4 border-2 animate-spin text-blue-600 dark:text-cyan-400" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Đang tải khóa học…
                  </span>
                </div>
              ) : course ? (
                <>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    {course.title}
                  </h1>
                  {course.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium max-w-xl line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </>
              ) : (
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Không tìm thấy khóa học
                </h1>
              )}
            </div>

            <div className="flex items-center gap-3 mt-5 flex-wrap">
              {/* Tab switcher pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0D192E] border border-slate-200/60 dark:border-blue-500/15 rounded-xl p-1 flex-shrink-0 shadow-inner h-10 overflow-x-auto max-w-full">
                {COURSE_TABS.map(tab => {
                  const href = `${basePath}${tab.path}`;
                  const isActive = activeTab.id === tab.id;
                  return (
                    <Link
                      key={tab.id}
                      href={href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 h-full cursor-pointer whitespace-nowrap",
                        isActive
                          ? "bg-white dark:bg-[#0F1E35] text-blue-600 dark:text-cyan-400 shadow-xs border border-slate-200/40 dark:border-blue-500/15"
                          : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-[#162644]/30"
                      )}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side: Course configuration details card */}
          {!loading && course && (
            <div className="w-full lg:max-w-md flex-shrink-0">
              <div className="group/card bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-xs border border-slate-200/85 dark:border-blue-500/15 rounded-2xl p-4 shadow-xs hover:border-slate-355 dark:hover:border-blue-500/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:hover:shadow-[0_8px_30px_rgba(6,182,212,0.03)] w-full flex flex-col justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trạng thái cấu hình</h4>
                  
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant={course.status === "PUBLISHED" ? "green" : "yellow"}>
                      {course.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}
                    </Badge>
                    {course.category && <Badge variant="gray">{course.category}</Badge>}
                    {course.level && <Badge variant="blue">{course.level}</Badge>}
                  </div>
                </div>

                <div className="border-t border-slate-200/60 dark:border-blue-500/10 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Thiết lập bài giảng</span>
                  
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl active:scale-95 transition-all duration-200 border border-transparent dark:border-blue-500/10 hover:border-slate-300 dark:hover:border-blue-500/25"
                  >
                    <Edit3 className="w-3 h-3" />
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Main content (child pages) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow flex flex-col">
        {children}
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
