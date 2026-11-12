"use client";
import { CheckCircle2, Circle, Clock3, XCircle } from "lucide-react";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { LoadingState } from "@/components/common/LoadingState";
import type {
  QuizResultAnswer,
  QuizResultAttempt,
  QuizResultQuestion,
} from "@/types/lms/quizResults";

function answerText(
  answer: QuizResultAnswer,
  question: QuizResultQuestion,
): string {
  const data = answer.answer_data;
  const optionText = (id: unknown) =>
    question.answer_options.find((o) => o.id === Number(id))?.option_text ??
    `Lựa chọn #${String(id)}`;
  if (data.selected_option_id != null)
    return optionText(data.selected_option_id);
  if (Array.isArray(data.selected_option_ids))
    return data.selected_option_ids.map(optionText).join("\n\n");
  if (Array.isArray(data.blanks))
    return data.blanks
      .map((blank, i) => {
        const value = blank as Record<string, unknown>;
        return `Ô ${String(value.blank_id ?? i + 1)}: ${value.selected_option_id != null ? optionText(value.selected_option_id) : String(value.answer ?? value.answer_text ?? "Chưa điền")}`;
      })
      .join("\n\n");
  return String(
    data.answer_text ??
      data.text ??
      data.file_name ??
      "Chưa có nội dung trả lời",
  );
}

interface QuizAttemptDetailsProps {
  attempt: QuizResultAttempt;
  questions: QuizResultQuestion[];
  answers: QuizResultAnswer[] | null;
  error?: boolean;
}
export function QuizAttemptDetails({
  attempt,
  questions,
  answers,
  error,
}: QuizAttemptDetailsProps) {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-blue-500/10 dark:bg-[#0F1E35]"
      aria-live="polite"
    >
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-widest text-blue-700 dark:text-cyan-400">
          Chi tiết bài làm
        </p>
        <h2 className="mt-2 text-lg font-semibold">
          {attempt.student_name || `Thí sinh #${attempt.student_id}`}{" "}
          <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
            · Lượt {attempt.attempt_number}
          </span>
        </h2>
      </div>
      {error ? (
        <p role="alert">
          Không tải được bài làm. Hãy bấm Xem chi tiết để thử lại.
        </p>
      ) : !answers ? (
        <LoadingState message="Đang tải câu trả lời..." />
      ) : (
        questions.map((q, i) => {
          const answer = answers.find((a) => a.question_id === q.id);
          const label = !answer
            ? "Bỏ trống"
            : answer.points_earned == null
              ? "Chờ chấm"
              : answer.is_correct == null
                ? "Đã chấm"
                : answer.is_correct
                  ? "Đúng"
                  : "Sai";
          const Icon = !answer
            ? Circle
            : answer.points_earned == null
              ? Clock3
              : answer.is_correct === false
                ? XCircle
                : CheckCircle2;
          return (
            <article
              className="mt-4 border-t border-slate-200 pt-5 dark:border-blue-500/10"
              key={q.id}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium">Câu {i + 1}</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-[#132240] dark:text-slate-200">
                    <Icon size={14} />
                    {label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {answer?.points_earned ?? "—"} / {q.points}
                  </span>
                </div>
              </div>
              <MarkdownRenderer content={q.question_text} />
              <div className="mt-3 rounded-xl bg-slate-50 p-4 dark:bg-[#0D192E]">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Câu trả lời
                </p>
                <MarkdownRenderer
                  content={answer ? answerText(answer, q) : "Chưa trả lời"}
                />
              </div>
              {q.answer_options.some((o) => o.is_correct) && (
                <div className="mt-3 text-sm">
                  <span className="font-medium text-green-700 dark:text-green-400">
                    Đáp án đúng:{" "}
                  </span>
                  {q.answer_options
                    .filter((o) => o.is_correct)
                    .map((o) => o.option_text)
                    .join(" · ")}
                </div>
              )}
              {q.correct_answers.length > 0 && (
                <p className="mt-3 text-sm">
                  Đáp án chấp nhận:{" "}
                  {q.correct_answers
                    .map((a) => a.answer_text)
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {answer?.grader_feedback && (
                <p className="mt-3 text-sm">
                  <span className="font-medium">Nhận xét: </span>
                  {answer.grader_feedback}
                </p>
              )}
            </article>
          );
        })
      )}
    </section>
  );
}
