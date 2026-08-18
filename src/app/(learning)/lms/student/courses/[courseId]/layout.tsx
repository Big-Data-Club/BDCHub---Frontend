"use client";

/**
 * Student Course Detail Layout
 * Route: /lms/student/courses/[courseId]
 *
 * Provides:
 *  - Premium Header Section (Discovery Page Style, full width)
 *  - Desktop sidebar (sections / progress via CourseLearningSidebar) - sticky viewport-locked
 *  - Mobile sidebar drawer
 *  - StudentCourseContext for child pages
 */

import { useEffect, useState, Suspense } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu, X, BarChart3, ChevronLeft, ChevronRight
} from "lucide-react";

import { PageLoader, GridBackground, NavTabBar, LmsPageHeader } from "@/components/lms/shared";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/shared/BreadcrumbNav";
import { useStudentCourse } from "@/components/lms/student/StudentCourseContext";
import { StudentCourseProviders } from "@/components/lms/student/StudentCourseProviders";
import { CourseLearningSidebar } from "@/components/lms/student/CourseLearningSidebar";
import { CourseDetailProgressCard } from "@/components/lms/student/CourseDetailProgressCard";
import { cn } from "@/lib/utils";

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: "learn", label: "Học tập", path: "/learn", icon: null },
  { id: "stats", label: "Thống kê", path: "/stats", icon: <BarChart3 className="w-3.5 h-3.5" /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LAYOUT INNER
// ─────────────────────────────────────────────────────────────────────────────

function StudentCourseDetailLayoutInner({ children }: { children: React.ReactNode }) {
  const { courseId } = useParams<{ courseId: string }>();
  const pathname = usePathname();
  const id = Number(courseId);
  const basePath = `/lms/student/courses/${id}`;

  // Consume from split contexts via useStudentCourse hook
  const {
    course,
    sections,
    activeContent,
    setActiveContent,
    sectionContents,
    completedIds,
    progress,
    sidebarOpen,
    setSidebarOpen,
  } = useStudentCourse();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("course-sidebar-collapsed");
      if (stored === "true") {
        setSidebarCollapsed(true);
      }
    }
  }, []);

  // Keyboard shortcut Ctrl+B to toggle sidebar collapse state (matching sidebar primitive pattern)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSidebarCollapsed((prev) => {
          const next = !prev;
          if (typeof window !== "undefined") {
            localStorage.setItem("course-sidebar-collapsed", String(next));
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ─── Active tab ───────────────────────────────────────────────────────────
  const activeTab = TABS.find(tab => pathname.includes(tab.path)) || TABS[0];
  const activeTabId = activeTab.id;

  // ─── Breadcrumb items ─────────────────────────────────────────────────────
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Học tập", href: "/lms/student" },
    {
      label: course?.title ?? "Khóa học",
      href: `${basePath}/learn`,
    },
    ...(activeTabId !== "learn" ? [{ label: activeTab.label }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B18] flex flex-col transition-colors duration-300">

      {/* ── Header Section with Reusable LmsPageHeader ── */}
      <LmsPageHeader
        fullWidth
        breadcrumbs={<BreadcrumbNav items={breadcrumbItems} />}
        title={course?.title ?? "Khóa học"}
        description={course?.description}
        bottomBar={
          <>
            <NavTabBar
              tabs={TABS}
              basePath={basePath}
              className="hidden sm:flex"
            />
            <button
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-blue-500/20 bg-white dark:bg-[#0F1E35] text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Danh sách bài học
            </button>
          </>
        }
        sideWidget={
          <div className="w-full lg:w-[540px] xl:w-[580px]">
            <CourseDetailProgressCard
              course={course}
              progress={progress}
              completedIds={completedIds}
              sections={sections}
              sectionContents={sectionContents}
              onSelectContent={setActiveContent}
              loading={false}
            />
          </div>
        }
      />

      {/* ── Body ── */}
      <div className="flex-1 w-full flex relative">

        {/* Desktop sidebar - clean viewport-locked height */}
        <aside className={cn(
          "hidden lg:flex flex-col bg-white dark:bg-[#070E1C] flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out overflow-hidden border-r border-slate-200/80 dark:border-blue-500/10",
          sidebarCollapsed ? "w-0 border-r-0 opacity-0" : "w-72 xl:w-80 border-r opacity-100"
        )}>
          <div className="w-72 xl:w-80 h-full flex flex-col relative">
            <CourseLearningSidebar
              onCollapseToggle={() => {
                const newVal = !sidebarCollapsed;
                setSidebarCollapsed(newVal);
                if (typeof window !== "undefined") {
                  localStorage.setItem("course-sidebar-collapsed", String(newVal));
                }
              }}
              isCollapsed={sidebarCollapsed}
            />
          </div>
        </aside>

        {/* Floating expand button when sidebar is collapsed (docked to border edge) */}
        {sidebarCollapsed && (
          <button
            onClick={() => {
              setSidebarCollapsed(false);
              if (typeof window !== "undefined") {
                localStorage.setItem("course-sidebar-collapsed", "false");
              }
            }}
            className="hidden lg:flex sticky top-20 left-0 z-30 w-7 h-9 bg-white dark:bg-[#0F1E35] border border-l-0 border-slate-200 dark:border-blue-500/20 rounded-r-lg items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 shadow-sm transition-all duration-200 cursor-pointer"
            title="Mở rộng danh sách bài học (Ctrl+B)"
            aria-label="Mở rộng danh sách bài học"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-80 max-w-[85vw] bg-white dark:bg-[#070E1C] h-full overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-blue-500/10">
                <span className="font-bold text-slate-900 dark:text-slate-50">Nội dung khóa học</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-[#0F1E35]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CourseLearningSidebar />
            </aside>
          </div>
        )}

        {/* ── Main content (child pages) ── */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StudentCourseDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader message="Đang tải khóa học..." />}>
      <StudentCourseProviders>
        <StudentCourseDetailLayoutInner>{children}</StudentCourseDetailLayoutInner>
      </StudentCourseProviders>
    </Suspense>
  );
}
