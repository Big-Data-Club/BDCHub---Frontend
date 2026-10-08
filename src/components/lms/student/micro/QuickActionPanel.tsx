"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import analyticsService from "@/services/lms/analyticsService";
import Link from "next/link";
import QuickCheck from "./QuickCheck";
import AskAIDrawer from "./AskAIDrawer";
import type { MicroLessonContext, QuickActionTab } from "./types";

interface QuickActionPanelProps {
  ctx: MicroLessonContext;
  /**
   * Optional override - set true after the parent decides the student
   * has finished reading (scrolled to bottom, clicked "Mark complete",
   * etc). Defaults to firing automatically after 30s.
   */
  completionExternal?: boolean;
}

const COMPLETION_THRESHOLD_MS = 30_000;

export function QuickActionPanel({
  ctx,
  completionExternal,
}: QuickActionPanelProps) {
  const [tab, setTab] = useState<QuickActionTab>(null);
  const [askOpen, setAskOpen] = useState(false);

  const lang = ctx.language ?? "vi";

  const labels = useMemo(
    () => ({
      header:
        lang === "vi"
          ? "Hành động nhanh"
          : "Quick Actions",
      flashcards: lang === "vi" ? "Thẻ ghi nhớ" : "Flashcards",
      quickCheck: lang === "vi" ? "Kiểm tra nhanh" : "Quick Check",
      askAI: lang === "vi" ? "Hỏi AI" : "Ask AI",
      quickCheckDesc:
        lang === "vi"
          ? "Trả lời 1–2 câu trắc nghiệm ngắn."
          : "Answer 1–2 short multiple-choice questions.",
      askAIDesc:
        lang === "vi"
          ? "Trao đổi với AI về bài học này."
          : "Chat with AI about this lesson.",
    }),
    [lang],
  );

  /** Fire `lesson_view` once per mount + a delayed `lesson_complete`. */
  useEffect(() => {
    analyticsService.trackMicroInteraction({
      course_id: ctx.courseId,
      lesson_id: ctx.lessonId,
      node_id: ctx.nodeId ?? undefined,
      action_type: "lesson_view",
    });

    const t = setTimeout(() => {
      analyticsService.trackMicroInteraction({
        course_id: ctx.courseId,
        lesson_id: ctx.lessonId,
        node_id: ctx.nodeId ?? undefined,
        action_type: "lesson_complete",
        payload: { reason: "auto_threshold_30s" },
      });
    }, COMPLETION_THRESHOLD_MS);

    return () => clearTimeout(t);
    // ctx fields are stable for the life of one MicroLessonViewer mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.lessonId]);

  /** External completion override (e.g. parent clicked "Mark complete"). */
  useEffect(() => {
    if (!completionExternal) return;
    analyticsService.trackMicroInteraction({
      course_id: ctx.courseId,
      lesson_id: ctx.lessonId,
      node_id: ctx.nodeId ?? undefined,
      action_type: "lesson_complete",
      payload: { reason: "external" },
    });
  }, [completionExternal, ctx.courseId, ctx.lessonId, ctx.nodeId]);

  const openTab = useCallback(
    (next: Exclude<QuickActionTab, null>) => {
      if (next === "ask_ai") {
        setAskOpen(true);
        return;
      }
      setTab((current) => (current === next ? null : next));
    },
    [],
  );

  return (
    <section
      aria-label={labels.header}
      className="border border-slate-200 dark:border-blue-500/10 bg-white dark:bg-[#0F1E35] rounded-2xl mt-6 overflow-hidden shadow-sm"
    >
      <header className="px-6 py-3 border-b border-slate-200 dark:border-blue-500/10 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {labels.header}
        </h3>
        {tab && (
          <button
            type="button"
            onClick={() => setTab(null)}
            className="text-xs font-medium text-slate-700 dark:text-slate-300 underline underline-offset-2"
          >
            {lang === "vi" ? "Đóng" : "Close"}
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-blue-500/10">
        <Link href={`/lms/student/flashcards?courseId=${ctx.courseId}`} className="px-6 py-4 text-sm font-semibold text-slate-900 transition active:scale-95 dark:text-slate-50">{labels.flashcards}</Link>
        <ActionButton
          active={tab === "quick_check"}
          label={labels.quickCheck}
          desc={labels.quickCheckDesc}
          onClick={() => openTab("quick_check")}
        />
        <ActionButton
          active={askOpen}
          label={labels.askAI}
          desc={labels.askAIDesc}
          onClick={() => openTab("ask_ai")}
        />
      </div>

      {tab === "quick_check" && (
        <div className="border-t border-slate-200 dark:border-blue-500/10">
          <QuickCheck ctx={ctx} />
        </div>
      )}

      <AskAIDrawer
        ctx={ctx}
        open={askOpen}
        onClose={() => setAskOpen(false)}
      />
    </section>
  );
}

interface ActionButtonProps {
  active: boolean;
  label: string;
  desc: string;
  onClick: () => void;
}

function ActionButton({ active, label, desc, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left px-6 py-4 transition-colors focus:outline-none focus:bg-slate-50 dark:focus:bg-[#0D192E] ${
        active ? "bg-slate-100 dark:bg-[#0D192E]" : "bg-white dark:bg-[#0F1E35] hover:bg-slate-50 dark:hover:bg-[#0D192E]/50"
      }`}
    >
      <span className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
        {label}
      </span>
      <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</span>
    </button>
  );
}

export default QuickActionPanel;
