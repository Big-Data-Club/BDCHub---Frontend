import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import type { Question } from "@/hooks/lms/student/useQuizTaking";

interface QuizQuestionNavProps {
  questions: Question[];
  currentQuestion: number;
  answers: { [key: number]: any };
  onSelectQuestion: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenReviewModal: () => void;
  submitting: boolean;
  flagged?: number[];
  onToggleFlag?: (id: number) => void;
}

export function QuizQuestionNav({
  questions,
  currentQuestion,
  answers,
  onSelectQuestion,
  onPrev,
  onNext,
  onOpenReviewModal,
  submitting,
  flagged = [],
  onToggleFlag,
}: QuizQuestionNavProps) {
  const isQuestionAnswered = (question: Question) => {
    const answer = answers[question.id];
    if (!answer) return false;

    if (question.question_type === "FILE_UPLOAD") {
      return !!answer.file_name;
    }
    if (question.question_type === "FILL_BLANK_TEXT" || question.question_type === "FILL_BLANK_DROPDOWN") {
      return answer.blanks && answer.blanks.length > 0 && answer.blanks.every((b: any) => b !== null && b !== undefined && b !== "");
    }
    if (question.question_type === "MULTIPLE_CHOICE") {
      return answer.selected_option_ids && answer.selected_option_ids.length > 0;
    }
    if (question.question_type === "SINGLE_CHOICE") {
      return answer.selected_option_id !== undefined && answer.selected_option_id !== null;
    }
    if (question.question_type === "SHORT_ANSWER" || question.question_type === "ESSAY") {
      return answer.answer_text !== undefined && answer.answer_text !== null && answer.answer_text.trim() !== "";
    }
    return true;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 text-sm text-slate-700 dark:text-slate-200">
        <button type="button" disabled={!questions[currentQuestion]} aria-pressed={flagged.includes(questions[currentQuestion]?.id)} onClick={() => onToggleFlag?.(questions[currentQuestion].id)}>
          ⚑ {flagged.includes(questions[currentQuestion]?.id) ? "Bỏ đánh dấu" : "Đánh dấu xem lại"}
        </button>
        <button type="button" onClick={() => { const i = questions.findIndex((q, i) => i > currentQuestion && !isQuestionAnswered(q)); const next = i < 0 ? questions.findIndex(q => !isQuestionAnswered(q)) : i; if (next >= 0) onSelectQuestion(next); }}>Câu chưa làm ({questions.length - answeredCount})</button>
        <button type="button" onClick={() => { const i = questions.findIndex((q, i) => i > currentQuestion && flagged.includes(q.id)); const next = i < 0 ? questions.findIndex(q => flagged.includes(q.id)) : i; if (next >= 0) onSelectQuestion(next); }}>Câu đánh dấu ({flagged.length})</button>
      </div>
      {/* Prev / Next controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onPrev}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-blue-500/10 bg-white dark:bg-[#0F1E35] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#162644] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span>Câu tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onOpenReviewModal}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Nộp bài</span>
          </button>
        )}
      </div>

      {/* Question palette / grid drawer */}
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Danh sách câu hỏi
          </h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Đã làm {answeredCount}/{questions.length}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {questions.map((q, idx) => {
            const answered = isQuestionAnswered(q);
            const isCurrent = idx === currentQuestion;

            return (
              <button
                key={q.id}
                aria-label={`Câu ${idx + 1}, ${answered ? "đã làm" : "chưa làm"}${flagged.includes(q.id) ? ", đánh dấu xem lại" : ""}`}
                onClick={() => onSelectQuestion(idx)}
                className={`h-10 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center relative ${
                  isCurrent
                    ? "ring-2 ring-blue-500 dark:ring-cyan-400 bg-blue-600 text-white shadow-md"
                    : answered
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                    : "bg-slate-100 dark:bg-[#0D192E] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-blue-500/10 hover:bg-slate-200 dark:hover:bg-[#162644]"
                }`}
              >
                <span>{idx + 1}{flagged.includes(q.id) ? " ⚑" : ""}</span>
                {q.is_required && (
                  <span className="absolute top-0.5 right-1 text-xs text-red-500 font-black">*</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-blue-500/10">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-600" />
            <span>Đang xem</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30" />
            <span>Đã làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-[#0D192E] border border-slate-200 dark:border-blue-500/10" />
            <span>Chưa làm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
