/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, ReactNode } from "react";
import quizService from "@/services/quizService";
import FillBlankTextStudent from "@/components/lms/student/FillBlankTextStudent";
import FillBlankDropdownStudent from "@/components/lms/student/FillBlankDropdownStudent";
import AIDiagnosisModal from "./AIDiagnosisModal";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  MessageSquare,
  Eye,
  Upload,
  Sparkles,
  Clock,
  BarChart3,
  BookOpen,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import type {
  FillBlankTextSettings,
  FillBlankTextCorrectAnswer,
  FillBlankTextStudentAnswer,
  FillBlankDropdownSettings,
  FillBlankDropdownOption,
  FillBlankDropdownStudentAnswer,
} from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnswerOption {
  id: number;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  blank_id?: number;
}

interface CorrectAnswer {
  id: number;
  answer_text: string;
  case_sensitive: boolean;
  exact_match: boolean;
  blank_id?: number;
}

interface Question {
  id: number;
  question_type: string;
  question_text: string;
  explanation?: string;
  points: number;
  settings?: any;
  answer_options: AnswerOption[];
  correct_answers: CorrectAnswer[];
  images?: Array<{
    id: string;
    url: string;
    file_name: string;
    position: string;
    caption?: string;
    alt_text?: string;
    display_width?: string;
  }>;
}

interface StudentAnswer {
  id: number;
  answer_data: any;
  points_earned?: number;
  is_correct?: boolean;
  grader_feedback?: string;
}

interface QuestionWithAnswer {
  question: Question;
  student_answer?: StudentAnswer;
}

interface QuizReview {
  attempt: {
    id: number;
    quiz_id: number;
    attempt_number: number;
    started_at: string;
    submitted_at: string;
    earned_points: number;
    total_points: number;
    percentage: number;
    is_passed: boolean;
  };
  quiz: {
    id: number;
    title: string;
    total_points: number;
    passing_score?: number;
  };
  questions_with_answers: QuestionWithAnswer[];
  show_correct_answers: boolean;
  show_feedback: boolean;
}

