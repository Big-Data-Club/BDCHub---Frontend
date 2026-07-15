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

// ─── Prev / Next Navigation ──────────────────────────────────────────
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
          className="flex items-center gap-4 p-4 text-left bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#12223a]/50 hover:border-blue-500/30 dark:hover:border-cyan-500/35 transition-all duration-300 group active:scale-[0.98] shadow-xs cursor-pointer w-full"
          onClick={() => onSelect(prev)}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#0D192E] border border-slate-200/50 dark:border-blue-500/10 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 group-hover:border-blue-500/30 dark:group-hover:text-cyan-400 dark:group-hover:border-cyan-400/30 transition-all duration-300 flex-shrink-0">
            <ArrowLeft className="w-4 h-4 transition-transform duration-355 group-hover:-translate-x-0.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bài học trước</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{prev.title}</p>
          </div>
        </button>
      ) : <div className="hidden sm:block" />}

      {next ? (
        <button
          className="flex items-center justify-between gap-4 p-4 text-right bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#12223a]/50 hover:border-blue-500/30 dark:hover:border-cyan-500/35 transition-all duration-300 group active:scale-[0.98] shadow-xs cursor-pointer w-full"
          onClick={() => onSelect(next)}
        >
          <div className="min-w-0 flex-1 text-left sm:text-right">
            <p className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">Bài kế tiếp</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{next.title}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-100 dark:border-cyan-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-cyan-500/20 group-hover:border-blue-500/35 dark:group-hover:border-cyan-400/40 transition-all duration-300">
            <ChevronRight className="w-4 h-4 transition-transform duration-355 group-hover:translate-x-0.5" />
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
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 flex items-center justify-center mb-8 border border-blue-500/20 dark:border-cyan-400/20 shadow-[0_0_30px_rgba(59,130,246,0.15)] dark:shadow-[0_0_40px_rgba(34,211,238,0.1)] group">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 flex items-center justify-center shadow-sm">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-cyan-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Chào mừng đến với khóa học
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
          {course?.description ?? "Chọn một bài học ở bên trái để bắt đầu học."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {sections.length > 0 && (
            <button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 cursor-pointer"
              onClick={() => toggleSection(sections[0].id)}
            >
              Bắt đầu học ngay
            </button>
          )}
          <button
            className="flex items-center gap-1.5 px-5 py-3 text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#0F1E35] dark:hover:bg-[#162644] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-blue-500/10 rounded-xl transition-all duration-200 active:scale-95 sm:hidden cursor-pointer"
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
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-6xl mx-auto space-y-6">
      {/* Unified Workspace Container */}
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-none space-y-6">
        {/* Top Header section */}
        <div className="border-b border-slate-100 dark:border-slate-400/8 pb-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <ContentTypeBadge type={activeContent.type} />
            {activeContent.is_mandatory && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                Bắt buộc học
              </span>
            )}
            {activeContent.is_mandatory && completedIds.has(activeContent.id) ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                ✓ Đã hoàn thành
              </span>
            ) : activeContent.is_mandatory ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#0D192E] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-blue-500/10">
                Chưa hoàn thành
              </span>
            ) : null}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight mb-2">
            {activeContent.title}
          </h2>
          {activeContent.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">{activeContent.description}</p>
          )}
        </div>

        {/* Content Viewer Body */}
        <div className="min-h-[300px]">
          <ContentViewer
            content={activeContent}
            userRole={isCourseTeacher ? "TEACHER" : "STUDENT"}
            isCompleted={completedIds.has(activeContent.id)}
            courseId={courseId}
            onComplete={() => handleMarkComplete(activeContent.id)}
          />
        </div>

        {/* Manual complete button (non-quiz mandatory, not yet done) */}
        {activeContent.is_mandatory &&
         !completedIds.has(activeContent.id) &&
         activeContent.type !== "QUIZ" && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-400/8">
            <div className="bg-amber-50/20 dark:bg-amber-950/5 border border-amber-200/40 dark:border-amber-500/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Xác nhận hoàn thành bài học
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                  Bài học này là bắt buộc. Hệ thống sẽ tự động ghi nhận sau khi bạn xem đủ thời gian, hoặc bạn có thể click xác nhận thủ công.
                </p>
              </div>
              <button
                onClick={() => handleMarkComplete(activeContent.id)}
                disabled={markingComplete}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-emerald-600/10 hover:shadow-emerald-600/20 flex-shrink-0"
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
