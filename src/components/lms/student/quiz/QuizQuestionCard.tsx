import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import FillBlankTextStudent from "@/components/lms/student/FillBlankTextStudent";
import FillBlankDropdownStudent from "@/components/lms/student/FillBlankDropdownStudent";
import FileUploadQuestion from "@/components/lms/student/FileUploadQuestion";
import type {
  FillBlankTextSettings,
  FillBlankTextStudentAnswer,
  FillBlankDropdownSettings,
  FillBlankDropdownOption,
  FillBlankDropdownStudentAnswer,
} from "@/types";
import type { Question, QuestionImage } from "@/hooks/lms/student/useQuizTaking";

interface QuizQuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  answer: any;
  onAnswerChange: (questionId: number, answerData: any) => void;
  onOpenImageModal: (url: string) => void;
}

export function QuizQuestionCard({
  question,
  currentIndex,
  totalQuestions,
  answer,
  onAnswerChange,
  onOpenImageModal,
}: QuizQuestionCardProps) {
  const questionImages: QuestionImage[] = question.settings?.images || [];

  const renderQuestionImages = (position: string) => {
    if (!questionImages || questionImages.length === 0) return null;
    const positionImages = questionImages.filter((img) => (img.position || "above_question") === position);
    if (positionImages.length === 0) return null;

    return (
      <div className="my-4 space-y-3">
        {positionImages.map((image) => (
          <div key={image.id} className="relative group">
            <div className="relative rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all">
              <img
                src={image.url}
                alt={image.alt_text || image.file_name}
                className="w-full cursor-pointer hover:opacity-95 transition-opacity"
                style={{ maxWidth: image.display_width || "100%" }}
                onClick={() => onOpenImageModal(image.url)}
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-sm p-2">
                  {image.caption}
                </div>
              )}
            </div>
            <button
              onClick={() => onOpenImageModal(image.url)}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="Xem ảnh lớn"
            >
              🔍
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0F1E35] rounded-2xl shadow-sm border border-slate-200 dark:border-blue-500/10 p-6 sm:p-8">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 rounded-lg font-bold text-sm border border-blue-200 dark:border-blue-500/20">
              Câu {currentIndex + 1}/{totalQuestions}
            </span>
            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg font-semibold text-sm border border-purple-200 dark:border-purple-500/20">
              {question.points} điểm
            </span>
            {question.is_required && (
              <span className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-500/20">
                * Bắt buộc
              </span>
            )}
            {questionImages.length > 0 && (
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-500/20">
                🖼️ {questionImages.length} ảnh
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Images ABOVE question */}
      {renderQuestionImages("above_question")}

      {/* Question Text */}
      <div className="mb-6">
        <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed prose prose-slate dark:prose-invert max-w-none">
          <MarkdownRenderer content={question.question_text} />
        </div>
        {question.question_html && (
          <div
            className="mt-3 text-slate-700 dark:text-slate-300 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: question.question_html }}
          />
        )}
      </div>

      {/* Images BELOW question */}
      {renderQuestionImages("below_question")}

      {/* Answer Input */}
      <div className="mt-6">
        {question.question_type === "SINGLE_CHOICE" && (
          <div className="space-y-3">
            {question.answer_options?.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  answer?.selected_option_id === option.id
                    ? "border-blue-500 bg-blue-50/50 dark:border-cyan-400 dark:bg-blue-950/30"
                    : "border-slate-200 dark:border-blue-500/10 hover:border-blue-300 dark:hover:border-cyan-400/30 hover:bg-slate-50 dark:hover:bg-[#12223a]/40"
                }`}
              >
                <div className="mt-1 w-5 h-5 flex-shrink-0">
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    checked={answer?.selected_option_id === option.id}
                    onChange={() =>
                      onAnswerChange(question.id, {
                        selected_option_id: option.id,
                        type: "single_choice",
                      })
                    }
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="text-slate-900 dark:text-slate-50 flex-1 prose-sm prose-slate dark:prose-invert max-w-none">
                  <MarkdownRenderer content={option.option_text} />
                </div>
              </label>
            ))}
          </div>
        )}

        {question.question_type === "MULTIPLE_CHOICE" && (
          <div className="space-y-3">
            {question.answer_options?.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  answer?.selected_option_ids?.includes(option.id)
                    ? "border-blue-500 bg-blue-50/50 dark:border-cyan-400 dark:bg-blue-950/30"
                    : "border-slate-200 dark:border-blue-500/10 hover:border-blue-300 dark:hover:border-cyan-400/30 hover:bg-slate-50 dark:hover:bg-[#12223a]/40"
                }`}
              >
                <div className="mt-1 w-5 h-5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={answer?.selected_option_ids?.includes(option.id) || false}
                    onChange={(e) => {
                      const currentIds = answer?.selected_option_ids || [];
                      const newIds = e.target.checked
                        ? [...currentIds, option.id]
                        : currentIds.filter((id: number) => id !== option.id);
                      onAnswerChange(question.id, {
                        selected_option_ids: newIds,
                        type: "multiple_choice",
                      });
                    }}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="text-slate-900 dark:text-slate-50 flex-1 prose-sm prose-slate dark:prose-invert max-w-none">
                  <MarkdownRenderer content={option.option_text} />
                </div>
              </label>
            ))}
          </div>
        )}

        {question.question_type === "SHORT_ANSWER" && (
          <input
            type="text"
            value={answer?.answer_text || ""}
            onChange={(e) =>
              onAnswerChange(question.id, {
                answer_text: e.target.value,
                type: "short_answer",
              })
            }
            className="w-full px-4 py-3 border border-slate-300 dark:border-blue-500/20 rounded-xl bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all"
            placeholder="Nhập câu trả lời của bạn..."
          />
        )}

        {question.question_type === "ESSAY" && (
          <textarea
            value={answer?.answer_text || ""}
            onChange={(e) =>
              onAnswerChange(question.id, {
                answer_text: e.target.value,
                type: "essay",
              })
            }
            className="w-full px-4 py-3 border border-slate-300 dark:border-blue-500/20 rounded-xl bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all"
            rows={8}
            placeholder="Nhập bài luận của bạn..."
          />
        )}

        {question.question_type === "FILL_BLANK_TEXT" && (
          <FillBlankTextStudent
            questionText={question.question_text}
            settings={(question.settings as FillBlankTextSettings) || { blank_count: 0, blanks: [] }}
            value={(answer as FillBlankTextStudentAnswer) || { blanks: [] }}
            onChange={(newAnswer) => onAnswerChange(question.id, newAnswer)}
            disabled={false}
            showCorrectAnswers={false}
          />
        )}

        {question.question_type === "FILL_BLANK_DROPDOWN" && (
          <FillBlankDropdownStudent
            questionText={question.question_text}
            settings={(question.settings as FillBlankDropdownSettings) || { blank_count: 0, blanks: [] }}
            options={(question.answer_options as FillBlankDropdownOption[]) || []}
            value={(answer as FillBlankDropdownStudentAnswer) || { blanks: [] }}
            onChange={(newAnswer) => onAnswerChange(question.id, newAnswer)}
            disabled={false}
            showCorrectAnswers={false}
          />
        )}

        {question.question_type === "FILE_UPLOAD" && (
          <FileUploadQuestion
            questionId={question.id}
            value={answer}
            onChange={(newAnswer) => onAnswerChange(question.id, newAnswer)}
            disabled={false}
            maxFileSize={question.settings?.max_file_size_mb}
            allowedExtensions={question.settings?.allowed_extensions}
          />
        )}
      </div>
    </div>
  );
}
