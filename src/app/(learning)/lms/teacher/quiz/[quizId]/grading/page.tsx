"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import quizService from "@/services/quizService";
import { BreadcrumbNav } from "@/components/lms/BreadcrumbNav";
import { useQuizCourse } from "@/hooks/useQuizCourse";
import {
  ArrowLeft, CheckCircle, FileText,
  User, Calendar, Award, MessageSquare,
  Filter, Search,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnswerForGrading {
  id: number;
  attempt_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  question_id: number;
  question_text: string;
  question_type: string;
  points: number;
  answer_data: any;
  points_earned: number | null;
  feedback: string;
  answered_at: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeacherGradingPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = parseInt(params.quizId as string);

  const { courseId, courseTitle, quizTitle, loading: breadcrumbLoading } = useQuizCourse(quizId);

  const [answers,         setAnswers]         = useState<AnswerForGrading[]>([]);
  const [filteredAnswers, setFilteredAnswers] = useState<AnswerForGrading[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [gradingId,       setGradingId]       = useState<number | null>(null);
  const [gradeForm,       setGradeForm]       = useState({ points_earned: 0, grader_feedback: "" });

  // Filters
  const [filterGraded,       setFilterGraded]       = useState<"all" | "graded" | "ungraded">("all");
  const [searchStudent,      setSearchStudent]      = useState("");
  const [filterQuestionType, setFilterQuestionType] = useState("all");

  useEffect(() => { loadAnswers(); }, [quizId]);

  useEffect(() => {
    let list = [...answers];
    if (filterGraded === "graded")   list = list.filter(a => a.points_earned !== null);
    if (filterGraded === "ungraded") list = list.filter(a => a.points_earned === null);
    if (searchStudent)               list = list.filter(a => a.student_name.toLowerCase().includes(searchStudent.toLowerCase()));
    if (filterQuestionType !== "all") list = list.filter(a => a.question_type === filterQuestionType);
    setFilteredAnswers(list);
  }, [answers, filterGraded, searchStudent, filterQuestionType]);

  const loadAnswers = async () => {
    try {
      const data = await quizService.listAnswersForGrading(quizId);
      setAnswers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (answerId: number) => {
    try {
      await quizService.gradeAnswer(answerId, gradeForm);
      setGradingId(null);
      setGradeForm({ points_earned: 0, grader_feedback: "" });
      await loadAnswers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể chấm điểm");
    }
  };

  const startGrading = (a: AnswerForGrading) => {
    setGradingId(a.id);
    setGradeForm({ points_earned: a.points_earned || 0, grader_feedback: a.feedback || "" });
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  const questionTypeLabel: Record<string, string> = {
    ESSAY: "Tự luận", FILE_UPLOAD: "Nộp file", SHORT_ANSWER: "Trả lời ngắn",
  };

  const stats = {
    total:   answers.length,
    graded:  answers.filter(a => a.points_earned !== null).length,
    ungraded: answers.filter(a => a.points_earned === null).length,
  };

  const questionTypes = [...new Set(answers.map(a => a.question_type))];

  // ── Breadcrumb ─────────────────────────────────────────────────────────────

  const breadcrumbItems = [
    { label: "Khóa học", href: "/lms/teacher/courses" },
    ...(courseId
      ? [{ label: breadcrumbLoading ? "..." : courseTitle, href: `/lms/teacher/courses/${courseId}/content` }]
      : []),
    { label: quizTitle, href: `/lms/teacher/quiz/${quizId}/manage` },
    { label: "Chấm bài" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

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
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Chấm bài</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{quizTitle}</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <FileText  className="w-5 h-5" />, label: "Tổng số",   value: stats.total,    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800", color: "text-blue-700 dark:text-blue-400" },
          { icon: <CheckCircle className="w-5 h-5" />, label: "Đã chấm", value: stats.graded,   bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", color: "text-green-700 dark:text-green-400" },
          { icon: <Award    className="w-5 h-5" />, label: "Chưa chấm",  value: stats.ungraded, bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800", color: "text-yellow-700 dark:text-yellow-400" },
        ].map(({ icon, label, value, bg, color }) => (
          <div key={label} className={`rounded-2xl border p-4 flex items-center gap-4 ${bg}`}>
            <span className={color}>{icon}</span>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-50">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Graded status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Trạng thái chấm</label>
            <select
              value={filterGraded}
              onChange={e => setFilterGraded(e.target.value as any)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="all">Tất cả</option>
              <option value="graded">Đã chấm</option>
              <option value="ungraded">Chưa chấm</option>
            </select>
          </div>

          {/* Student search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                placeholder="Tên hoặc email…"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Question type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Loại câu hỏi</label>
            <select
              value={filterQuestionType}
              onChange={e => setFilterQuestionType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="all">Tất cả</option>
              {questionTypes.map(t => (
                <option key={t} value={t}>{questionTypeLabel[t] || t}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          Hiển thị {filteredAnswers.length} / {answers.length} câu trả lời
        </p>
      </div>

      {/* ── Answers list ── */}
      {filteredAnswers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            {answers.length === 0 ? "Không có câu trả lời nào" : "Không tìm thấy kết quả"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {answers.length === 0
              ? "Chưa có câu trả lời cần chấm điểm."
              : "Thử thay đổi bộ lọc để xem câu trả lời khác."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredAnswers.map(answer => (
            <div key={answer.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Answer header */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                          {answer.student_name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{answer.student_email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{formatDate(answer.answered_at)}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-full font-medium border border-blue-200 dark:border-blue-800">
                        {questionTypeLabel[answer.question_type] || answer.question_type}
                      </span>
                    </div>
                  </div>
                  {answer.points_earned !== null ? (
                    <div className="px-4 py-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800 text-right">
                      <p className="text-xs font-medium">Đã chấm</p>
                      <p className="text-lg font-bold">{answer.points_earned}/{answer.points} điểm</p>
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 rounded-xl border border-yellow-200 dark:border-yellow-800 text-right">
                      <p className="text-xs font-medium">Chưa chấm</p>
                      <p className="text-lg font-bold">Tối đa: {answer.points} điểm</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Question */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Câu hỏi</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{answer.question_text}</p>
              </div>

              {/* Student answer */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Câu trả lời của học sinh</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  {renderAnswerContent(answer.answer_data)}
                </div>
              </div>

              {/* Grading section */}
              <div className="px-6 py-4">
                {gradingId === answer.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Điểm * <span className="text-xs text-slate-400">(tối đa {answer.points})</span>
                        </label>
                        <input
                          type="number"
                          value={gradeForm.points_earned}
                          onChange={e => setGradeForm(f => ({ ...f, points_earned: parseFloat(e.target.value) }))}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          min="0" max={answer.points} step="0.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <MessageSquare className="w-3.5 h-3.5" /> Nhận xét
                      </label>
                      <textarea
                        value={gradeForm.grader_feedback}
                        onChange={e => setGradeForm(f => ({ ...f, grader_feedback: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                        rows={4}
                        placeholder="Nhập nhận xét cho học sinh…"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGrade(answer.id)}
                        className="flex items-center gap-1.5 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" /> Lưu điểm
                      </button>
                      <button
                        onClick={() => { setGradingId(null); setGradeForm({ points_earned: 0, grader_feedback: "" }); }}
                        className="px-5 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm rounded-xl transition-all"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => startGrading(answer)}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all"
                    >
                      {answer.points_earned !== null ? "Chỉnh sửa điểm" : "Chấm điểm"}
                    </button>

                    {answer.feedback && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                          <MessageSquare className="w-3.5 h-3.5" /> Nhận xét đã lưu
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{answer.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Render answer content ────────────────────────────────────────────────────

function renderAnswerContent(answerData: any) {
  if (!answerData) return <p className="text-sm text-slate-400 italic">Không có dữ liệu</p>;

  if (answerData.answer_text) {
    return <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium">{answerData.answer_text}</p>;
  }

  if (answerData.file_name) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-0.5">
            📎 <span className="font-semibold">{answerData.file_name}</span>
          </p>
          {answerData.file_size && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {(answerData.file_size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>
        {answerData.file_path && (
          <a
            href={`/files/${answerData.file_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl active:scale-95 transition-all"
          >
            Tải xuống →
          </a>
        )}
      </div>
    );
  }

  return <p className="text-sm text-slate-400 dark:text-slate-500 italic">Không có dữ liệu</p>;
}