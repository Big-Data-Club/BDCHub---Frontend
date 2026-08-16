"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Edit3 } from "lucide-react";
import lmsService from "@/services/lmsService";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/BreadcrumbNav";
import { Badge, Spinner, GridBackground, NavTabBar } from "@/components/lms/shared";
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
      <header className="relative w-full overflow-visible border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-4 md:py-5 z-30 flex-shrink-0">
        <GridBackground />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full flex flex-col gap-5">
          {/* Top row: Breadcrumb + Title + Course Status metadata */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <BreadcrumbNav items={breadcrumbItems} />
              
              <div className="mt-2.5">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Spinner className="w-4 h-4 border-2 animate-spin text-blue-600 dark:text-cyan-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Đang tải khóa học…
                    </span>
                  </div>
                ) : course ? (
                  <>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                      {course.title}
                    </h1>
                    {course.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 font-medium max-w-2xl line-clamp-2 leading-relaxed tracking-normal">
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
            </div>

            {/* Right side: Streamlined course configuration details */}
            {!loading && course && (
              <div className="w-full sm:w-auto flex-shrink-0 flex items-center gap-3 bg-white/70 dark:bg-[#0F1E35]/70 backdrop-blur-xs border border-slate-200/80 dark:border-blue-500/15 rounded-2xl p-2.5 sm:p-3 shadow-2xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={course.status === "PUBLISHED" ? "green" : "yellow"}>
                    {course.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}
                  </Badge>
                  {course.category && <Badge variant="gray">{course.category}</Badge>}
                  {course.level && <Badge variant="blue">{course.level}</Badge>}
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl active:scale-95 transition-all duration-200 border border-transparent dark:border-blue-500/15 hover:border-slate-300 dark:hover:border-blue-500/30"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom row: Dedicated NavTabBar container */}
          <div className="pt-1 border-t border-slate-200/50 dark:border-blue-500/10">
            <NavTabBar
              tabs={COURSE_TABS}
              basePath={basePath}
            />
          </div>
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