type ReviewTab = "summary" | "review";
type QuestionFilter = "all" | "correct" | "wrong" | "pending";

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuizReviewPageProps {
  attemptId: number;
  courseId: number;
  onBack: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Circular score ring — SVG, no external deps */
function ScoreRing({
  percentage,
  passed,
  size = 120,
}: {
  percentage: number;
  passed: boolean;
  size?: number;
}) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const fill = (percentage / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-100 dark:text-slate-800"
        />
        {/* Fill */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          className={passed ? "text-green-500" : "text-blue-500"}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-extrabold leading-none ${
            size >= 120 ? "text-2xl" : "text-base"
          } ${passed ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}
        >
          {percentage.toFixed(0)}%
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {passed ? "Đạt" : "Chưa đạt"}
        </span>
      </div>
    </div>
  );
}

/** Inline tab bar following BDC palette */
function InlineTabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; badge?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            active === t.id
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {t.label}
          {t.badge !== undefined && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                active === t.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Small stat card */
function MiniStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: "green" | "red" | "yellow" | "blue" | "slate";
}) {
  const accents = {
    green:
      "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
    yellow:
      "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400",
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
    slate:
      "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400",
  };

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-1 ${accents[accent]}`}
    >
      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
        {label}
      </span>
      <span className="text-2xl font-extrabold leading-none">{value}</span>
      {sub && <span className="text-xs opacity-60">{sub}</span>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuizReviewPage({
  attemptId,
  courseId,
  onBack,
}: QuizReviewPageProps) {
  const [review, setReview] = useState<QuizReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ReviewTab>("summary");
  const [qFilter, setQFilter] = useState<QuestionFilter>("all");
  const [diagnosisTarget, setDiagnosisTarget] = useState<{
    qId: number;
    text: string;
    wrongAnswer: string;
    courseId: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await quizService.reviewQuiz(attemptId);
        setReview(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Không thể tải bài làm");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  // ── helpers ──────────────────────────────────────────────────────────────────

  const buildImageUrl = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://") ? url : url;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getQuestionTypeName = (type: string) => {
    const map: Record<string, string> = {
      SINGLE_CHOICE: "Chọn một",
      MULTIPLE_CHOICE: "Chọn nhiều",
      SHORT_ANSWER: "Trả lời ngắn",
      ESSAY: "Tự luận",
      FILE_UPLOAD: "Nộp file",
      FILL_BLANK_TEXT: "Điền chỗ trống",
      FILL_BLANK_DROPDOWN: "Chọn dropdown",
    };
    return map[type] || type;
  };

  const isEssayType = (type: string) =>
    ["ESSAY", "SHORT_ANSWER", "FILE_UPLOAD"].includes(type);

  const extractWrongAnswer = (qa: QuestionWithAnswer): string => {
    const { question, student_answer } = qa;
    if (!student_answer?.answer_data) return "";
    const data = student_answer.answer_data;

    switch (question.question_type) {
      case "SINGLE_CHOICE": {
        const selectedId = data.selected_option_id;
        const opt = question.answer_options.find((o) => o.id === selectedId);
        return opt?.option_text ?? String(selectedId ?? "");
      }
      case "MULTIPLE_CHOICE": {
        const ids: number[] = data.selected_option_ids ?? [];
        return question.answer_options
          .filter((o) => ids.includes(o.id))
          .map((o) => o.option_text)
          .join(", ");
      }
      case "SHORT_ANSWER":
      case "ESSAY":
        return data.answer_text ?? data.text ?? "";
      case "FILL_BLANK_TEXT":
      case "FILL_BLANK_DROPDOWN": {
        const blanks: any[] = data.blanks ?? [];
        return blanks
          .map((b) => `[${b.blank_id}]: ${b.answer ?? b.selected_option_id ?? ""}`)
          .join(" | ");
      }
      default:
        return JSON.stringify(data);
    }
  };

  // ── render question images ───────────────────────────────────────────────────

  const renderQuestionImages = (
    question: Question,
    position: "top" | "bottom"
  ) => {
    const images = question.images || question.settings?.images || [];
    const filtered = images.filter(
      (img: any) =>
        !img.position ||
        img.position === position ||
        (position === "top" && img.position === "above_question") ||
        (position === "bottom" && img.position === "below_question")
    );
    if (!filtered.length) return null;
    return (
      <div className="space-y-3 mb-4">
        {filtered.map((img: any) => (
          <div
            key={img.id}
            className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          >
            <img
              src={buildImageUrl(img.url)}
              alt={img.alt_text || img.file_name}
              className={`rounded-xl ${
                img.display_width === "full"
                  ? "w-full"
                  : img.display_width === "large"
                  ? "max-w-3xl mx-auto"
                  : img.display_width === "medium"
                  ? "max-w-xl mx-auto"
                  : "max-w-md mx-auto"
              }`}
            />
            {img.caption && (
              <p className="text-xs text-slate-500 dark:text-slate-400 p-2 text-center italic">
                {img.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ── question answer renderers ────────────────────────────────────────────────

  const renderChoiceQuestion = (qa: QuestionWithAnswer) => {
    const { question, student_answer } = qa;
    const studentChoices =
      student_answer?.answer_data?.selected_option_ids ||
      (student_answer?.answer_data?.selected_option_id
        ? [student_answer.answer_data.selected_option_id]
        : []);

    return (
      <div className="space-y-2">
        {question.answer_options
          .sort((a, b) => a.order_index - b.order_index)
          .map((option) => {
            const isStudentChoice = studentChoices.includes(option.id);
            const isCorrect = option.is_correct;
            const showCorrect = review?.show_correct_answers;

            let rowClass =
              "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700";
            let iconEl: ReactNode = (
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
            );

            if (isStudentChoice && isCorrect) {
              rowClass = "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700";
              iconEl = <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
            } else if (isStudentChoice && !isCorrect) {
              rowClass = "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700";
              iconEl = <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
            } else if (!isStudentChoice && isCorrect && showCorrect) {
              rowClass = "bg-green-50/60 dark:bg-green-950/10 border-green-200 dark:border-green-800 border-dashed";
              iconEl = <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-500" />;
            }

            return (
              <div
                key={option.id}
                className={`flex items-start gap-3 p-3.5 border rounded-xl transition-colors ${rowClass}`}
              >
                <div className="mt-0.5 flex-shrink-0">{iconEl}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed prose-sm prose-slate dark:prose-invert max-w-none">
                    <MarkdownRenderer content={option.option_text} />
                  </div>
                  {isStudentChoice && !isCorrect && showCorrect && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                      Đáp án bạn đã chọn — Sai
                    </p>
                  )}
                  {!isStudentChoice && isCorrect && showCorrect && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                      Đáp án đúng
                    </p>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  const renderShortAnswerQuestion = (qa: QuestionWithAnswer) => {
    const { question, student_answer } = qa;
    const studentText = student_answer?.answer_data?.answer_text || "";

    return (
      <div className="space-y-3">
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Câu trả lời của bạn
          </p>
          {studentText ? (
            <p className="text-slate-800 dark:text-slate-200">{studentText}</p>
          ) : (
            <p className="text-slate-400 dark:text-slate-600 italic text-sm">
              Chưa trả lời
            </p>
          )}
        </div>

        {review?.show_correct_answers && question.correct_answers?.length > 0 && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
              Đáp án chấp nhận
            </p>
            <ul className="space-y-1.5">
              {question.correct_answers.map((ans) => (
                <li
                  key={ans.id}
                  className="flex items-start gap-2 text-green-800 dark:text-green-300 text-sm"
                >
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {ans.answer_text}
                    {ans.case_sensitive && (
                      <span className="text-xs ml-2 opacity-60">
                        (Phân biệt hoa thường)
                      </span>
                    )}
                    {ans.exact_match && (
                      <span className="text-xs ml-2 opacity-60">
                        (Khớp chính xác)
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {student_answer?.grader_feedback && (
          <TeacherFeedback text={student_answer.grader_feedback} />
        )}
      </div>
    );
  };

  const renderEssayQuestion = (qa: QuestionWithAnswer) => {
    const { student_answer } = qa;
    const essayText =
      student_answer?.answer_data?.text ||
      student_answer?.answer_data?.answer_text ||
      "";

    return (
      <div className="space-y-3">
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Bài làm của bạn
          </p>
          {essayText ? (
            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-sm">
              {essayText}
            </p>
          ) : (
            <p className="text-slate-400 dark:text-slate-600 italic text-sm">
              Chưa trả lời
            </p>
          )}
        </div>
        {student_answer?.grader_feedback && (
          <TeacherFeedback text={student_answer.grader_feedback} />
        )}
      </div>
    );
  };

  const renderFileUploadQuestion = (qa: QuestionWithAnswer) => {
    const { student_answer } = qa;
    const fileName = student_answer?.answer_data?.file_name || "";
    const filePath = student_answer?.answer_data?.file_path || "";

    return (
      <div className="space-y-3">
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            File đã nộp
          </p>
          {fileName ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                  {fileName}
                </p>
                {filePath && (
                  <a
                    href={`/files/${filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                  >
                    Tải xuống →
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-600 italic text-sm">
              Chưa nộp file
            </p>
          )}
        </div>
        {student_answer?.grader_feedback && (
          <TeacherFeedback text={student_answer.grader_feedback} />
        )}
      </div>
    );
  };

  const renderFillBlankTextQuestion = (qa: QuestionWithAnswer) => {
    const { question, student_answer } = qa;
    const settings: FillBlankTextSettings = question.settings || {
      blank_count: 0,
      blanks: [],
    };
    const correctAnswers: FillBlankTextCorrectAnswer[] =
      question.correct_answers.map((ca) => ({
        blank_id: ca.blank_id || 0,
        answer_text: ca.answer_text,
        case_sensitive: ca.case_sensitive,
        exact_match: ca.exact_match,
      }));
    const studentAnswerData: FillBlankTextStudentAnswer =
      student_answer?.answer_data || { blanks: [] };

    return (
      <div className="space-y-3">
        <FillBlankTextStudent
          questionText={question.question_text}
          settings={settings}
          value={studentAnswerData}
          onChange={() => {}}
          disabled={true}
          showCorrectAnswers={review?.show_correct_answers || false}
          correctAnswers={correctAnswers}
        />
        {student_answer?.grader_feedback && (
          <TeacherFeedback text={student_answer.grader_feedback} />
        )}
      </div>
    );
  };

  const renderFillBlankDropdownQuestion = (qa: QuestionWithAnswer) => {
    const { question, student_answer } = qa;
    const settings: FillBlankDropdownSettings = question.settings || {
      blank_count: 0,
      blanks: [],
    };
    const options: FillBlankDropdownOption[] = question.answer_options.map(
      (opt) => ({
        id: opt.id,
        blank_id: opt.blank_id || 0,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        order_index: opt.order_index,
      })
    );
    const studentAnswerData: FillBlankDropdownStudentAnswer =
      student_answer?.answer_data || { blanks: [] };

    return (
      <div className="space-y-3">
        <FillBlankDropdownStudent
          questionText={question.question_text}
          settings={settings}
          options={options}
          value={studentAnswerData}
          onChange={() => {}}
          disabled={true}
          showCorrectAnswers={review?.show_correct_answers || false}
          studentAnswer={studentAnswerData}
        />
        {student_answer?.grader_feedback && (
          <TeacherFeedback text={student_answer.grader_feedback} />
        )}
      </div>
    );
  };

  const renderQuestionAnswer = (qa: QuestionWithAnswer) => {
    switch (qa.question.question_type) {
      case "SINGLE_CHOICE":
      case "MULTIPLE_CHOICE":
        return renderChoiceQuestion(qa);
      case "SHORT_ANSWER":
        return renderShortAnswerQuestion(qa);
      case "ESSAY":
        return renderEssayQuestion(qa);
      case "FILE_UPLOAD":
        return renderFileUploadQuestion(qa);
      case "FILL_BLANK_TEXT":
        return renderFillBlankTextQuestion(qa);
      case "FILL_BLANK_DROPDOWN":
        return renderFillBlankDropdownQuestion(qa);
      default:
        return (
          <p className="text-slate-400 dark:text-slate-600 italic text-sm">
            Loại câu hỏi này chưa được hỗ trợ xem lại
          </p>
        );
    }
  };

  // ── states ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Đang tải bài làm...
          </p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-8 max-w-sm w-full text-center shadow-sm">
          <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
            {error || "Không thể tải bài làm"}
          </p>
          <button
            onClick={onBack}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const { attempt, quiz, questions_with_answers, show_correct_answers, show_feedback } = review;

  // ── derived stats ─────────────────────────────────────────────────────────

  const correctCount = questions_with_answers.filter(
    (qa) => qa.student_answer?.is_correct === true
  ).length;

  const wrongCount = questions_with_answers.filter(
    (qa) =>
      qa.student_answer?.is_correct === false &&
      !isEssayType(qa.question.question_type)
  ).length;

  const pendingCount = questions_with_answers.filter(
    (qa) =>
      qa.student_answer?.points_earned === undefined ||
      (isEssayType(qa.question.question_type) &&
        qa.student_answer?.points_earned !== undefined &&
        !qa.student_answer?.is_correct)
  ).length;

  const filteredQuestions = questions_with_answers.filter((qa) => {
    if (qFilter === "all") return true;
    const ans = qa.student_answer;
    if (qFilter === "correct") return ans?.is_correct === true;
    if (qFilter === "wrong")
      return (
        ans?.is_correct === false && !isEssayType(qa.question.question_type)
      );
    if (qFilter === "pending")
      return (
        ans?.points_earned === undefined ||
        isEssayType(qa.question.question_type)
      );
    return true;
  });

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* ── Hero card ──────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

          {/* Top accent strip */}
          <div
            className={`h-1.5 w-full ${
              attempt.is_passed
                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                : "bg-gradient-to-r from-blue-500 to-blue-600"
            }`}
          />

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

              {/* Score ring */}
              <div className="flex-shrink-0">
                <ScoreRing
                  percentage={attempt.percentage ?? 0}
                  passed={attempt.is_passed}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      attempt.is_passed
                        ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                        : "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {attempt.is_passed ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {attempt.is_passed ? "Đạt yêu cầu" : "Chưa đạt"}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Lần làm #{attempt.attempt_number}
                  </span>
                </div>

                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mb-1 truncate">
                  {quiz.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-blue-500" />
                    <strong className="text-slate-700 dark:text-slate-300">
                      {attempt.earned_points?.toFixed(1) ?? 0}
                    </strong>
                    /{attempt.total_points} điểm
                  </span>
                  {quiz.passing_score && (
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      Điểm đạt: {quiz.passing_score}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {formatTime(attempt.submitted_at)}
                  </span>
                </div>

                {/* Feature badges */}
                {(show_correct_answers || show_feedback) && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {show_correct_answers && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                        <Eye className="w-3 h-3" />
                        Hiển thị đáp án
                      </span>
                    )}
                    {show_feedback && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                        <MessageSquare className="w-3 h-3" />
                        Có giải thích
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab bar ────────────────────────────────────────────────────────── */}
        <InlineTabBar
          tabs={[
            { id: "summary", label: "Tổng kết" },
            { id: "review", label: "Xem lại chi tiết", badge: questions_with_answers.length },
          ]}
          active={activeTab}
          onChange={(id) => setActiveTab(id as ReviewTab)}
        />

        {/* ── Tab: Summary ───────────────────────────────────────────────────── */}
        {activeTab === "summary" && (
          <div className="space-y-5">

            {/* Stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat
                label="Tổng câu"
                value={questions_with_answers.length}
                sub="câu hỏi"
                accent="slate"
              />
              <MiniStat
                label="Đúng"
                value={correctCount}
                sub={`${((correctCount / questions_with_answers.length) * 100).toFixed(0)}%`}
                accent="green"
              />
              <MiniStat
                label="Sai"
                value={wrongCount}
                sub={`${((wrongCount / questions_with_answers.length) * 100).toFixed(0)}%`}
                accent="red"
              />
              <MiniStat
                label="Chưa chấm"
                value={pendingCount}
                sub="câu tự luận"
                accent="yellow"
              />
            </div>

            {/* Question-by-question mini timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Kết quả từng câu
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {questions_with_answers.map((qa, idx) => {
                  const ans = qa.student_answer;
                  const essay = isEssayType(qa.question.question_type);
                  const correct = ans?.is_correct === true;
                  const graded = ans?.points_earned !== undefined;

                  let bg = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
                  if (graded && correct)
                    bg = "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400";
                  else if (graded && !correct && !essay)
                    bg = "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400";
                  else if (essay)
                    bg = "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400";

                  return (
                    <button
                      key={qa.question.id}
                      onClick={() => {
                        setActiveTab("review");
                        setQFilter("all");
                      }}
                      title={`Câu ${idx + 1}: ${qa.question.question_text.slice(0, 60)}...`}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all hover:scale-110 active:scale-95 ${bg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {[
                  { color: "bg-green-100 dark:bg-green-950/40", label: "Đúng" },
                  { color: "bg-red-100 dark:bg-red-950/40", label: "Sai" },
                  { color: "bg-yellow-100 dark:bg-yellow-950/40", label: "Tự luận" },
                  { color: "bg-slate-100 dark:bg-slate-800", label: "Chưa chấm" },
                ].map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className={`w-3 h-3 rounded ${item.color}`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Attempt info card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Thông tin bài thi
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Bắt đầu", value: formatTime(attempt.started_at) },
                  { label: "Nộp bài", value: formatTime(attempt.submitted_at) },
                  { label: "Số điểm đạt", value: `${attempt.earned_points?.toFixed(1) ?? 0} / ${attempt.total_points}` },
                  { label: "Tỷ lệ đúng", value: `${attempt.percentage?.toFixed(1) ?? 0}%` },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl"
                  >
                    <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA to review tab */}
            <button
              onClick={() => setActiveTab("review")}
              className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                    Xem lại chi tiết + AI phân tích
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Đáp án, giải thích và gợi ý cải thiện từ AI
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
        )}

        {/* ── Tab: Review ────────────────────────────────────────────────────── */}
        {activeTab === "review" && (
          <div className="space-y-5">

            {/* Filter bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  Câu hỏi &amp; đáp án
                </p>
                <InlineTabBar
                  tabs={[
                    { id: "all", label: "Tất cả", badge: questions_with_answers.length },
                    { id: "correct", label: "Đúng", badge: correctCount },
                    { id: "wrong", label: "Sai", badge: wrongCount },
                    { id: "pending", label: "Chờ chấm", badge: pendingCount },
                  ]}
                  active={qFilter}
                  onChange={(id) => setQFilter(id as QuestionFilter)}
                />
              </div>
            </div>

            {/* Question list */}
            <div className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center">
                  <p className="text-slate-400 dark:text-slate-600 text-sm">
                    Không có câu hỏi nào trong bộ lọc này.
                  </p>
                </div>
              ) : (
                filteredQuestions.map((qa) => {
                  const question = qa.question;
                  const studentAnswer = qa.student_answer;
                  const isCorrect = studentAnswer?.is_correct ?? false;
                  const hasGraded = studentAnswer?.points_earned !== undefined;
                  const essay = isEssayType(question.question_type);

                  // Status
                  let statusBg = "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700";
                  let statusLabel = "";
                  let statusClass = "";
                  let numberBg = "bg-slate-400 dark:bg-slate-600";

                  if (hasGraded) {
                    if (isCorrect) {
                      statusBg = "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
                      statusLabel = "Đúng";
                      statusClass = "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400";
                      numberBg = "bg-green-500";
                    } else if (essay) {
                      statusBg = "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800";
                      statusLabel = "Đã chấm";
                      statusClass = "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400";
                      numberBg = "bg-yellow-500";
                    } else {
                      statusBg = "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
                      statusLabel = "Sai";
                      statusClass = "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400";
                      numberBg = "bg-red-500";
                    }
                  } else {
                    statusLabel = "Chưa chấm";
                    statusClass = "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400";
                  }

                  // Global question index
                  const globalIdx = questions_with_answers.findIndex(
                    (q) => q.question.id === question.id
                  );

                  return (
                    <div
                      key={question.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                      {/* Question header */}
                      <div
                        className={`flex items-start gap-3 px-5 py-4 border-b ${statusBg}`}
                      >
                        {/* Number badge */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5 ${numberBg}`}
                        >
                          {globalIdx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Tags row */}
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-xs px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                              {getQuestionTypeName(question.question_type)}
                            </span>
                            {statusLabel && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${statusClass}`}
                              >
                                {isCorrect && <CheckCircle className="w-3 h-3" />}
                                {!isCorrect && hasGraded && !essay && <XCircle className="w-3 h-3" />}
                                {!hasGraded && <AlertCircle className="w-3 h-3" />}
                                {statusLabel}
                              </span>
                            )}
                          </div>

                          {/* Question text */}
                          {question.question_type !== "FILL_BLANK_TEXT" &&
                            question.question_type !== "FILL_BLANK_DROPDOWN" && (
                              <div className="text-slate-900 dark:text-slate-50 text-sm font-semibold leading-relaxed prose-sm prose-slate dark:prose-invert max-w-none">
                                <MarkdownRenderer content={question.question_text} />
                              </div>
                            )}

                          {/* Points */}
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {studentAnswer?.points_earned?.toFixed(1) ?? 0} /{" "}
                            {question.points} điểm
                          </p>
                        </div>
                      </div>

                      {/* Question body */}
                      <div className="p-5 space-y-4">
                        {renderQuestionImages(question, "top")}
                        {renderQuestionAnswer(qa)}
                        {renderQuestionImages(question, "bottom")}

                        {/* Explanation */}
                        {show_feedback && question.explanation && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Giải thích
                            </p>
                            <p className="text-amber-900 dark:text-amber-200 text-sm leading-relaxed">
                              {question.explanation}
                            </p>
                          </div>
                        )}

                        {/* AI analysis button — only for wrong answers */}
                        {!isCorrect && hasGraded && !essay && (
                          <button
                            onClick={() =>
                              setDiagnosisTarget({
                                qId: question.id,
                                text: question.question_text,
                                wrongAnswer: extractWrongAnswer(qa),
                                courseId,
                              })
                            }
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-all active:scale-95"
                          >
                            <Sparkles className="w-4 h-4" />
                            AI Phân tích lỗi sai này
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* AI Diagnosis Modal — still overlay, but triggered from within the page */}
      {diagnosisTarget && (
        <AIDiagnosisModal
          attemptId={attemptId}
          questionId={diagnosisTarget.qId}
          questionText={diagnosisTarget.text}
          wrongAnswer={diagnosisTarget.wrongAnswer}
          courseId={diagnosisTarget.courseId}
          onClose={() => setDiagnosisTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Shared sub-component ─────────────────────────────────────────────────────

function TeacherFeedback({ text }: { text: string }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <MessageSquare className="w-3.5 h-3.5" />
        Nhận xét của giáo viên
      </p>
      <p className="text-blue-900 dark:text-blue-200 text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
}