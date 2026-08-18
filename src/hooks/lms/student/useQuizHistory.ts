import { useState, useEffect, useCallback } from "react";
import quizService from "@/services/lms/quizService";

export interface QuizAttempt {
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

export function useQuizHistory(quizId: number) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttempts = useCallback(async () => {
    if (isNaN(quizId)) return;
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
  }, [quizId]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  const quizTitle = attempts.length > 0 ? attempts[0].quiz_title : "";
  const passingScore = attempts.length > 0 ? attempts[0].passing_score : null;
  const bestScore = attempts.reduce<number | null>((best, att) => {
    if (att.percentage === null) return best;
    return best === null ? att.percentage : Math.max(best, att.percentage);
  }, null);
  const inProgressAttempt = attempts.find((a) => a.status === "IN_PROGRESS");

  return {
    attempts,
    loading,
    error,
    quizTitle,
    passingScore,
    bestScore,
    inProgressAttempt,
    loadAttempts,
  };
}
