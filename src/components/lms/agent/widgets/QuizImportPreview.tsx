"use client";

/**
 * QuizImportPreview
 *
 * HITL (Human-In-The-Loop) widget for the Teacher Chatbot agent.
 * Rendered when the agent calls the `parse_quiz_questions` tool.
 *
 * Shows the AI-parsed questions, lets the teacher approve/reject each,
 * then batch-inserts the approved ones into the specified quiz.
 */
import { useState, useEffect } from "react";
import { Check, X, ChevronDown, ChevronUp, Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import quizService from "@/services/quizService";
import type { ParsedQuestion } from "@/services/aiService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizImportPreviewProps {
  props: {
    questions: ParsedQuestion[];
    quiz_id: number;
    course_id?: number;
  };
}

const QUESTION_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  SINGLE_CHOICE:       { label: "Trắc nghiệm 1 đáp án",    icon: "⭕" },
  MULTIPLE_CHOICE:     { label: "Trắc nghiệm nhiều đáp án", icon: "☑️" },
  SHORT_ANSWER:        { label: "Tự luận ngắn",             icon: "✍️" },
  ESSAY:               { label: "Tự luận dài",              icon: "📝" },
  FILE_UPLOAD:         { label: "Nộp file",                 icon: "📎" },
  FILL_BLANK_TEXT:     { label: "Điền từ (text)",           icon: "⬜" },
  FILL_BLANK_DROPDOWN: { label: "Điền từ (dropdown)",       icon: "🔽" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizImportPreview({ props }: QuizImportPreviewProps) {
  const { questions, quiz_id } = props;

  const [statuses, setStatuses] = useState<Record<number, "approved" | "rejected">>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Auto-approve all on mount
  useEffect(() => {
    const initial: Record<number, "approved"> = {};
    questions.forEach((_, i) => { initial[i] = "approved"; });
    setStatuses(initial);
  }, [questions]);

  const approvedCount = Object.values(statuses).filter(s => s === "approved").length;
  const approvedQuestions = questions.filter((_, i) => statuses[i] === "approved");

  const handleSave = async () => {
    if (!approvedQuestions.length) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      // Fetch current question count first to set order_index
      const currentData = await quizService.listQuestions(quiz_id);
      const currentCount = (currentData.data || []).length;

      const questionsData = approvedQuestions.map((q, i) => ({
        question_type:   q.question_type,
        question_text:   q.question_text,
        points:          q.points,
        order_index:     currentCount + i + 1,
        explanation:     q.explanation || "",
        is_required:     q.is_required ?? true,
        answer_options:  q.answer_options,
        correct_answers: q.correct_answers,
        settings:        q.settings,
      }));

      await quizService.createQuestionsBatch(quiz_id, questionsData);
      setSavedCount(approvedQuestions.length);
      setSuccess(true);
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || err.message || "Lỗi khi lưu câu hỏi.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="p-6 rounded-2xl bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="w-7 h-7 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Đã thêm {savedCount} câu hỏi vào Quiz #{quiz_id}!
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Vào trang quản lý quiz để xem và chỉnh sửa câu hỏi vừa nhập.
        </p>
        <a
          href={`/lms/teacher/quiz/${quiz_id}/manage`}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Xem quiz #{quiz_id} →
        </a>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duyệt câu hỏi</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
            {approvedCount}/{questions.length}
          </span>
        </div>
        <button
          onClick={() => {
            const all: Record<number, "approved"> = {};
            questions.forEach((_, i) => { all[i] = "approved"; });
            setStatuses(all);
          }}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Duyệt tất cả
        </button>
      </div>

      {/* Question list */}
      {questions.map((q, i) => {
        const status = statuses[i] || "approved";
        const isExpanded = expanded === i;
        const typeInfo = QUESTION_TYPE_LABELS[q.question_type] || { label: q.question_type, icon: "❓" };

        return (
          <div
            key={i}
            className={cn(
              "rounded-2xl border p-4 transition-all duration-200",
              status === "approved"
                ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10"
                : "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10 opacity-50",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                  <span className="text-[10px] text-slate-400">{q.points} điểm</span>
                </div>
                {/* Question text */}
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {q.question_text}
                </p>
              </div>

              {/* Approve / Reject buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setStatuses(s => ({ ...s, [i]: "approved" }))}
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90",
                    status === "approved"
                      ? "bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30",
                  )}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStatuses(s => ({ ...s, [i]: "rejected" }))}
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90",
                    status === "rejected"
                      ? "bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30",
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expand toggle */}
            {(q.answer_options.length > 0 || q.correct_answers.length > 0) && (
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="mt-2 text-[11px] font-semibold text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1.5"
              >
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {isExpanded ? "ẨN ĐÁP ÁN" : "XEM ĐÁP ÁN"}
              </button>
            )}

            {/* Expanded content */}
            {isExpanded && (
              <div className="mt-3 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 animate-in slide-in-from-top-1 duration-200">
                {q.answer_options.map((opt, oi) => (
                  <div
                    key={oi}
                    className={cn(
                      "flex items-start gap-2 px-3 py-2 rounded-xl text-sm",
                      opt.is_correct
                        ? "bg-green-500/10 text-green-700 dark:text-green-300 font-medium border border-green-200/50 dark:border-green-800/30"
                        : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400",
                    )}
                  >
                    <span className="flex-shrink-0 w-5 text-center">{String.fromCharCode(65 + oi)}.</span>
                    <span className="flex-1">{opt.option_text}</span>
                    {opt.is_correct && <Check className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />}
                  </div>
                ))}
                {q.correct_answers.map((ans, ai) => (
                  <div
                    key={ai}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-800/30"
                  >
                    <span className="font-bold text-xs">BLANK_{ans.blank_id ?? ai + 1}:</span>
                    <span>{ans.answer_text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Error */}
      {saveError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{saveError}</p>
        </div>
      )}

      {/* Save button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={approvedCount === 0 || isSaving}
          className={cn(
            "w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]",
            approvedCount === 0 || isSaving
              ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none",
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>✅ Thêm {approvedCount} câu hỏi vào Quiz #{quiz_id}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
