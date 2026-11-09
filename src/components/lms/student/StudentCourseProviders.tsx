"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter, usePathname, useSearchParams } from "@/lib/tenant/navigation";

import lmsService from "@/services/lms/lmsService";
import progressService, { CourseProgress, ProgressDetailItem } from "@/services/lms/progressService";
import { useSetPageContext } from "@/hooks/common/usePageContext";
import { Content, Course, Section } from "@/types";
import { PageLoader } from "@/components/lms/shared";
import { AlertCircle } from "lucide-react";

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
  const noticeRevision = searchParams.get("notice") || "";
  const id = Number(courseId);

  const initialContentId = useRef<number | null>(
    searchParams.get("contentId") ? Number(searchParams.get("contentId")) : null
  );
  const initialSectionId = useRef(Number(searchParams.get("sectionId")) || null);
  const basePath = `/lms/student/courses/${id}`;

  // ── Core state ──
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [coTeachers, setCoTeachers] = useState<any[]>([]);
  
  const [sectionContents, setSectionContents] = useState<Record<number, Content[]>>({});
  const [loadingSection, setLoadingSection] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [activeContent, setActiveContent] = useState<Content | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [courseArchived, setCourseArchived] = useState(false);
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
    const target = `${basePath}/learn?contentId=${c.id}${noticeRevision ? `&notice=${encodeURIComponent(noticeRevision)}` : ""}`;
    if (!pathname.endsWith("/learn")) {
      router.push(target);
    } else {
      router.replace(target, { scroll: false });
    }
  }, [pathname, basePath, router, noticeRevision]);

  // Refs for stabilizing callback dependencies
  const contentLoadGeneration = useRef(0);
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
    const generation = contentLoadGeneration.current;
    if (sectionContentsRef.current[sectionId]) {
      if (autoSelect && activeContentRef.current?.section_id !== sectionId) {
        const first = sectionContentsRef.current[sectionId][0];
        if (first) handleSelectContentRef.current(first);
      }
      return;
    }
    setLoadingSection(prev => ({ ...prev, [sectionId]: true }));
    try {
      const res = await lmsService.listContent(sectionId);
      if (generation !== contentLoadGeneration.current) return;
      const items: Content[] = res?.data ?? [];
      setSectionContents(prev => ({ ...prev, [sectionId]: items }));
      if (autoSelect && activeContentRef.current?.section_id !== sectionId && items.length > 0) {
        handleSelectContentRef.current(items[0]);
      }
    } finally {
      if (generation === contentLoadGeneration.current) setLoadingSection(prev => ({ ...prev, [sectionId]: false }));
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
    let cancelled = false;
    contentLoadGeneration.current += 1;
    setLoadingPage(true); setCourseArchived(false); setLoadingSection({}); setExpanded(new Set());
    setActiveContent(null); activeContentRef.current = null;
    setSectionContents({}); sectionContentsRef.current = {};
    (async () => {
      try {
        const targetContentId = noticeRevision ? Number(searchParams.get("contentId")) || null : initialContentId.current;
        const targetSectionId = noticeRevision ? Number(searchParams.get("sectionId")) || null : initialSectionId.current;
        // Check course availability before requesting dependent resources. When
        // an archived course rejects, Promise.all used to race with sections
        // and could redirect before the archive message was rendered.
        const courseRes = await lmsService.getCourse(id);
        if (cancelled) return;
        const [sectionsRes, coTeachersRes, targetContentRes] = await Promise.all([
          lmsService.listSections(id),
          lmsService.getCoTeachers(id).catch(() => []),
          targetContentId
            ? lmsService.getContent(targetContentId).catch(() => null)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
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
            const targetSection = secs.find(section => section.id === targetSectionId) || secs[0];
            setExpanded(new Set([targetSection.id]));
            loadSectionContentsInner(targetSection.id, true);
          }
        }

        await loadProgress();
      } catch (error: any) {
        if (cancelled) return;
        if (error?.response?.data?.error === "course_archived") {
          setCourseArchived(true);
          return;
        }
        router.back();
      } finally {
        if (!cancelled) setLoadingPage(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, noticeRevision]); // eslint-disable-line

  // ── Push page context for AI sidebar ───────────────────────────────────────

  // The provider survives same-course navigation; consume new deep links too.
  const linkedContentId = Number(searchParams.get("contentId")) || null;
  const linkedSectionId = Number(searchParams.get("sectionId")) || null;
  useEffect(() => {
    if (loadingPage || courseArchived) return;
    let cancelled = false;
    if (linkedContentId && linkedContentId !== activeContentRef.current?.id) {
      void lmsService.getContent(linkedContentId).then(response => {
        const target: Content | null = response?.data ?? null;
        if (cancelled || !target || !sections.some(section => section.id === target.section_id)) return;
        setActiveContent(target);
        setExpanded(prev => new Set([...prev, target.section_id]));
        void loadSectionContentsInner(target.section_id);
      }).catch(() => undefined);
    } else if (!linkedContentId && linkedSectionId && sections.some(section => section.id === linkedSectionId)) {
      setExpanded(prev => new Set([...prev, linkedSectionId]));
      void loadSectionContentsInner(linkedSectionId, true);
    }
    return () => { cancelled = true; };
  }, [linkedContentId, linkedSectionId, sections, loadingPage, courseArchived, loadSectionContentsInner]);

  const { setPageContext, clearPageContext } = useSetPageContext();

  useEffect(() => {
    if (!course) return;
    setPageContext({
      pageType: activeContent ? "lesson" : "course_detail",
      courseId: id,
      courseName: course.title,
      contentId: activeContent?.id,
      contentTitle: activeContent?.title,
      contentType: activeContent?.type,
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

  if (courseArchived) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#050B18]">
        <section className="max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-600 dark:text-amber-400" />
          <h1 className="mt-4 text-lg font-bold text-amber-950 dark:text-amber-100">Khóa học tạm thời không khả dụng</h1>
          <p className="mt-2 text-sm text-amber-900 dark:text-amber-200">Khóa học tạm thời bị vô hiệu hóa để xem xét lại nội dung vi phạm.</p>
        </section>
      </main>
    );
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
