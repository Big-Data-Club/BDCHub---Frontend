"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ClipboardCheck, Layers, Loader2, X } from "lucide-react";
import analyticsService from "@/services/lms/analyticsService";
import { useContentStudy } from "@/hooks/lms/student/useContentStudy";
import { button, primary } from "../flashcards/styles";
import QuickCheck from "./QuickCheck";
import type { MicroLessonContext } from "./types";

interface QuickActionPanelProps {
  ctx: MicroLessonContext;
  completionExternal?: boolean;
  trackActivity?: boolean;
}

export function QuickActionPanel({ ctx, completionExternal, trackActivity = true }: QuickActionPanelProps) {
  const study = useContentStudy(ctx);
  const [quizOpen, setQuizOpen] = useState(false);
  useEffect(() => {
    if (!trackActivity) return;
    void analyticsService.trackMicroInteraction({ course_id: ctx.courseId, lesson_id: ctx.lessonId, node_id: ctx.nodeId ?? undefined, action_type: "lesson_view" });
    const timer = setTimeout(() => {
      void analyticsService.trackMicroInteraction({ course_id: ctx.courseId, lesson_id: ctx.lessonId, node_id: ctx.nodeId ?? undefined, action_type: "lesson_complete", payload: { reason: "auto_threshold_30s" } });
    }, 30_000);
    return () => clearTimeout(timer);
  }, [trackActivity, ctx.courseId, ctx.contentId, ctx.lessonId, ctx.nodeId]);
  useEffect(() => {
    if (!trackActivity || !completionExternal) return;
    void analyticsService.trackMicroInteraction({ course_id: ctx.courseId, lesson_id: ctx.lessonId, node_id: ctx.nodeId ?? undefined, action_type: "lesson_complete", payload: { reason: "external" } });
  }, [completionExternal, trackActivity, ctx.courseId, ctx.lessonId, ctx.nodeId]);
  const questions = study.result?.questions;
  return (
    <section aria-label="Ôn tập bài học" className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-blue-500/15 dark:bg-[#0F1E35]">
      <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4">
        <button type="button" className={primary} disabled={!!study.busy} onClick={() => { setQuizOpen(false); void study.generate("cards"); }}>
          {study.busy === "cards" ? <Loader2 size={17} className="animate-spin" /> : <Layers size={17} />}
          {study.busy === "cards" ? "Đang tạo thẻ…" : "Tạo flashcard"}
        </button>
        <button type="button" className={button} disabled={!!study.busy} onClick={() => { setQuizOpen(true); void study.generate("quiz"); }}>
          {study.busy === "quiz" ? <Loader2 size={17} className="animate-spin" /> : <ClipboardCheck size={17} />}
          {study.busy === "quiz" ? "Đang tạo quiz…" : "Tạo quiz"}
        </button>
        <Link href={`/lms/student/flashcards?courseId=${ctx.courseId}`} className="ml-auto rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300">Kho thẻ</Link>
      </div>
      <div aria-live="polite">
        {study.error && <p role="alert" className="px-4 pb-4 text-sm text-red-600 dark:text-red-400">{study.error}</p>}
        {study.result?.saved_count && <div className="flex flex-wrap items-center gap-2 px-4 pb-4 text-sm text-emerald-700 dark:text-emerald-400"><Check size={16} />Đã lưu {study.result.saved_count} thẻ.<Link className="font-semibold underline underline-offset-4" href={`/lms/student/flashcards?courseId=${ctx.courseId}&deckId=${study.result.deck_id}`}>Mở bộ thẻ</Link></div>}
      </div>
      {quizOpen && questions && !study.busy && (
        <div className="border-t border-slate-200 dark:border-blue-500/15">
          <div className="flex items-center justify-between px-5 pt-4"><h3 className="font-semibold text-slate-900 dark:text-slate-100">Quiz bài học</h3><button type="button" className={button} aria-label="Đóng quiz" onClick={() => setQuizOpen(false)}><X size={16} /></button></div>
          <QuickCheck key={questions.map(q => q.question_text).join("|")} ctx={{ ...ctx, nodeId: study.result?.node_ids.length === 1 ? study.result.node_ids[0] : ctx.nodeId }} questions={questions} onRegenerate={() => { void study.generate("quiz"); }} />
        </div>
      )}
    </section>
  );
}
export default QuickActionPanel;
