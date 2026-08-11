"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import lmsService from "@/services/lmsService";
import progressService, { CourseProgress, ProgressDetailItem } from "@/services/progressService";
import { useSetPageContext } from "@/hooks/usePageContext";
import { Content, Course, Section } from "@/types";
import { PageLoader } from "@/components/lms/shared";

import {
  StudentCourseNavigationContext,
  StudentCourseProgressContext,
  StudentCourseUiContext
} from "./StudentCourseContext";

export function StudentCourseProviders({ children }: { children: React.ReactNode }) {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = Number(courseId);

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

  const [sectionContents, setSectionContents] = useState<Record<number, Content[]>>({});
  const [loadingSection, setLoadingSection] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [activeContent, setActiveContent] = useState<Content | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // ─── Select content (navigate to learn page) ─────────────────────────────

  const handleSelectContent = useCallback((c: Content) => {
    setActiveContent(c);
    setSidebarOpen(false);
    const target = `${basePath}/learn?contentId=${c.id}`;
    if (!pathname.endsWith("/learn")) {
      router.push(target);
    } else {
      router.replace(target, { scroll: false });
    }
  }, [pathname, basePath, router]);

  // Refs for stabilizing callback dependencies
  const sectionContentsRef = useRef(sectionContents);
  const activeContentRef = useRef(activeContent);
  const handleSelectContentRef = useRef(handleSelectContent);

  useEffect(() => {
    sectionContentsRef.current = sectionContents;
    activeContentRef.current = activeContent;
    handleSelectContentRef.current = handleSelectContent;
  }, [sectionContents, activeContent, handleSelectContent]);

  // ─── Load section contents ────────────────────────────────────────────────

  const loadSectionContentsInner = useCallback(async (sectionId: number, autoSelect = false) => {
    if (sectionContentsRef.current[sectionId]) {
      if (autoSelect && !activeContentRef.current) {
        const first = sectionContentsRef.current[sectionId][0];
        if (first) handleSelectContentRef.current(first);
      }
      return;
    }
    setLoadingSection(prev => ({ ...prev, [sectionId]: true }));
    try {
      const res = await lmsService.listContent(sectionId);
      const items: Content[] = res?.data ?? [];
      setSectionContents(prev => ({ ...prev, [sectionId]: items }));
      if (autoSelect && !activeContentRef.current && items.length > 0) {
        handleSelectContentRef.current(items[0]);
      }
    } finally {
      setLoadingSection(prev => ({ ...prev, [sectionId]: false }));
    }
  }, []);

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

  // ─── Load course + sections ───────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const targetContentId = initialContentId.current;
        const [courseRes, sectionsRes, coTeachersRes, targetContentRes] = await Promise.all([
          lmsService.getCourse(id),
          lmsService.listSections(id),
          lmsService.getCoTeachers(id).catch(() => []),
          targetContentId
            ? lmsService.getContent(targetContentId).catch(() => null)
            : Promise.resolve(null),
        ]);
        setCourse(courseRes?.data ?? null);
        setCoTeachers(coTeachersRes ?? []);
        const secs: Section[] = sectionsRes?.data ?? [];
        setSections(secs);

        if (secs.length > 0) {
          const targetContent: Content | null = targetContentRes?.data ?? null;
          const targetSectionExists = targetContent && secs.some(
            section => section.id === targetContent.section_id
          );

          if (targetContent && targetSectionExists) {
            // A deep link used to fetch every section just to locate one item.
            // Fetch the item directly, then load only its section for sidebar
            // navigation. This keeps course size out of PDF startup latency.
            setActiveContent(targetContent);
            setExpanded(new Set([targetContent.section_id]));
            loadSectionContentsInner(targetContent.section_id);
          } else {
            setExpanded(new Set([secs[0].id]));
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

  // Memoized provider values
  const navigationValue = useMemo(() => ({
    course,
    sections,
    courseId: id,
    coTeachers,
    activeContent,
    setActiveContent: handleSelectContent,
    sectionContents,
    loadSectionContents,
    loadingSection,
  }), [course, sections, id, coTeachers, activeContent, handleSelectContent, sectionContents, loadSectionContents, loadingSection]);

  const progressValue = useMemo(() => ({
    completedIds,
    handleMarkComplete,
    markingComplete,
    progress,
    progressDetail,
    loadProgress,
  }), [completedIds, handleMarkComplete, markingComplete, progress, progressDetail, loadProgress]);

  const uiValue = useMemo(() => ({
    expanded,
    toggleSection,
    sidebarOpen,
    setSidebarOpen,
  }), [expanded, toggleSection, sidebarOpen]);

  if (loadingPage) {
    return <PageLoader message="Đang tải khóa học..." />;
  }

  return (
    <StudentCourseNavigationContext.Provider value={navigationValue}>
      <StudentCourseProgressContext.Provider value={progressValue}>
        <StudentCourseUiContext.Provider value={uiValue}>
          {children}
        </StudentCourseUiContext.Provider>
      </StudentCourseProgressContext.Provider>
    </StudentCourseNavigationContext.Provider>
  );
}
