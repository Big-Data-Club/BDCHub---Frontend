/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import lmsService from "@/services/lmsService";
import quizService from "@/services/quizService";
import { Button } from "@/components/ui/button";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/BreadcrumbNav";
import FillBlankTextStudent from "@/components/lms/student/FillBlankTextStudent";
import FillBlankDropdownStudent from "@/components/lms/student/FillBlankDropdownStudent";
import FileUploadQuestion from "@/components/lms/student/FileUploadQuestion";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import type {
  FillBlankTextSettings,
  FillBlankTextStudentAnswer,
  FillBlankDropdownSettings,
  FillBlankDropdownOption,
  FillBlankDropdownStudentAnswer,
} from "@/types";

interface QuestionImage {
  id: string;
  url: string;
  file_name: string;
  caption?: string;
  alt_text?: string;
  display_width?: string;
  position?: string;
}

interface Question {
  id: number;
  question_type: string;
  question_text: string;
  question_html?: string;
  points: number;
  order_index: number;
  settings?: any;
  answer_options?: any[];
  is_required: boolean;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  instructions: string;
  time_limit_minutes: number | null;
  total_points: number;
  passing_score: number | null;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
}

interface QuizAttempt {
  id: number;
  quiz_id: number;
  started_at: string;
  time_spent_seconds: number;
}

