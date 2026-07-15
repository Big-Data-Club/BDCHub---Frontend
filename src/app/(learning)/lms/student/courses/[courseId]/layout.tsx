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

import { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Menu, X, BookOpen, BarChart3, ChevronLeft, ChevronRight
} from "lucide-react";

import lmsService from "@/services/lmsService";
import progressService, { CourseProgress, ProgressDetailItem } from "@/services/progressService";
import { useSession } from "next-auth/react";

import { PageLoader, GridBackground } from "@/components/lms/shared";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/BreadcrumbNav";
import { StudentCourseContext } from "@/components/lms/student/StudentCourseContext";
import { CourseLearningSidebar } from "@/components/lms/student/CourseLearningSidebar";
import { CourseDetailProgressCard } from "@/components/lms/student/CourseDetailProgressCard";
import { Content, Course, Section } from "@/types";
import { cn } from "@/lib/utils";
import { useSetPageContext } from "@/hooks/usePageContext";

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: "learn", label: "Học tập", path: "/learn", icon: null },
  { id: "stats", label: "Thống kê", path: "/stats", icon: <BarChart3 className="w-3.5 h-3.5" /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

function StudentCourseDetailLayoutInner({ children }: { children: React.ReactNode }) {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = Number(courseId);

  // Track whether we've already restored from URL param
  const restoredFromUrl = useRef(false);
  const initialContentId = useRef<number | null>(
    searchParams.get("contentId") ? Number(searchParams.get("contentId")) : null
  );
  const basePath = `/lms/student/courses/${id}`;

  // ── Core state ──
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [coTeachers, setCoTeachers] = useState<any[]>([]);
  
  const { data: session } = useSession();
  const userId = session?.user ? Number((session.user as any).id || (session.user as any).userId) : undefined;
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    lmsService.getMyRoles().then(roles => setUserRoles(roles || [])).catch(() => {});
  }, []);

  const isCourseTeacher = useMemo(() => {
    if (!userId || !course) return false;
    const isCreator = course.created_by === userId;
    const isCo = coTeachers.some(ct => ct.user_id === userId);
    const isAdmin = userRoles.includes("ADMIN");
    return isCreator || isCo || isAdmin;
  }, [userId, course, coTeachers, userRoles]);
  const [sectionContents, setSectionContents] = useState<Record<number, Content[]>>({});
  const [loadingSection, setLoadingSection] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [activeContent, setActiveContent] = useState<Content | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("course-sidebar-collapsed");
      if (stored === "true") {
        setSidebarCollapsed(true);
      }
    }
  }, []);

  // ── Progress state ──
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [progressDetail, setProgressDetail] = useState<ProgressDetailItem[]>([]);
  const [markingComplete, setMarkingComplete] = useState(false);

  // ─── Load progress ────────────────────────────────────────────────────────

  const loadProgress = useCallback(async () => {
    try {
      const [prog, detail] = await Promise.all([
        progressService.getMyCourseProgress(id),
        progressService.getMyCourseProgressDetail(id),
      ]);
      if (prog) {
        setProgress(prog);
        setCompletedIds(new Set(prog.completed_content_ids ?? []));
      }
      setProgressDetail(detail ?? []);
    } catch {
      // Progress API may not be available yet - degrade gracefully
    }
  }, [id]);

  // ─── Load course + sections ───────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const [courseRes, sectionsRes, coTeachersRes] = await Promise.all([
          lmsService.getCourse(id),
          lmsService.listSections(id),
          lmsService.getCoTeachers(id).catch(() => []),
        ]);
        setCourse(courseRes?.data ?? null);
        setCoTeachers(coTeachersRes ?? []);
        const secs: Section[] = sectionsRes?.data ?? [];
        setSections(secs);

        if (secs.length > 0) {
          const allIds = secs.map(s => s.id);
          setExpanded(new Set(allIds));
          // Prefetch all contents (parallel, will be cached by loadSectionContentsInner)
          allIds.forEach(sid => loadSectionContentsInner(sid));

          // Only auto-select first content if there's no contentId to restore from URL
          if (!initialContentId.current) {
            loadSectionContentsInner(secs[0].id, true);
          }
        }
      } catch {
        router.back();
      } finally {
        setLoadingPage(false);
      }
    })();
    loadProgress();
  }, [id]); // eslint-disable-line

  // ─── Restore content from URL param ────────────────────────────────────────
  // Once all section contents are fetched, find the content matching the URL param
  useEffect(() => {
    if (restoredFromUrl.current || !initialContentId.current) return;
    const targetId = initialContentId.current;
    // Search across all fetched section contents
    for (const items of Object.values(sectionContents)) {
      const found = items.find(c => c.id === targetId);
      if (found) {
        setActiveContent(found);
        restoredFromUrl.current = true;
        return;
      }
    }
  }, [sectionContents]); // eslint-disable-line

  // ─── Load section contents ────────────────────────────────────────────────

  const loadSectionContentsInner = useCallback(async (sectionId: number, autoSelect = false) => {
    if (sectionContents[sectionId]) {
      if (autoSelect && !activeContent) {
        const first = sectionContents[sectionId][0];
        if (first) setActiveContent(first);
      }
      return;
    }
    setLoadingSection(prev => ({ ...prev, [sectionId]: true }));
    try {
      const res = await lmsService.listContent(sectionId);
      const items: Content[] = res?.data ?? [];
      setSectionContents(prev => ({ ...prev, [sectionId]: items }));
      if (autoSelect && !activeContent && items.length > 0) {
        setActiveContent(items[0]);
      }
    } finally {
      setLoadingSection(prev => ({ ...prev, [sectionId]: false }));
    }
  }, [sectionContents, activeContent]);

  const loadSectionContents = useCallback((sectionId: number, autoSelect = false) => {
    loadSectionContentsInner(sectionId, autoSelect);
  }, [loadSectionContentsInner]);

  const toggleSection = useCallback((sectionId: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
        loadSectionContentsInner(sectionId);
      }
      return next;
    });
  }, [loadSectionContentsInner]);

  // ─── Mark content complete ────────────────────────────────────────────────

  const handleMarkComplete = useCallback(async (contentId: number) => {
    if (completedIds.has(contentId) || markingComplete) return;
    setMarkingComplete(true);
    try {
      await progressService.markContentComplete(contentId);
      setCompletedIds(prev => new Set([...prev, contentId]));
      await loadProgress();
    } catch {
      // fail silently; will retry on next interaction
    } finally {
      setMarkingComplete(false);
    }
  }, [completedIds, markingComplete, loadProgress]);

  // ─── Select content (navigate to learn page) ─────────────────────────────

  const handleSelectContent = useCallback((c: Content) => {
    setActiveContent(c);
    setSidebarOpen(false);
    // Update URL search param to persist the active content
    const target = `${basePath}/learn?contentId=${c.id}`;
    if (!pathname.endsWith("/learn")) {
      router.push(target);
    } else {
      // Replace (not push) to avoid polluting browser history on every content switch
      router.replace(target, { scroll: false });
    }
  }, [pathname, basePath, router]);

  // ─── Active tab ───────────────────────────────────────────────────────────
  const activeTab = TABS.find(tab => pathname.includes(tab.path)) || TABS[0];
  const activeTabId = activeTab.id;

  // ─── Breadcrumb items ─────────────────────────────────────────────────────
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Học tập", href: "/lms/student" },
    {
      label: loadingPage ? "..." : (course?.title ?? "Khóa học"),
      href: `${basePath}/learn`,
    },
    ...(activeTabId !== "learn" ? [{ label: activeTab.label }] : []),
  ];

  // ─── Context value ────────────────────────────────────────────────────────

  const contextValue = useMemo(() => ({
    course,
    sections,
    courseId: id,
    coTeachers,
    activeContent,
    setActiveContent: handleSelectContent,
    sectionContents,
    loadSectionContents,
    loadingSection,
    expanded,
    toggleSection,
    sidebarOpen,
    setSidebarOpen,
    completedIds,
    handleMarkComplete,
    markingComplete,
    progress,
    progressDetail,
    loadProgress,
  }), [
    course, sections, id, coTeachers,
    activeContent, handleSelectContent,
    sectionContents, loadSectionContents, loadingSection,
    expanded, toggleSection,
    sidebarOpen,
    completedIds, handleMarkComplete, markingComplete,
    progress, progressDetail, loadProgress,
  ]);

  // ── Push page context for AI sidebar ───────────────────────────────────────

  const { setPageContext, clearPageContext } = useSetPageContext();

  useEffect(() => {
    if (!course) return;
    setPageContext({
      pageType: activeContent ? "lesson" : "course_detail",
      courseId: id,
      courseName: course.title,
      contentId: activeContent?.id,
      contentTitle: activeContent?.title,
    });
    return () => clearPageContext();
  }, [course, activeContent, id, setPageContext, clearPageContext]);

  if (loadingPage) return <PageLoader message="Đang tải khóa học..." />;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <StudentCourseContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#050B18] flex flex-col transition-colors duration-300">

        {/* ── Premium Header Section (Synced with StudentDashboardHeader height, padding, and alignment) ── */}
        <header className="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-4 md:py-5 z-30 flex-shrink-0">
          <GridBackground />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            <div className="min-w-0 flex-1">
              <BreadcrumbNav items={breadcrumbItems} />
              
              <div className="mt-4">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {course?.title ?? "Khóa học"}
                </h1>
                {course?.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium max-w-xl line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 mt-4.5 flex-wrap">
                {/* Tab switcher pill */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-[#0D192E] border border-slate-200/60 dark:border-blue-500/15 rounded-xl p-1 flex-shrink-0 shadow-inner h-10">
                  {TABS.map(tab => {
                    const isActive = activeTabId === tab.id;
                    return (
                      <Link
                        key={tab.id}
                        href={`${basePath}${tab.path}`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 h-full cursor-pointer",
                          isActive
                            ? "bg-white dark:bg-[#0F1E35] text-blue-600 dark:text-cyan-400 shadow-xs border border-slate-200/40 dark:border-blue-500/15"
                            : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-[#162644]/30"
                        )}
                      >
                        {tab.icon}
                        {tab.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile: sidebar toggle */}
                <button
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0F1E35] text-slate-600 dark:text-slate-400"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="w-full lg:max-w-xl xl:max-w-2xl flex-shrink-0">
              <CourseDetailProgressCard
                course={course}
                progress={progress}
                completedIds={completedIds}
                sections={sections}
                sectionContents={sectionContents}
                onSelectContent={handleSelectContent}
                loading={loadingPage}
              />
            </div>
          </div>
          
          {/* Mobile tab bar */}
          <div className="sm:hidden relative max-w-7xl mx-auto px-4 z-10 w-full mt-4">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0D192E] border border-slate-200/60 dark:border-blue-500/15 rounded-xl p-1 shadow-inner h-10 w-full">
              {TABS.map(tab => {
                const isActive = activeTabId === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={`${basePath}${tab.path}`}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 h-full flex-1 cursor-pointer",
                      isActive
                        ? "bg-white dark:bg-[#0F1E35] text-blue-600 dark:text-cyan-400 shadow-xs border border-slate-200/40 dark:border-blue-500/15"
                        : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex-1 w-full flex relative">

          {/* Desktop sidebar - sticky viewport-locked height, starts below global nav (top-16) */}
          <aside className={cn(
            "hidden lg:flex flex-col bg-white dark:bg-[#070E1C] flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out overflow-hidden border-r border-slate-200/80 dark:border-blue-500/10",
            sidebarCollapsed ? "w-0 border-r-0 opacity-0" : "w-72 xl:w-80 border-r opacity-100"
          )}>
            <div className="w-72 xl:w-80 h-full flex flex-col">
              <CourseLearningSidebar />
            </div>
          </aside>

          {/* Collapse/Expand Floating Toggle Tab on Desktop */}
          <button
            onClick={() => {
              const newVal = !sidebarCollapsed;
              setSidebarCollapsed(newVal);
              if (typeof window !== "undefined") {
                localStorage.setItem("course-sidebar-collapsed", String(newVal));
              }
            }}
            className={cn(
              "hidden lg:flex absolute top-1/2 -translate-y-1/2 z-40 w-4 h-16 bg-white dark:bg-[#070E1C] border border-slate-200 dark:border-blue-500/10 rounded-r-lg items-center justify-center text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 shadow-md transition-all duration-300 hover:w-5 hover:bg-slate-50 dark:hover:bg-[#0D192E] cursor-pointer",
              sidebarCollapsed ? "left-0 border-l" : "left-[288px] xl:left-[320px] border-l-0"
            )}
            title={sidebarCollapsed ? "Mở rộng danh sách bài học" : "Thu gọn danh sách bài học"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>

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
    </StudentCourseContext.Provider>
  );
}

export default function StudentCourseDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader message="Đang tải khóa học..." />}>
      <StudentCourseDetailLayoutInner>{children}</StudentCourseDetailLayoutInner>
    </Suspense>
  );
}
