"use client";

/**
 * QuizSmartImportModal
 *
 * Allows teachers to paste raw, unformatted text and have AI automatically
 * parse it into structured quiz questions (SINGLE_CHOICE, FILL_BLANK_TEXT, etc.)
 * without any required format.
 *
 * Workflow:
 *   1. Teacher opens modal → pastes text
 *   2. Clicks "Parse with AI" → LLM parses → preview shown
 *   3. Teacher checks/unchecks questions → clicks "Add N questions"
 *   4. Questions are batch-inserted into the quiz
 */
import { useState, useCallback } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseQuizText, type ParsedQuestion } from "@/services/aiService";
import quizService from "@/services/quizService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizSmartImportModalProps {
  quizId: number;
  currentQuestionCount: number;
  onClose: () => void;
  onImported: () => void;
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
  const [step, setStep]               = useState<"paste" | "preview">("paste");
  const [rawText, setRawText]         = useState("");
  const [isParsing, setIsParsing]     = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [parseError, setParseError]   = useState<string | null>(null);
  const [saveError, setSaveError]     = useState<string | null>(null);
  const [questions, setQuestions]     = useState<ParsedQuestion[]>([]);
  const [selected, setSelected]       = useState<Set<number>>(new Set());
  const [expanded, setExpanded]       = useState<number | null>(null);

  // ── Parse ──────────────────────────────────────────────────────────────────

  const handleParse = useCallback(async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await parseQuizText(rawText.trim(), 10, "vi");
      if (!result.questions.length) {
        setParseError("Không tìm thấy câu hỏi nào. Hãy đảm bảo văn bản chứa câu hỏi rõ ràng.");
        return;
      }
      const withIds = result.questions.map((q, i) => ({ ...q, preview_id: i + 1 }));
      setQuestions(withIds);
      setSelected(new Set(withIds.map((_, i) => i)));
      setStep("preview");
    } catch (err: any) {
      setParseError(err?.response?.data?.error || err.message || "Lỗi khi phân tích văn bản.");
    } finally {
      setIsParsing(false);
    }
  }, [rawText]);

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    const toSave = questions.filter((_, i) => selected.has(i));
    if (!toSave.length) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const questionsData = toSave.map((q, i) => ({
        question_type:   q.question_type,
        question_text:   q.question_text,
        points:          q.points,
        order_index:     currentQuestionCount + i + 1,
        explanation:     q.explanation || "",
        is_required:     q.is_required,
        answer_options:  q.answer_options,
        correct_answers: q.correct_answers,
        settings:        q.settings,
      }));

      await quizService.createQuestionsBatch(quizId, questionsData);
      onImported();
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || err.message || "Lỗi khi lưu câu hỏi.");
    } finally {
      setIsSaving(false);
    }
  }, [questions, selected, quizId, currentQuestionCount, onImported]);

  const toggleSelect = (i: number) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const selectedCount = selected.size;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 bg-white dark:bg-slate-900",
          "rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800",
          "flex flex-col",
          "w-full max-w-2xl mx-4",
          "max-h-[90vh]",
          "animate-in slide-in-from-bottom-4 duration-300",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              {step === "paste" ? "Nhập câu hỏi thông minh" : `Xem lại ${questions.length} câu hỏi`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === "paste"
                ? "Dán văn bản bất kỳ — AI sẽ tự nhận diện dạng câu hỏi"
                : "Chọn câu hỏi muốn thêm rồi nhấn Lưu"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── STEP 1: PASTE ── */}
          {step === "paste" && (
            <div className="p-6 space-y-4">
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={`Dán văn bản câu hỏi vào đây...\n\nVí dụ:\n${EXAMPLE_TEXT}`}
                className={cn(
                  "w-full h-64 resize-none px-4 py-3 rounded-xl text-sm font-mono",
                  "border border-slate-300 dark:border-slate-700",
                  "bg-slate-50 dark:bg-slate-800",
                  "text-slate-900 dark:text-slate-100",
                  "placeholder:text-slate-400 dark:placeholder:text-slate-600",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                  "transition-all duration-200",
                )}
              />

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> AI hỗ trợ nhận diện:
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(QUESTION_TYPE_LABELS).slice(0, 5).map(([, v]) => (
                    <span key={v.label} className="text-xs px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-blue-800 text-slate-600 dark:text-slate-400">
                      {v.icon} {v.label}
                    </span>
                  ))}
                </div>
              </div>

              {parseError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm animate-in fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{parseError}</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: PREVIEW ── */}
          {step === "preview" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {selectedCount}/{questions.length} câu hỏi được chọn
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelected(new Set(questions.map((_, i) => i)))}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="text-xs font-medium text-slate-400 hover:underline"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>

              {questions.map((q, i) => {
                const isSelected = selected.has(i);
                const isExpanded = expanded === i;
                const typeInfo = QUESTION_TYPE_LABELS[q.question_type] || { label: q.question_type, icon: "❓" };

                return (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-200",
                      isSelected
                        ? "border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/10"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(i)}
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "border-slate-300 dark:border-slate-600",
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* Type badge */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-medium">
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {q.points} điểm
                          </span>
                        </div>

                        {/* Question text */}
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                          {q.question_text}
                        </p>

                        {/* Expand button */}
                        {(q.answer_options.length > 0 || q.correct_answers.length > 0) && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : i)}
                            className="mt-2 text-xs text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {isExpanded ? "Ẩn đáp án" : "Xem đáp án"}
                          </button>
                        )}

                        {/* Expanded options */}
                        {isExpanded && (
                          <div className="mt-3 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                            {/* Choice options */}
                            {q.answer_options.map((opt, oi) => (
                              <div
                                key={oi}
                                className={cn(
                                  "flex items-start gap-2 px-3 py-2 rounded-lg text-xs",
                                  opt.is_correct
                                    ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 font-semibold border border-green-200/50 dark:border-green-800/30"
                                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-500",
                                )}
                              >
                                <span className="flex-shrink-0">{opt.is_correct ? "✓" : String.fromCharCode(65 + oi) + "."}</span>
                                <span>{opt.option_text}</span>
                              </div>
                            ))}
                            {/* Fill blank answers */}
                            {q.correct_answers.map((ans, ai) => (
                              <div key={ai} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-800/30">
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

              {saveError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{saveError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex-shrink-0">
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
                    : "bg-blue-600 hover:bg-blue-700",
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
                    : "bg-blue-600 hover:bg-blue-700",
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
                onClick={() => { setStep("paste"); setSaveError(null); }}
                className="px-5 h-12 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-all"
              >
                ← Sửa lại
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
