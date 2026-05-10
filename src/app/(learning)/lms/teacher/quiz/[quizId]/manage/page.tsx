/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import quizService from "@/services/quizService";
import { BreadcrumbNav } from "@/components/lms/BreadcrumbNav";
import { QuizSettingsModal } from "@/components/lms/teacher/QuizSettingsModal";
import QuestionImageUploader from "@/components/lms/teacher/QuestionImageUploader";
import FillBlankTextEditor from "@/components/lms/teacher/FillBlankTextEditor";
import FillBlankDropdownEditor from "@/components/lms/teacher/FillBlankDropdownEditor";
import MarkdownEditor from "@/components/markdown/MarkdownEditor";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { useQuizCourse } from "@/hooks/useQuizCourse";
import { useMarkdownImage } from "@/hooks/useMarkdownImage";
import type {
  FillBlankTextSettings,
  FillBlankTextCorrectAnswer,
  FillBlankDropdownSettings,
  FillBlankDropdownOption,
} from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Quiz {
  id: number;
  title: string;
  description: string;
  total_points: number;
  time_limit_minutes: number | null;
  max_attempts: number | null;
  passing_score: number | null;
  auto_grade: boolean;
  show_results_immediately: boolean;
  show_correct_answers: boolean;
  allow_review: boolean;
  is_published: boolean;
}

interface QuestionImage {
  id: string;
  url: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  position: string;
  caption?: string;
  alt_text?: string;
  display_width?: string;
  created_at: string;
}

interface Question {
  id: number;
  question_type: string;
  question_text: string;
  question_html?: string;
  points: number;
  order_index: number;
  settings?: any;
  answer_options: any[];
  correct_answers: any[];
}

interface AnswerOption {
  option_text: string;
  is_correct: boolean;
  order_index: number;
  blank_id?: number;
}

