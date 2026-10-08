"use client";

import { useCallback, useMemo, useState } from "react";
import {
  type ConceptCheckQuestion,
} from "@/services/ai/aiService";
import analyticsService from "@/services/lms/analyticsService";
import personalizedLearningTracker from "@/lib/personalized-learning-tracker";
import type { MicroLessonContext } from "./types";

interface QuickCheckProps {
  ctx: MicroLessonContext;
  questions: ConceptCheckQuestion[];
  onRegenerate: () => void;
}

interface QuestionState {
  selectedIdx: number | null;
  submitted: boolean;
}

export function QuickCheck({ ctx, questions, onRegenerate }: QuickCheckProps) {
  const [state, setState] = useState<QuestionState[]>(() => questions.map(() => ({ selectedIdx: null, submitted: false })));

  const lang = ctx.language ?? "vi";

  const labels = useMemo(
    () => ({
      loading:
        lang === "vi"
          ? "Đang tạo câu hỏi nhanh…"
          : "Generating quick check…",
      empty:
        lang === "vi"
          ? "Không tạo được câu hỏi cho bài học này."
          : "No quick check available for this lesson.",
      submit: lang === "vi" ? "Kiểm tra" : "Check",
      correct: lang === "vi" ? "Chính xác." : "Correct.",
      incorrect: lang === "vi" ? "Chưa đúng." : "Not quite.",
      regenerate: lang === "vi" ? "Tạo bộ câu mới" : "Regenerate",
    }),
    [lang],
  );

  const onSubmit = useCallback(
    (qIdx: number) => {
      const q = questions[qIdx];
      const s = state[qIdx];
      if (!q || !s || s.selectedIdx == null || s.submitted) return;

      const isCorrect = q.answer_options[s.selectedIdx]?.is_correct === true;
      const score = isCorrect ? 1 : 0;

      // Mark this question as submitted.
      setState((prev) =>
        prev.map((row, i) => (i === qIdx ? { ...row, submitted: true } : row)),
      );

      // Two events: aggregate score + correctness flag. The heatmap
      // worker blends them into the mini-quiz component.
      analyticsService.trackMicroInteraction({
        course_id: ctx.courseId,
        lesson_id: ctx.lessonId,
        node_id: ctx.nodeId ?? undefined,
        action_type: "quick_check_attempt",
        score,
        status: isCorrect ? "correct" : "incorrect",
      });
      analyticsService.trackMicroInteraction({
        course_id: ctx.courseId,
        lesson_id: ctx.lessonId,
        node_id: ctx.nodeId ?? undefined,
        action_type: isCorrect ? "quick_check_correct" : "quick_check_incorrect",
      });

      // Feed the personalized learning engine. AI-generated questions have no
      // DB question_id, so mastery inference is skipped for now; the event
      // still powers the trajectory/daily-activity views.
      personalizedLearningTracker.trackAnswerSubmitted({
        courseId: ctx.courseId,
        correct: isCorrect,
        metadata: {
          source: "quick_check",
          node_id: ctx.nodeId ?? null,
          lesson_id: ctx.lessonId ?? null,
        },
      });
    }, [ctx.courseId, ctx.lessonId, ctx.nodeId, questions, state]);

  if (questions.length === 0) {
    return (
      <div className="px-6 py-10 text-sm text-slate-500 dark:text-slate-400 text-center">
        {labels.empty}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-6 py-5">
      {questions.map((q, qIdx) => {
        const s = state[qIdx];
        return (
          <div
            key={qIdx}
            className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-50">
              {q.question_text}
            </div>
            <div className="flex flex-col">
              {q.answer_options.map((opt, oIdx) => {
                const selected = s?.selectedIdx === oIdx;
                const correct = s?.submitted && opt.is_correct;
                const wrong = s?.submitted && selected && !opt.is_correct;
                const base =
                  "text-left text-sm px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 transition-colors";
                const stateCls = correct
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300"
                  : wrong
                    ? "bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300"
                    : selected
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50";
                return (
                  <button
                    type="button"
                    key={oIdx}
                    disabled={s?.submitted}
                    onClick={() =>
                      setState((prev) =>
                        prev.map((row, i) =>
                          i === qIdx ? { ...row, selectedIdx: oIdx } : row,
                        ),
                      )
                    }
                    className={`${base} ${stateCls} disabled:cursor-default`}
                  >
                    <span className="inline-block w-5 text-slate-400 dark:text-slate-500 mr-1">
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    {opt.text}
                    {s?.submitted && opt.explanation && (correct || wrong) && (
                      <span className="block mt-1 text-xs text-slate-600 dark:text-slate-400">
                        {opt.explanation}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {s?.submitted
                  ? q.answer_options[s.selectedIdx ?? -1]?.is_correct
                    ? labels.correct
                    : labels.incorrect
                  : ""}
              </span>
              <button
                type="button"
                disabled={!s || s.selectedIdx == null || s.submitted}
                onClick={() => onSubmit(qIdx)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-900 dark:border-slate-200 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm disabled:bg-slate-400 disabled:border-slate-400 dark:disabled:bg-slate-700 dark:disabled:border-slate-700 dark:disabled:text-slate-500"
              >
                {labels.submit}
              </button>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={onRegenerate}
          className="text-xs font-medium text-slate-700 dark:text-slate-300 underline underline-offset-2"
        >
          {labels.regenerate}
        </button>

      </div>
    </div>
  );
}

export default QuickCheck;
