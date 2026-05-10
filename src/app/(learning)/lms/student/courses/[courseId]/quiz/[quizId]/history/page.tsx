"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import quizService from "@/services/quizService";
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Play,
} from "lucide-react";

interface QuizAttempt {
  id: number;
  quiz_id: number;
  attempt_number: number;
  started_at: string;
  submitted_at: string | null;
  time_spent_seconds: number | null;
  earned_points: number | null;
  percentage: number | null;
  is_passed: boolean | null;
  status: string;
  quiz_title: string;
  quiz_total_points: number;
  passing_score: number | null;
  answered_questions: number;
  correct_answers: number;
}

export default function QuizHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = parseInt(params.quizId as string);
  const courseId = parseInt(params.courseId as string);

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAttempts();
  }, [quizId]);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const response = await quizService.getMyQuizAttempts(quizId);
      setAttempts(response.data || []);
    } catch (err: any) {
      console.error("Error loading attempts:", err);
      setError(err.response?.data?.error || "Không thể tải lịch sử làm bài");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getStatusBadge = (attempt: QuizAttempt) => {
    if (attempt.status === "IN_PROGRESS") {
      return (
        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
          Đang làm
        </span>
      );
    }

    // Kiểm tra nếu còn câu chưa chấm (số câu trả lời != số câu đúng + sai)
    const totalGraded = attempt.correct_answers + 
      (attempt.answered_questions - attempt.correct_answers);
    const hasUngradedQuestions = attempt.answered_questions > totalGraded;

    if (hasUngradedQuestions || attempt.earned_points === null) {
      return (
        <span className="px-3 py-1 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium flex items-center gap-1 border border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="w-3 h-3" />
          Điểm tạm thời
        </span>
      );
    }

    if (attempt.is_passed === true) {
      return (
        <span className="px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1 border border-green-200 dark:border-green-800">
          <CheckCircle className="w-3 h-3" />
          Đạt
        </span>
      );
    }

    if (attempt.is_passed === false) {
      return (
        <span className="px-3 py-1 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium flex items-center gap-1 border border-red-200 dark:border-red-800">
          <XCircle className="w-3 h-3" />
          Chưa đạt
        </span>
      );
    }

    return (
      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
        Chưa chấm
      </span>
    );
  };

  const getScoreDisplay = (attempt: QuizAttempt) => {
    const hasUngradedQuestions = attempt.answered_questions > 
      (attempt.correct_answers + (attempt.answered_questions - attempt.correct_answers));

    if (attempt.earned_points !== null) {
      return (
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {attempt.earned_points.toFixed(1)}/{attempt.quiz_total_points}
          </p>
          {attempt.percentage !== null && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {hasUngradedQuestions ? "(Tạm thời) " : ""}
              {attempt.percentage.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }

    return (
      <div>
        <p className="text-2xl font-bold text-slate-400 dark:text-slate-600">--/--</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">Chưa có điểm</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-8 shadow-lg border border-slate-200 dark:border-slate-800">
          <XCircle className="w-16 h-16 text-red-600 dark:text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-center text-slate-900 dark:text-slate-50 mb-2">Có lỗi xảy ra</h3>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-all"
            >
              Quay lại
            </button>
            <button
              onClick={loadAttempts}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-transparent border-b backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="mb-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {attempts[0]?.quiz_title || "Lịch sử làm bài"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Tổng số lần làm: {attempts.length}
              </p>
            </div>
            <Button
              onClick={() => router.push(`/lms/student/courses/${courseId}/quiz/${quizId}/take?start=true`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Làm bài mới
            </Button>
          </div>
        </div>
      </div>

      {/* Attempts List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {attempts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Chưa có lần làm bài nào
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Bạn chưa làm bài quiz này. Hãy bắt đầu lần làm đầu tiên!
            </p>
            <Button
              onClick={() => router.push(`/lms/student/courses/${courseId}/quiz/${quizId}/take`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Bắt đầu làm bài
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                        Lần làm #{attempt.attempt_number}
                      </h3>
                      {getStatusBadge(attempt)}
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-500">Bắt đầu</p>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {formatDate(attempt.started_at)}
                          </p>
                        </div>
                      </div>

                      {attempt.submitted_at && (
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">Thời gian làm</p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {formatDuration(attempt.time_spent_seconds)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Điểm số</p>
                        {getScoreDisplay(attempt)}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-6 flex-wrap text-sm text-slate-600 dark:text-slate-400">
                      <span>
                        Đã trả lời:{" "}
                        <strong className="text-slate-900 dark:text-slate-100">
                          {attempt.answered_questions}
                        </strong>{" "}
                        câu
                      </span>
                      <span>
                        Đúng:{" "}
                        <strong className="text-green-600 dark:text-green-400">
                          {attempt.correct_answers}
                        </strong>
                      </span>
                      {attempt.passing_score !== null && (
                        <span>
                          Chuẩn đầu ra:{" "}
                          <strong className="text-slate-900 dark:text-slate-100">
                            {attempt.passing_score.toFixed(0)}%
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {attempt.status !== "IN_PROGRESS" ? (
                      <button
                        onClick={() =>
                          router.push(
                            `/lms/student/courses/${courseId}/quiz/${quizId}/result/${attempt.id}`
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-medium transition-all active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          router.push(`/lms/student/courses/${courseId}/quiz/${quizId}/take`)
                        }
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm"
                      >
                        <Play className="w-4 h-4" />
                        Tiếp tục
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}