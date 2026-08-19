"use client";

/**
 * QuizSmartImportModal
 *
 * Allows teachers to paste raw, unformatted text and have AI automatically
 * parse it into structured quiz questions (SINGLE_CHOICE, FILL_BLANK_TEXT, etc.)
 * without any required format.
 */
import { useState, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  PlusCircle,
} from "lucide-react";
import BaseModal from "@/components/lms/shared/BaseModal";
import { cn } from "@/lib/utils";
import { parseQuizText, type ParsedQuestion } from "@/services/ai/aiService";
import quizService from "@/services/lms/quizService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizSmartImportModalProps {
  quizId: number;
  currentQuestionCount: number;
  onClose: () => void;
  onImported: () => void;
}

const QUESTION_TYPE_LABELS: Record<string, { label: string }> = {
  SINGLE_CHOICE: { label: "Trắc nghiệm 1 đáp án" },
  MULTIPLE_CHOICE: { label: "Trắc nghiệm nhiều đáp án" },
  SHORT_ANSWER: { label: "Tự luận ngắn" },
  ESSAY: { label: "Tự luận dài" },
  FILE_UPLOAD: { label: "Nộp file" },
  FILL_BLANK_TEXT: { label: "Điền từ (text)" },
  FILL_BLANK_DROPDOWN: { label: "Điền từ (dropdown)" },
};