interface CorrectAnswer {
  answer_text: string;
  case_sensitive?: boolean;
  exact_match?: boolean;
  blank_id?: number;
}

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE",       label: "Trắc nghiệm 1 đáp án",   icon: "⭕" },
  { value: "MULTIPLE_CHOICE",     label: "Trắc nghiệm nhiều đáp án",icon: "☑️" },
  { value: "SHORT_ANSWER",        label: "Tự luận ngắn",            icon: "✍️" },
  { value: "ESSAY",               label: "Tự luận dài",             icon: "📝" },
  { value: "FILE_UPLOAD",         label: "Nộp file",                icon: "📎" },
  { value: "FILL_BLANK_TEXT",     label: "Điền từ (text)",          icon: "⬜" },
  { value: "FILL_BLANK_DROPDOWN", label: "Điền từ (dropdown)",      icon: "🔽" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeacherQuizManagePage() {
  const params = useParams();
  const router = useRouter();
  const quizId = parseInt(params.quizId as string);

  const { courseId, courseTitle, loading: breadcrumbLoading } = useQuizCourse(quizId);

  const [quiz,              setQuiz]              = useState<Quiz | null>(null);
  const [questions,         setQuestions]         = useState<Question[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [showQuestionForm,  setShowQuestionForm]  = useState(false);
  const [editingQuestion,   setEditingQuestion]   = useState<Question | null>(null);
  const [showQuizSettings,  setShowQuizSettings]  = useState(false);
  const [questionImages,    setQuestionImages]    = useState<QuestionImage[]>([]);

  // Fill Blank
  const [fillBlankSettings, setFillBlankSettings] = useState<FillBlankTextSettings | FillBlankDropdownSettings | null>(null);

  // Question form
  const [questionForm, setQuestionForm] = useState<{
    question_type: string;
    question_text: string;
    question_html: string;
    points: number;
    explanation: string;
    is_required: boolean;
    answer_options: AnswerOption[];
    correct_answers: CorrectAnswer[];
  }>({
    question_type: "SINGLE_CHOICE",
    question_text: "",
    question_html: "",
    points: 10,
    explanation: "",
    is_required: false,
    answer_options: [
      { option_text: "", is_correct: false, order_index: 1 },
      { option_text: "", is_correct: false, order_index: 2 },
    ],
    correct_answers: [],
  });
  const { uploadImage, uploading: imageUploading } = useMarkdownImage();

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => { loadQuizData(); }, [quizId]);

  const loadQuizData = async () => {
    try {
      const [quizData, questionsData] = await Promise.all([
        quizService.getQuiz(quizId),
        quizService.listQuestions(quizId),
      ]);
      setQuiz(quizData.data);
      setQuestions(questionsData.data || []);
    } catch {
      alert("Không thể tải quiz");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionImages = async (questionId: number) => {
    try {
      const data = await quizService.listQuestionImages(questionId);
      setQuestionImages(Array.isArray(data.data) ? data.data : []);
    } catch {
      setQuestionImages([]);
    }
  };

  // ── Question CRUD ────────────────────────────────────────────────────────

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const questionData: any = {
        quiz_id: quizId,
        question_type: questionForm.question_type,
        question_text: questionForm.question_text.trim(),
        points: parseFloat(String(questionForm.points)),
        order_index: questions.length + 1,
        is_required: questionForm.is_required === true,
      };

      if (questionForm.question_html?.trim()) questionData.question_html = questionForm.question_html.trim();
      if (questionForm.explanation?.trim())  questionData.explanation  = questionForm.explanation.trim();

      if (questionForm.question_type === "FILL_BLANK_TEXT") {
        if (!fillBlankSettings || fillBlankSettings.blank_count === 0) {
          alert("Vui lòng thêm ít nhất 1 blank"); return;
        }
        questionData.settings = fillBlankSettings;
        questionData.correct_answers = questionForm.correct_answers.map(a => ({
          answer_text: a.answer_text.trim(),
          blank_id: a.blank_id,
          case_sensitive: a.case_sensitive === true,
          exact_match: a.exact_match === true,
        }));
        questionData.answer_options = [];

      } else if (questionForm.question_type === "FILL_BLANK_DROPDOWN") {
        if (!fillBlankSettings || fillBlankSettings.blank_count === 0) {
          alert("Vui lòng thêm ít nhất 1 blank"); return;
        }
        questionData.settings = fillBlankSettings;
        questionData.answer_options = questionForm.answer_options
          .filter(o => o.option_text?.trim())
          .map(o => ({ option_text: o.option_text.trim(), is_correct: o.is_correct, order_index: o.order_index, blank_id: o.blank_id }));
        questionData.correct_answers = [];

      } else if (["SINGLE_CHOICE","MULTIPLE_CHOICE"].includes(questionForm.question_type)) {
        const valid = questionForm.answer_options.filter(o => o.option_text?.trim());
        if (valid.length < 2) { alert("Cần ít nhất 2 đáp án"); return; }
        if (!valid.some(o => o.is_correct)) { alert("Phải chọn ít nhất 1 đáp án đúng"); return; }
        questionData.answer_options = valid.map((o, i) => ({
          option_text: o.option_text.trim(), is_correct: o.is_correct, order_index: i + 1,
        }));
        questionData.correct_answers = [];

      } else if (questionForm.question_type === "SHORT_ANSWER") {
        const valid = questionForm.correct_answers.filter(a => a.answer_text?.trim());
        questionData.correct_answers = valid.map(a => ({
          answer_text: a.answer_text.trim(), case_sensitive: a.case_sensitive === true, exact_match: a.exact_match === true,
        }));
        questionData.answer_options = [];

      } else {
        questionData.answer_options = [];
        questionData.correct_answers = [];
      }

      if (editingQuestion) {
        const { ...updateData } = questionData;
        await quizService.updateQuestion(editingQuestion.id, updateData);
        alert("Cập nhật câu hỏi thành công!");
      } else {
        const res = await quizService.createQuestion(quizId, questionData);
        alert("Thêm câu hỏi thành công!");
        if (res.data?.id) {
          const newQ = res.data;
          setEditingQuestion(newQ);
          setQuestionForm({
            question_type: newQ.question_type, question_text: newQ.question_text,
            question_html: newQ.question_html || "", points: newQ.points,
            explanation: newQ.explanation || "", is_required: newQ.is_required || false,
            answer_options: newQ.answer_options || [], correct_answers: newQ.correct_answers || [],
          });
          setFillBlankSettings(newQ.settings || null);
          await loadQuestionImages(newQ.id);
          await loadQuizData();
          return;
        }
      }

      resetQuestionForm();
      await loadQuizData();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Không thể lưu câu hỏi");
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Xóa câu hỏi này?")) return;
    try {
      await quizService.deleteQuestion(id);
      await loadQuizData();
    } catch { alert("Không thể xóa câu hỏi"); }
  };

  const startEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQuestionForm({
      question_type: q.question_type, question_text: q.question_text,
      question_html: q.question_html || "", points: q.points,
      explanation: "", is_required: false,
      answer_options: q.answer_options || [], correct_answers: q.correct_answers || [],
    });
    setFillBlankSettings(q.settings || null);
    setShowQuestionForm(true);
    loadQuestionImages(q.id);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question_type: "SINGLE_CHOICE", question_text: "", question_html: "",
      points: 10, explanation: "", is_required: false,
      answer_options: [
        { option_text: "", is_correct: false, order_index: 1 },
        { option_text: "", is_correct: false, order_index: 2 },
      ],
      correct_answers: [],
    });
    setFillBlankSettings(null);
    setEditingQuestion(null);
    setShowQuestionForm(false);
    setQuestionImages([]);
  };

  const addAnswerOption = () =>
    setQuestionForm(f => ({
      ...f,
      answer_options: [...f.answer_options, { option_text: "", is_correct: false, order_index: f.answer_options.length + 1 }],
    }));

  const removeAnswerOption = (i: number) =>
    setQuestionForm(f => ({ ...f, answer_options: f.answer_options.filter((_, j) => j !== i) }));

  const updateAnswerOption = (i: number, field: string, val: any) =>
    setQuestionForm(f => ({
      ...f,
      answer_options: f.answer_options.map((o, j) => {
        if (j === i) return { ...o, [field]: val };
        if (field === "is_correct" && val === true && f.question_type === "SINGLE_CHOICE") return { ...o, is_correct: false };
        return o;
      }),
    }));

  const addCorrectAnswer = () =>
    setQuestionForm(f => ({
      ...f,
      correct_answers: [...f.correct_answers, { answer_text: "", case_sensitive: false, exact_match: true }],
    }));

  const removeCorrectAnswer = (i: number) =>
    setQuestionForm(f => ({ ...f, correct_answers: f.correct_answers.filter((_, j) => j !== i) }));

  const updateCorrectAnswer = (i: number, field: string, val: any) =>
    setQuestionForm(f => ({
      ...f,
      correct_answers: f.correct_answers.map((a, j) => j === i ? { ...a, [field]: val } : a),
    }));

  const handleOptionImageUpload = async (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const url = await uploadImage(file);
          const currentVal = questionForm.answer_options[index].option_text;
          const newVal = currentVal + (currentVal ? "\n" : "") + `![image](${url})`;
          updateAnswerOption(index, "option_text", newVal);
        } catch (err: any) {
          alert(err.message);
        }
      }
    };
    input.click();
  };

  // ── Quiz settings save ────────────────────────────────────────────────────

  const handleSaveQuizSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    try {
      await quizService.updateQuiz(quiz.id, {
        time_limit_minutes: quiz.time_limit_minutes,
        max_attempts:       quiz.max_attempts,
        passing_score:      quiz.passing_score,
        total_points:       quiz.total_points,
        auto_grade:         quiz.auto_grade,
        show_results_immediately: quiz.show_results_immediately,
        show_correct_answers: quiz.show_correct_answers,
        allow_review:       quiz.allow_review,
        is_published:       quiz.is_published,
      });
      alert("Đã cập nhật cài đặt quiz");
      setShowQuizSettings(false);
      await loadQuizData();
    } catch { alert("Không thể cập nhật cài đặt"); }
  };

  // ── Breadcrumb items ──────────────────────────────────────────────────────

  const breadcrumbItems = [
    { label: "Khóa học", href: "/lms/teacher/courses" },
    ...(courseId
      ? [{ label: breadcrumbLoading ? "..." : courseTitle, href: `/lms/teacher/courses/${courseId}/content` }]
      : []),
    { label: quiz?.title ?? "Quiz", href: courseId ? `/lms/teacher/courses/${courseId}/content` : undefined },
    { label: "Quản lý câu hỏi" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Breadcrumb ── */}
      <BreadcrumbNav items={breadcrumbItems} />

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">{quiz?.title}</h1>
          {quiz?.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{quiz.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuizSettings(true)}
            className="
              flex items-center gap-1.5 px-4 py-2 text-sm font-medium
              border border-slate-300 dark:border-slate-700
              text-slate-700 dark:text-slate-300
              bg-white dark:bg-slate-900
              hover:bg-slate-50 dark:hover:bg-slate-800
              rounded-xl active:scale-95 transition-all
            "
          >
            ⚙️ Cài đặt Quiz
          </button>
          <button
            onClick={() => router.push(`/lms/teacher/quiz/${quizId}/grading`)}
            className="
              flex items-center gap-1.5 px-4 py-2 text-sm font-semibold
              bg-green-600 hover:bg-green-700 text-white
              rounded-xl active:scale-95 transition-all shadow-sm
            "
          >
            ✓ Chấm bài
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng câu hỏi", value: questions.length,    color: "text-blue-700 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
          { label: "Tổng điểm",    value: quiz?.total_points,   color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" },
          { label: "Thời gian",    value: quiz?.time_limit_minutes ? `${quiz.time_limit_minutes} phút` : "∞", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
          { label: "Trạng thái",   value: quiz?.is_published ? "Đã xuất bản" : "Nháp", color: quiz?.is_published ? "text-green-700 dark:text-green-400" : "text-slate-600 dark:text-slate-400", bg: quiz?.is_published ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 ${bg}`}>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Question list card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Danh sách câu hỏi</h2>
          <button
            onClick={() => setShowQuestionForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all shadow-sm"
          >
            + Thêm câu hỏi
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Chưa có câu hỏi nào</p>
            <p className="text-sm text-slate-500 mt-1">Thêm câu hỏi đầu tiên để học sinh có thể làm quiz.</p>
            <button
              onClick={() => setShowQuestionForm(true)}
              className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all"
            >
              + Thêm câu hỏi đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => {
              const images: QuestionImage[] = q.settings?.images || [];
              return (
                <div key={q.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium">
                          Câu {i + 1}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                          {QUESTION_TYPES.find(t => t.value === q.question_type)?.icon}{" "}
                          {QUESTION_TYPES.find(t => t.value === q.question_type)?.label}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-800 font-semibold">
                          {q.points} điểm
                        </span>
                        {images.length > 0 && (
                          <span className="text-xs px-2.5 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                            🖼️ {images.length} ảnh
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50 line-clamp-2 prose-p:inline prose-p:m-0">
                        <MarkdownRenderer content={q.question_text} />
                      </div>

                      {/* Image preview */}
                      {images.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {images.slice(0, 4).map((img: QuestionImage) => (
                            <img key={img.id} src={img.url} alt={img.alt_text || img.file_name}
                              className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                          ))}
                          {images.length > 4 && (
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-slate-500">+{images.length - 4}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options preview */}
                      {q.answer_options?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {q.answer_options.map((opt: any, idx: number) => (
                            <div key={idx} className={`text-xs px-2 py-1 rounded flex items-start gap-2 ${opt.is_correct ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
                              <span>{opt.is_correct ? "✓" : "○"}</span>
                              <div className="flex-1 min-w-0 prose-p:inline prose-p:m-0 truncate">
                                <MarkdownRenderer content={opt.option_text} />
                                {opt.blank_id && <span className="ml-1 text-blue-500 inline-block">[BLANK_{opt.blank_id}]</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => startEditQuestion(q)}
                        className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        ✏️ Sửa
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.id)}
                        className="px-3 py-1.5 text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Question Editor Panel (Slide-over) ── */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${showQuestionForm ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetQuestionForm} />
        <div className={`absolute top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 transition-transform duration-500 transform ${showQuestionForm ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex flex-col h-full">
            {/* Panel header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
                </h2>
                {editingQuestion && (
                  <p className="text-xs text-slate-500 mt-1">
                    ID: {editingQuestion.id} · {questionImages.length} hình ảnh đính kèm
                  </p>
                )}
              </div>
              <button 
                onClick={resetQuestionForm}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Loại câu hỏi *</label>
                <select
                  value={questionForm.question_type}
                  onChange={e => {
                    setQuestionForm(f => ({ ...f, question_type: e.target.value }));
                    setFillBlankSettings(null);
                  }}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  disabled={!!editingQuestion}
                  required
                >
                  {QUESTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>

              {/* Fill blank editors */}
              {questionForm.question_type === "FILL_BLANK_TEXT" && (
                <FillBlankTextEditor
                  questionText={questionForm.question_text}
                  settings={fillBlankSettings as FillBlankTextSettings || { blank_count: 0, blanks: [] }}
                  correctAnswers={questionForm.correct_answers as FillBlankTextCorrectAnswer[]}
                  onChange={(text, settings, answers) => {
                    setQuestionForm(f => ({ ...f, question_text: text, correct_answers: answers }));
                    setFillBlankSettings(settings);
                  }}
                />
              )}

              {questionForm.question_type === "FILL_BLANK_DROPDOWN" && (
                <FillBlankDropdownEditor
                  questionText={questionForm.question_text}
                  settings={fillBlankSettings as FillBlankDropdownSettings || { blank_count: 0, blanks: [] }}
                  options={questionForm.answer_options as FillBlankDropdownOption[]}
                  onChange={(text, settings, options) => {
                    setQuestionForm(f => ({ ...f, question_text: text, answer_options: options }));
                    setFillBlankSettings(settings);
                  }}
                />
              )}

              {/* Regular question text with Markdown */}
              {!["FILL_BLANK_TEXT","FILL_BLANK_DROPDOWN"].includes(questionForm.question_type) && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nội dung câu hỏi (Markdown) *</label>
                  <MarkdownEditor
                    value={questionForm.question_text}
                    onChange={val => setQuestionForm(f => ({ ...f, question_text: val }))}
                    placeholder="Nhập nội dung câu hỏi… Hỗ trợ Markdown, dán ảnh trực tiếp."
                  />
                </div>
              )}

              {/* Choice options with Markdown support */}
              {["SINGLE_CHOICE","MULTIPLE_CHOICE"].includes(questionForm.question_type) && (
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Đáp án *</label>
                  <div className="space-y-3">
                    {questionForm.answer_options.map((opt, i) => (
                      <div key={i} className="flex gap-3 group items-start">
                        <div className="pt-3.5">
                          <input
                            type={questionForm.question_type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                            checked={opt.is_correct}
                            onChange={e => updateAnswerOption(i, "is_correct", e.target.checked)}
                            className="w-5 h-5 cursor-pointer text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="relative">
                            <textarea
                              value={opt.option_text}
                              onChange={e => updateAnswerOption(i, "option_text", e.target.value)}
                              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px] resize-none"
                              placeholder={`Đáp án ${i + 1}`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => handleOptionImageUpload(i)}
                              disabled={imageUploading}
                              className="absolute bottom-3 right-3 p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 hover:text-blue-600 shadow-sm transition-all"
                              title="Chèn ảnh"
                            >
                              🖼️
                            </button>
                          </div>
                        </div>
                        {questionForm.answer_options.length > 2 && (
                          <div className="pt-3.5">
                            <button type="button" onClick={() => removeAnswerOption(i)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors">
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addAnswerOption}
                    className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm font-semibold rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                    + Thêm đáp án
                  </button>
                </div>
              )}

              {/* Short answer correct answers */}
              {questionForm.question_type === "SHORT_ANSWER" && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Đáp án đúng mong muốn</label>
                  <div className="space-y-3">
                    {questionForm.correct_answers.map((ans, i) => (
                      <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-3">
                        <div className="flex gap-2">
                          <input type="text" value={ans.answer_text}
                            onChange={e => updateCorrectAnswer(i, "answer_text", e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            placeholder="Nhập đáp án..." />
                          {questionForm.correct_answers.length > 1 && (
                            <button type="button" onClick={() => removeCorrectAnswer(i)}
                              className="px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors">✕</button>
                          )}
                        </div>
                        <div className="flex gap-4">
                          {[["case_sensitive","Phân biệt hoa/thường"],["exact_match","Khớp chính xác"]].map(([field,label]) => (
                            <label key={field} className="flex items-center gap-2 cursor-pointer group">
                              <input type="checkbox" checked={!!(ans as any)[field]}
                                onChange={e => updateCorrectAnswer(i, field, e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600" />
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addCorrectAnswer}
                    className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm font-semibold rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                    + Thêm đáp án chấp nhận
                  </button>
                </div>
              )}

              {/* Points + required */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số điểm *</label>
                  <input
                    type="number"
                    value={questionForm.points}
                    onChange={e => setQuestionForm(f => ({ ...f, points: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                    min="0" step="0.5" required
                  />
                </div>
                <div className="flex items-center pt-7">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={questionForm.is_required}
                      onChange={e => setQuestionForm(f => ({ ...f, is_required: e.target.checked }))}
                      className="w-5 h-5 rounded text-blue-600 border-slate-300 dark:border-slate-600" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">Bắt buộc trả lời</span>
                  </label>
                </div>
              </div>

              {/* Legacy images (collapsible) */}
              {editingQuestion && (questionImages.length > 0) && (
                <details className="group border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <summary className="px-5 py-4 cursor-pointer bg-slate-50 dark:bg-slate-800 list-none flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">🖼️ Ảnh đính kèm (Legacy)</span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-5">
                    <QuestionImageUploader
                      questionId={editingQuestion.id}
                      images={questionImages}
                      onImagesUpdate={() => { loadQuestionImages(editingQuestion.id); loadQuizData(); }}
                    />
                  </div>
                </details>
              )}
            </form>

            {/* Panel actions */}
            <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-900 z-10">
              <button type="button" onClick={handleCreateQuestion}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md">
                {editingQuestion ? "💾 Cập nhật câu hỏi" : "✅ Lưu câu hỏi"}
              </button>
              <button type="button" onClick={resetQuestionForm}
                className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold transition-all">
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quiz settings modal ── */}
      {showQuizSettings && quiz && (
        <QuizSettingsModal
          quiz={quiz}
          onChange={setQuiz}
          onSave={handleSaveQuizSettings}
          onClose={() => setShowQuizSettings(false)}
        />
      )}
    </div>
  );
}