export default function StudentQuizTakingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = parseInt(params.quizId as string);
  const courseId = parseInt(params.courseId as string);
  
  const shouldStart = searchParams.get("start") === "true";
  const hasStartedRef = useRef(false);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  useEffect(() => {
    startQuiz();
  }, [quizId]);

  useEffect(() => {
    if (shouldStart && hasStartedRef.current) {
      router.replace(`/lms/student/courses/${courseId}/quiz/${quizId}/take`, { scroll: false });
    }
  }, [shouldStart, quizId, router]);

  // Timer countdown
  useEffect(() => {
    if (!quiz?.time_limit_minutes || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeLeft]);

  const startQuiz = async () => {
    try {
      // 1. Load Quiz & Course info
      const [quizData, courseRes] = await Promise.all([
        quizService.getQuiz(quizId),
        lmsService.getCourse(courseId)
      ]);
      const quizInfo = quizData.data;
      setQuiz(quizInfo);
      setCourseTitle(courseRes?.data?.title || "Khóa học");

      // 2. Kiểm tra attempts hiện tại
      const attemptsResponse = await quizService.getMyQuizAttempts(quizId);
      const attempts = attemptsResponse?.data || [];
      const inProgressAttempt = attempts.find((a: any) => a.status === "IN_PROGRESS");

      if (!shouldStart && !inProgressAttempt) {
        router.replace(`/lms/student/courses/${courseId}/quiz/${quizId}/history`);
        return;
      }

      if (!inProgressAttempt && hasStartedRef.current) {
        router.replace(`/lms/student/courses/${courseId}/quiz/${quizId}/history`);
        return;
      }

      let attemptInfo;
      if (inProgressAttempt) {
        attemptInfo = inProgressAttempt;
        
        try {
          const answersResponse = await quizService.getAttemptAnswers(inProgressAttempt.id);
          const savedAnswers: { [key: number]: any } = {};
          answersResponse.data?.forEach((answer: any) => {
            savedAnswers[answer.question_id] = answer.answer_data;
          });
          setAnswers(savedAnswers);
        } catch (error) {
          console.error("Error loading saved answers:", error);
        }
        
        if (quizInfo.time_limit_minutes) {
          const elapsed = Math.floor(
            (Date.now() - new Date(inProgressAttempt.started_at).getTime()) / 1000
          );
          const totalSeconds = quizInfo.time_limit_minutes * 60;
          const remaining = Math.max(0, totalSeconds - elapsed);
          setTimeLeft(remaining);
        }
      } else if (shouldStart && !hasStartedRef.current) {
        const attemptData = await quizService.startQuizAttempt(quizId);
        attemptInfo = attemptData.data;
        
        hasStartedRef.current = true;
        router.replace(`/lms/student/courses/${courseId}/quiz/${quizId}/take`, { scroll: false });
        
        if (quizInfo.time_limit_minutes) {
          setTimeLeft(quizInfo.time_limit_minutes * 60);
        }
      }

      setAttempt(attemptInfo);

      // Load questions
      const questionsData = await quizService.listQuestions(quizId);
      let questionList = questionsData.data || [];

      // Shuffle questions if needed
      if (quizInfo.shuffle_questions) {
        questionList = shuffleArray(questionList);
      }

      // Shuffle answers if needed
      if (quizInfo.shuffle_answers) {
        questionList = questionList.map((q: Question) => ({
          ...q,
          answer_options: q.answer_options ? shuffleArray(q.answer_options) : [],
        }));
      }

      setQuestions(questionList);

      // Set timer
      if (quizInfo.time_limit_minutes) {
        setTimeLeft(quizInfo.time_limit_minutes * 60);
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error starting quiz:", error);
      alert(error.response?.data?.message || "Không thể bắt đầu quiz");
      router.push(`/lms/student/courses/${courseId}/quiz/${quizId}/history`);
    }
  };

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleAnswerChange = async (questionId: number, answerData: any) => {
    // Store in local state
    setAnswers({ ...answers, [questionId]: answerData });

    // Auto-save answer to backend
    if (attempt) {
      try {
        await quizService.submitAnswer(attempt.id, {
          attempt_id: attempt.id,
          question_id: questionId,
          answer_data: answerData,
        });
      } catch (error) {
        console.error("Error saving answer:", error);
      }
    }
  };

  const handleAutoSubmit = async () => {
    if (submitting) return;
    alert("Hết giờ! Quiz sẽ được tự động nộp.");
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!attempt) return;

    // Check required questions
    const unansweredRequired = questions.filter((q) => {
      if (!q.is_required) return false;
      
      const answer = answers[q.id];
      if (!answer) return true;
      
      // Special check for FILE_UPLOAD: must have file_name
      if (q.question_type === "FILE_UPLOAD") {
        return !answer.file_name;
      }
      
      return false;
    });

    if (unansweredRequired.length > 0) {
      if (!confirm(`Còn ${unansweredRequired.length} câu hỏi bắt buộc chưa trả lời. Bạn có chắc muốn nộp bài?`)) {
        return;
      }
    }

    if (!confirm("Bạn có chắc muốn nộp bài? Bạn sẽ không thể chỉnh sửa sau khi nộp.")) {
      return;
    }

    try {
      setSubmitting(true);
      await quizService.submitQuiz(attempt.id);
      alert("Đã nộp bài thành công!");
      router.push(`/lms/student/courses/${courseId}/quiz/${quizId}/result/${attempt.id}`);
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      alert(error.response?.data?.message || "Không thể nộp bài");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isQuestionAnswered = (question: Question) => {
    const answer = answers[question.id];
    if (!answer) return false;
    
    // For FILE_UPLOAD, check if file has been uploaded
    if (question.question_type === "FILE_UPLOAD") {
      return !!answer.file_name;
    }
    
    // For FILL_BLANK types, check if at least one blank is filled
    if (question.question_type === "FILL_BLANK_TEXT" || question.question_type === "FILL_BLANK_DROPDOWN") {
      return answer.blanks && answer.blanks.length > 0;
    }
    
    // For MULTIPLE_CHOICE, check if at least one option is selected
    if (question.question_type === "MULTIPLE_CHOICE") {
      return answer.selected_option_ids && answer.selected_option_ids.length > 0;
    }
    
    // For other types, just check if answer exists
    return true;
  };

  const renderQuestionImages = (images: QuestionImage[] | undefined, position: string = "above_question") => {
    if (!images || images.length === 0) return null;

    const positionImages = images.filter(img => (img.position || "above_question") === position);
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
                onClick={() => setShowImageModal(image.url)}
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-sm p-2">
                  {image.caption}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowImageModal(image.url)}
              className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="Xem ảnh lớn"
            >
              🔍
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderQuestion = (question: Question) => {
    const questionImages = question.settings?.images || [];

    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 p-8">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-2 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-lg font-bold text-lg border border-blue-200 dark:border-blue-800">
                Câu {currentQuestion + 1}/{questions.length}
              </span>
              <span className="px-4 py-2 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 rounded-lg font-semibold border border-purple-200 dark:border-purple-800">
                {question.points} điểm
              </span>
              {question.is_required && (
                <span className="px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800">
                  * Bắt buộc
                </span>
              )}
              {questionImages.length > 0 && (
                <span className="px-4 py-2 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800">
                  🖼️ {questionImages.length} ảnh
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Images ABOVE question */}
        {renderQuestionImages(questionImages, "above_question")}

        {/* Question Text */}
        <div className="mb-6">
          <div className="text-xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed prose prose-slate dark:prose-invert max-w-none">
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
        {renderQuestionImages(questionImages, "below_question")}

        {/* Answer Input */}
        <div className="mt-6">
          {question.question_type === "SINGLE_CHOICE" && (
            <div className="space-y-3">
              {question.answer_options?.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[question.id]?.selected_option_id === option.id
                      ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                      : "border-slate-300 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="mt-1 w-5 h-5 flex-shrink-0">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      checked={answers[question.id]?.selected_option_id === option.id}
                      onChange={() =>
                        handleAnswerChange(question.id, {
                          selected_option_id: option.id,
                          type: "single_choice",
                        })
                      }
                      className="w-5 h-5"
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
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[question.id]?.selected_option_ids?.includes(option.id)
                      ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                      : "border-slate-300 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="mt-1 w-5 h-5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={answers[question.id]?.selected_option_ids?.includes(option.id) || false}
                      onChange={(e) => {
                        const currentIds = answers[question.id]?.selected_option_ids || [];
                        const newIds = e.target.checked
                          ? [...currentIds, option.id]
                          : currentIds.filter((id: number) => id !== option.id);
                        handleAnswerChange(question.id, {
                          selected_option_ids: newIds,
                          type: "multiple_choice",
                        });
                      }}
                      className="w-5 h-5"
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
              value={answers[question.id]?.answer_text || ""}
              onChange={(e) =>
                handleAnswerChange(question.id, {
                  answer_text: e.target.value,
                  type: "short_answer",
                })
              }
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Nhập câu trả lời của bạn..."
            />
          )}

          {question.question_type === "ESSAY" && (
            <textarea
              value={answers[question.id]?.answer_text || ""}
              onChange={(e) =>
                handleAnswerChange(question.id, {
                  answer_text: e.target.value,
                  type: "essay",
                })
              }
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              rows={8}
              placeholder="Nhập bài luận của bạn..."
            />
          )}

          {/* FILL_BLANK_TEXT */}
          {question.question_type === "FILL_BLANK_TEXT" && (
            <FillBlankTextStudent
              questionText={question.question_text}
              settings={(question.settings as FillBlankTextSettings) || { blank_count: 0, blanks: [] }}
              value={(answers[question.id] as FillBlankTextStudentAnswer) || { blanks: [] }}
              onChange={(newAnswer) => handleAnswerChange(question.id, newAnswer)}
              disabled={false}
              showCorrectAnswers={false}
            />
          )}

          {/* FILL_BLANK_DROPDOWN */}
          {question.question_type === "FILL_BLANK_DROPDOWN" && (
            <FillBlankDropdownStudent
              questionText={question.question_text}
              settings={(question.settings as FillBlankDropdownSettings) || { blank_count: 0, blanks: [] }}
              options={(question.answer_options as FillBlankDropdownOption[]) || []}
              value={(answers[question.id] as FillBlankDropdownStudentAnswer) || { blanks: [] }}
              onChange={(newAnswer) => handleAnswerChange(question.id, newAnswer)}
              disabled={false}
              showCorrectAnswers={false}
            />
          )}

          {/* FILE_UPLOAD */}
          {question.question_type === "FILE_UPLOAD" && (
            <FileUploadQuestion
              questionId={question.id}
              value={answers[question.id] || null}
              onChange={(fileData) => handleAnswerChange(question.id, fileData)}
              disabled={false}
              maxFileSize={question.settings?.max_file_size || 100}
              allowedExtensions={question.settings?.allowed_extensions}
              required={question.is_required}
              placeholder={question.settings?.placeholder || "Nộp bài làm của bạn"}
            />
          )}
        </div>

        {/* Images AT BOTTOM */}
        {renderQuestionImages(questionImages, "bottom")}
      </div>
    );
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Học tập", href: "/lms/student" },
    { label: courseTitle || "...", href: `/lms/student/courses/${courseId}/learn` },
    { label: quiz?.title ? `Quiz: ${quiz.title}` : "Quiz" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-4">
      <div className="max-w-4xl mx-auto px-4 mb-4">
        <BreadcrumbNav items={breadcrumbItems} />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{quiz?.title}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">{quiz?.description}</p>
            </div>
            {timeLeft !== null && (
              <div className={`px-6 py-3 rounded-lg font-bold text-xl ${
                timeLeft < 300 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              }`}>
                ⏱️ {formatTime(timeLeft)}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>Tiến độ</span>
              <span>{questions.filter(q => isQuestionAnswered(q)).length}/{questions.length} câu đã trả lời</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${(questions.filter(q => isQuestionAnswered(q)).length / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        {questions.length > 0 && renderQuestion(questions[currentQuestion])}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 gap-4">
          <Button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Câu trước
          </Button>

          <div className="flex gap-2 flex-wrap justify-center">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  currentQuestion === idx
                    ? "bg-blue-600 text-white"
                    : isQuestionAnswered(questions[idx])
                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-700"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-300 dark:border-slate-700"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Câu sau →
            </Button>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setShowImageModal(null)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕ Đóng
            </button>
            <img
              src={showImageModal}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}