const EXAMPLE_TEXT = `You've installed uv a while ago using the standalone installer. Which command can you run to update uv to the latest release?

Select one:
pip install --upgrade uv
uv self update
pipx upgrade uv
uv update

It's a very introspective command!`;

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizSmartImportModal({
  quizId,
  currentQuestionCount,
  onClose,
  onImported,
}: QuizSmartImportModalProps) {
  // Step 1: paste; Step 2: preview
  const [step, setStep] = useState<"paste" | "preview">("paste");
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(null);

  // ── Parse ──────────────────────────────────────────────────────────────────

  const handleParse = async () => {
    if (!rawText.trim() || isParsing) return;
    setIsParsing(true);
    setParseError(null);

    try {
      const res = await parseQuizText(rawText);
      const parsed = res?.questions ?? [];
      if (!parsed || parsed.length === 0) {
        setParseError("Không thể nhận diện được câu hỏi nào từ văn bản đã nhập.");
        return;
      }
      setQuestions(parsed);
      setSelected(new Set(parsed.map((_, i) => i)));
      setStep("preview");
    } catch (err: any) {
      console.error("QuizSmartImport error:", err);
      setParseError(
        err?.response?.data?.error ||
          err?.message ||
          "Có lỗi xảy ra khi phân tích văn bản với AI."
      );
    } finally {
      setIsParsing(false);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    const selectedQuestions = questions.filter((_, i) => selected.has(i));
    if (selectedQuestions.length === 0 || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const formatted = selectedQuestions.map((q, i) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points ?? 1,
        order_index: currentQuestionCount + i + 1,
        explanation: q.explanation ?? null,
        options: q.answer_options?.map((opt, oi) => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          order_index: oi + 1,
        })),
        correct_answers: q.correct_answers?.map((ans) => ({
          answer_text: ans.answer_text,
          blank_id: ans.blank_id ?? null,
          case_sensitive: ans.case_sensitive ?? false,
        })),
      }));

      await quizService.createQuestionsBatch(quizId, formatted);
      onImported();
      onClose();
    } catch (err: any) {
      console.error("Batch save error:", err);
      setSaveError(
        err?.response?.data?.error ||
          err?.message ||
          "Có lỗi xảy ra khi lưu các câu hỏi."
      );
    } finally {
      setIsSaving(false);
    }
  }, [questions, selected, quizId, currentQuestionCount, isSaving, onImported, onClose]);

  const toggleSelect = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });

  const selectedCount = selected.size;

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {step === "paste"
              ? "Nhập câu hỏi thông minh"
              : `Xem lại ${questions.length} câu hỏi`}
          </span>
        </div>
      }
      description={
        step === "paste"
          ? "Dán bất kỳ đoạn văn bản câu hỏi/đáp án nào. AI sẽ tự động phân tích và cấu trúc hóa."
          : `Đã tự động trích xuất ${questions.length} câu hỏi. Chọn các câu bạn muốn thêm vào quiz.`
      }
      size="xl"
      footer={
        <div className="flex gap-3 w-full">
          {step === "paste" ? (
            <>
              <button
                onClick={handleParse}
                disabled={!rawText.trim() || isParsing}
                className={cn(
                  "flex-1 h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]",
                  "shadow-md shadow-blue-200 dark:shadow-none",
                  isParsing || !rawText.trim()
                    ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang phân tích...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>🪄 Parse với AI</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-5 h-12 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-all"
              >
                Hủy
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={selectedCount === 0 || isSaving}
                className={cn(
                  "flex-1 h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]",
                  "shadow-md shadow-blue-200 dark:shadow-none",
                  selectedCount === 0 || isSaving
                    ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700"
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
                    <span>✅ Thêm {selectedCount} câu hỏi vào Quiz</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setStep("paste");
                  setSaveError(null);
                }}
                className="px-5 h-12 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-all"
              >
                ← Sửa lại
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="flex-1 overflow-y-auto">
        {step === "paste" ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Dán nội dung câu hỏi tại đây
                </label>
                <button
                  type="button"
                  onClick={() => setRawText(EXAMPLE_TEXT)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Dán ví dụ mẫu
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                disabled={isParsing}
                rows={10}
                placeholder={`Ví dụ:\n\nCâu 1: Thủ đô của Việt Nam là gì?\nA. Hà Nội\nB. TP. Hồ Chí Minh\nC. Đà Nẵng\nĐáp án: A`}
                className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070E1C] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm resize-none"
              />
            </div>

            {parseError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-red-700 dark:text-red-300 font-medium text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{parseError}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span>
                Đã chọn <strong className="text-blue-600 dark:text-blue-400">{selectedCount}</strong> / {questions.length} câu hỏi
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(new Set(questions.map((_, i) => i)))}
                  className="hover:underline text-blue-600 dark:text-blue-400"
                >
                  Chọn tất cả
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="hover:underline text-slate-500"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {questions.map((q, i) => {
                const typeMeta = QUESTION_TYPE_LABELS[q.question_type] || {
                  label: q.question_type,
                  icon: "❓",
                };
                const isSelected = selected.has(i);
                const isExp = expanded === i;

                return (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl border transition-all overflow-hidden",
                      isSelected
                        ? "border-blue-300 dark:border-blue-700/60 bg-blue-50/40 dark:bg-blue-950/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 opacity-60"
                    )}
                  >
                    <div className="p-4 flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSelect(i)}
                        className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 mt-0.5",
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
                        )}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                            {typeMeta.label}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {q.points ?? 1}đ
                          </span>
                        </div>

                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                          {i + 1}. {q.question_text}
                        </p>

                        <button
                          type="button"
                          onClick={() => setExpanded(isExp ? null : i)}
                          className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline font-medium"
                        >
                          {isExp ? (
                            <>
                              <span>Thu gọn</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>Xem chi tiết ({q.answer_options?.length ?? 0} đáp án)</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>

                        {isExp && (
                          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                            {q.answer_options?.map((opt, oi) => (
                              <div
                                key={oi}
                                className={cn(
                                  "flex items-start gap-2 text-xs p-2 rounded-lg",
                                  opt.is_correct
                                    ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 font-medium"
                                    : "text-slate-600 dark:text-slate-400"
                                )}
                              >
                                <span className="flex-shrink-0">
                                  {opt.is_correct ? "✓" : String.fromCharCode(65 + oi) + "."}
                                </span>
                                <span>{opt.option_text}</span>
                              </div>
                            ))}
                            {q.correct_answers?.map((ans, ai) => (
                              <div
                                key={ai}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-800/30"
                              >
                                <span className="font-bold">BLANK_{ans.blank_id ?? ai + 1}:</span>
                                <span>{ans.answer_text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {saveError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-red-700 dark:text-red-300 font-medium text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{saveError}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
}

export default QuizSmartImportModal;
