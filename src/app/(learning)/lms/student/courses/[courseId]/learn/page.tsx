"use client";

/**
 * Student Course - Learn Page
 * Route: /lms/student/courses/[courseId]/learn
 *
 * Displays the content viewer with prev/next navigation.
 * Consumes StudentCourseContext from the parent layout.
 *
 * ContentViewer (~30KB) is lazy-loaded since it's only rendered
 * when a content item is selected.
 */

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import lmsService from "@/services/lmsService";
import dynamic from "next/dynamic";
import {
  ArrowLeft, ChevronRight, BookOpen, BarChart3,
} from "lucide-react";

// Lazy-load the heavy content viewer
const ContentViewer = dynamic(
  () => import("@/components/lms/student/ContentViewer"),
  { ssr: false, loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" /> },
);

import { Badge, ContentTypeBadge } from "@/components/lms/shared";
import { useStudentCourse } from "@/components/lms/student/StudentCourseContext";
import { Content, Section } from "@/types";

// ─── Prev / Next Navigation ─────────────────────────────────────────────────

function PrevNextButtons({
  sections, sectionContents, activeContent, onSelect,
}: {
  sections: Section[];
  sectionContents: Record<number, Content[]>;
  activeContent: Content;
  onSelect: (c: Content) => void;
}) {
  const flat = sections.flatMap(s => sectionContents[s.id] ?? []);
  const idx  = flat.findIndex(c => c.id === activeContent.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <>
      {prev ? (
        <button
          className="flex items-center gap-4 p-4 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-500/50 transition-all duration-200 group active:scale-[0.98] shadow-xs cursor-pointer w-full"
          onClick={() => onSelect(prev)}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bài học trước</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">{prev.title}</p>
          </div>
        </button>
      ) : <div className="hidden sm:block" />}

      {next ? (
        <button
          className="flex items-center justify-between gap-4 p-4 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-500/50 transition-all duration-200 group active:scale-[0.98] shadow-xs cursor-pointer w-full"
          onClick={() => onSelect(next)}
        >
          <div className="min-w-0 flex-1 text-left sm:text-right">
            <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Bài kế tiếp</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">{next.title}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </button>
      ) : <div className="hidden sm:block" />}
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();

  const {
    course, sections, sectionContents,
    activeContent, setActiveContent,
    completedIds, handleMarkComplete, markingComplete,
    toggleSection,
    coTeachers,
  } = useStudentCourse();

  const { data: session } = useSession();
  const userId = session?.user ? Number((session.user as any).id || (session.user as any).userId) : undefined;
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    lmsService.getMyRoles().then(roles => setUserRoles(roles || [])).catch(() => {});
  }, []);

  const isCourseTeacher = useMemo(() => {
    if (!userId || !course) return false;
    const isCreator = course.created_by === userId;
    const isCo = coTeachers?.some((ct: any) => ct.user_id === userId);
    const isAdmin = userRoles.includes("ADMIN");
    return isCreator || isCo || isAdmin;
  }, [userId, course, coTeachers, userRoles]);

  // Timer ref for auto-complete
  const autoCompleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-complete non-quiz mandatory content after 3s ──
  useEffect(() => {
    if (
      activeContent &&
      activeContent.is_mandatory &&
      !completedIds.has(activeContent.id) &&
      activeContent.type !== "QUIZ"
    ) {
      autoCompleteTimer.current = setTimeout(() => {
        handleMarkComplete(activeContent.id);
      }, 3000);
    }
    return () => {
      if (autoCompleteTimer.current) clearTimeout(autoCompleteTimer.current);
    };
  }, [activeContent?.id]); // eslint-disable-line

  // ── Handle content selection (clear timer) ──
  const handleSelect = useCallback((c: Content) => {
    if (autoCompleteTimer.current) clearTimeout(autoCompleteTimer.current);
    setActiveContent(c);
  }, [setActiveContent]);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!activeContent) {
    return (
      /* Welcome screen */
      <div className="flex flex-col items-center justify-center h-full py-24 text-center px-8">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Chào mừng đến với khóa học
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-6">
          {course?.description ?? "Chọn một bài học ở bên trái để bắt đầu học."}
        </p>
        <div className="flex items-center gap-3">
          {sections.length > 0 && (
            <button
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 cursor-pointer"
              onClick={() => toggleSection(sections[0].id)}
            >
              Bắt đầu học ngay
            </button>
          )}
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all sm:hidden cursor-pointer"
            onClick={() => router.push(`/lms/student/courses/${courseId}/stats`)}
          >
            <BarChart3 className="w-4 h-4" />
            Xem thống kê
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl space-y-6 mx-auto">
      {/* Header Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <ContentTypeBadge type={activeContent.type} />
          {activeContent.is_mandatory && (
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Bắt buộc học
            </span>
          )}
          {activeContent.is_mandatory && completedIds.has(activeContent.id) ? (
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 px-2.5 py-1 rounded-full flex items-center gap-1">
              ✓ Đã hoàn thành
            </span>
          ) : activeContent.is_mandatory ? (
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-full">
              Chưa hoàn thành
            </span>
          ) : null}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight mb-2">
          {activeContent.title}
        </h2>
        {activeContent.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{activeContent.description}</p>
        )}
      </div>

      {/* Main Viewer Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <ContentViewer
          content={activeContent}
          userRole={isCourseTeacher ? "TEACHER" : "STUDENT"}
          isCompleted={completedIds.has(activeContent.id)}
          courseId={courseId}
          onComplete={() => handleMarkComplete(activeContent.id)}
        />

        {/* Manual complete button (non-quiz mandatory, not yet done) */}
        {activeContent.is_mandatory &&
         !completedIds.has(activeContent.id) &&
         activeContent.type !== "QUIZ" && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/30 dark:border-amber-900/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Xác nhận hoàn thành bài học
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  Bài học này là bắt buộc. Hệ thống sẽ tự động ghi nhận sau khi bạn xem đủ thời gian, hoặc bạn có thể click xác nhận thủ công.
                </p>
              </div>
              <button
                onClick={() => handleMarkComplete(activeContent.id)}
                disabled={markingComplete}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-sm flex-shrink-0"
              >
                {markingComplete ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Hoàn thành bài học
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Prev / Next navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PrevNextButtons
          sections={sections}
          sectionContents={sectionContents}
          activeContent={activeContent}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
