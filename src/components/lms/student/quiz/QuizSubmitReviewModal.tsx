import { Button } from "@/components/ui/button";
import type { Question } from "@/hooks/lms/student/useQuizTaking";

interface QuizSubmitReviewModalProps {
  open: boolean;
  questions: Question[];
  serverAnswers: { [key: number]: any };
  fetchingServerAnswers: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function QuizSubmitReviewModal({
  open,
  questions,
  serverAnswers,
  fetchingServerAnswers,
  submitting,
  onClose,
  onSubmit,
}: QuizSubmitReviewModalProps) {
  if (!open) return null;

  const isQuestionAnsweredInServer = (question: Question, svAnswers: { [key: number]: any }) => {
    const answer = svAnswers[question.id];
    if (!answer) return false;
    if (question.question_type === "FILE_UPLOAD") return !!answer.file_name;
    if (question.question_type === "FILL_BLANK_TEXT" || question.question_type === "FILL_BLANK_DROPDOWN") {
      return answer.blanks && answer.blanks.length > 0 && answer.blanks.some((b: any) => b !== null && b !== undefined && b !== "");
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

  const getRecordedAnswerText = (question: Question, svAnswers: { [key: number]: any }) => {
    const answer = svAnswers[question.id];
    if (!answer) return "Chưa trả lời";

    if (question.question_type === "SINGLE_CHOICE") {
      const selectedId = answer.selected_option_id;
      const option = question.answer_options?.find((opt) => opt.id === selectedId);
      return option ? `Đã chọn: ${option.option_text}` : "Chưa chọn";
    }

    if (question.question_type === "MULTIPLE_CHOICE") {
      const selectedIds: number[] = answer.selected_option_ids || [];
      if (selectedIds.length === 0) return "Chưa chọn";
      const optionTexts = selectedIds
        .map((id) => question.answer_options?.find((opt) => opt.id === id)?.option_text)
        .filter(Boolean);
      return `Đã chọn: ${optionTexts.join(", ")}`;
    }

    if (question.question_type === "SHORT_ANSWER" || question.question_type === "ESSAY") {
      return answer.answer_text ? `Đã nhập: "${answer.answer_text}"` : "Chưa nhập";
    }

    if (question.question_type === "FILL_BLANK_TEXT" || question.question_type === "FILL_BLANK_DROPDOWN") {
      const blanks: string[] = answer.blanks || [];
      if (blanks.length === 0) return "Chưa điền";
      return `Đã điền: ${blanks.map((b, i) => `[Ô ${i + 1}]: ${b || "trống"}`).join(" | ")}`;
    }

    if (question.question_type === "FILE_UPLOAD") {
      return answer.file_name ? `Đã tải lên: ${answer.file_name}` : "Chưa tải tệp";
    }

    return "Đã ghi nhận";
  };

  const answeredCount = questions.filter((q) => isQuestionAnsweredInServer(q, serverAnswers)).length;
  const unansweredCount = questions.length - answeredCount;
  const unansweredRequired = questions.filter((q) => q.is_required && !isQuestionAnsweredInServer(q, serverAnswers));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all duration-300">
      <div
        className="relative max-w-3xl w-full bg-white dark:bg-[#0F1E35] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 dark:border-blue-500/15 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-blue-500/10 bg-slate-50 dark:bg-[#0D192E]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            📝 Xác nhận nộp bài (Quiz Review)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Vui lòng xem lại danh sách câu trả lời hệ thống đã ghi nhận trên server bên dưới.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {fetchingServerAnswers ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">Đang tải đáp án từ máy chủ...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl text-center">
                  <span className="block text-2xl font-extrabold text-blue-700 dark:text-cyan-400">
                    {questions.length}
                  </span>
                  <span className="text-xs text-blue-600/80 dark:text-cyan-400/80 font-semibold uppercase tracking-wider">
                    Tổng số câu
                  </span>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-center">
                  <span className="block text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    {answeredCount}
                  </span>
                  <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-semibold uppercase tracking-wider">
                    Đã ghi nhận
                  </span>
                </div>
                <div
                  className={`p-4 border rounded-xl text-center ${
                    unansweredCount > 0
                      ? "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50"
                      : "bg-slate-50 dark:bg-[#0D192E] border-slate-100 dark:border-blue-500/10"
                  }`}
                >
                  <span
                    className={`block text-2xl font-extrabold ${
                      unansweredCount > 0
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {unansweredCount}
                  </span>
                  <span className="text-xs text-slate-500/80 dark:text-slate-400/80 font-semibold uppercase tracking-wider">
                    Chưa hoàn tất
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-blue-500/10 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-[#0D192E]/40">
                {questions.map((q, idx) => {
                  const isAnswered = isQuestionAnsweredInServer(q, serverAnswers);
                  const ansText = getRecordedAnswerText(q, serverAnswers);
                  return (
                    <div
                      key={q.id}
                      className={`p-4 flex items-start justify-between gap-4 hover:bg-slate-100/30 dark:hover:bg-[#162644]/40 transition-colors ${
                        q.is_required && !isAnswered ? "bg-red-500/5" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Câu {idx + 1}
                          </span>
                          {q.is_required && (
                            <span className="text-xs font-semibold text-red-500 bg-red-100 dark:bg-red-950/30 px-1.5 py-0.5 rounded">
                              Bắt buộc
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm truncate mb-2">
                          {q.question_text.replace(/[#*`_[\]()-]/g, "")}
                        </p>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-300 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-lg px-3 py-2">
                          {ansText}
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {isAnswered ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 px-2 py-1 rounded-full">
                            ✅ Đã lưu
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                              q.is_required
                                ? "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"
                                : "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50"
                            }`}
                          >
                            ⚠️ Chưa lưu
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-blue-500/10 bg-slate-50 dark:bg-[#0D192E] space-y-4">
          {unansweredRequired.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-xl font-medium">
              ⚠️ Cảnh báo: Còn {unansweredRequired.length} câu hỏi bắt buộc chưa có câu trả lời được ghi nhận trên máy chủ. Bạn nên quay lại trả lời để tránh bị mất điểm.
            </div>
          )}
          {unansweredRequired.length === 0 && unansweredCount > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-sm rounded-xl font-medium">
              ⚠️ Lưu ý: Bạn vẫn còn {unansweredCount} câu hỏi chưa trả lời. Bạn có muốn quay lại để hoàn tất?
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 border-slate-300 dark:border-blue-500/20 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-[#162644] transition-all font-semibold cursor-pointer"
            >
              Quay lại làm tiếp
            </Button>
            <Button
              onClick={onSubmit}
              disabled={submitting || fetchingServerAnswers}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md active:scale-95 transition-all font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang nộp bài...
                </>
              ) : (
                "Xác nhận nộp bài"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
