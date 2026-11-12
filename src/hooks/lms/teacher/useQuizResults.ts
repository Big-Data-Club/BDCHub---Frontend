"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import quizService from "@/services/lms/quizService";
import type {
  QuizInsights,
  QuizResults,
  QuizResultAnswer,
  QuizResultAttempt,
} from "@/types/lms/quizResults";

function savedJob(key: string, value?: string | null): string | null {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else if (value !== undefined) sessionStorage.setItem(key, value);
    else return sessionStorage.getItem(key);
  } catch {
    /* Restricted browser storage: polling still works in memory. */
  }
  return null;
}

export function useQuizResults(quizId: number) {
  const [report, setReport] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [attemptPage, setAttemptPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setAttemptPage(1);
      setStudentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);
  const [insights, setInsights] = useState<QuizInsights | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedAttempt, setSelectedAttempt] =
    useState<QuizResultAttempt | null>(null);
  const [answers, setAnswers] = useState<QuizResultAnswer[] | null>(null);
  const [answerError, setAnswerError] = useState(false);
  const alive = useRef(true);
  const selection = useRef(0);
  const request = useRef(0);
  const reload = useCallback(async () => {
    const version = ++request.current;
    setLoading(true);
    setError("");
    try {
      const data = await quizService.getQuizResults(quizId, {
        search: query,
        attempt_page: attemptPage,
        student_page: studentPage,
      });
      if (alive.current && version === request.current) setReport(data);
    } catch {
      if (alive.current && version === request.current)
        setError(
          "Không tải được kết quả. Hãy kiểm tra quyền truy cập và thử lại.",
        );
    } finally {
      if (alive.current && version === request.current) setLoading(false);
    }
  }, [quizId, query, attemptPage, studentPage]);
  useEffect(() => {
    alive.current = true;
    setReport(null);
    setInsights(null);
    setSelectedAttempt(null);
    setJobId(savedJob(`quiz-insights:${quizId}`));
    const invalidate = () => {
      selection.current++;
      request.current++;
    };
    return () => {
      alive.current = false;
      invalidate();
    };
  }, [quizId]);
  useEffect(() => {
    void reload();
  }, [reload]);
  useEffect(() => {
    if (!jobId) return;
    let canceled = false;
    let timer: ReturnType<typeof setTimeout>;
    const started = Date.now();
    let polls = 0;
    const poll = async () => {
      if (Date.now() - started > 10 * 60 * 1000) {
        setError(
          "Phân tích đang mất nhiều thời gian. Tải lại trang để tiếp tục theo dõi.",
        );
        setAnalyzing(false);
        return;
      }
      setAnalyzing(true);
      try {
        const status = await quizService.getQuizInsightsStatus(quizId, jobId);
        if (canceled) return;
        if (status.status === "completed" && status.result) {
          setInsights(status.result);
          setAnalyzing(false);
        } else if (status.status === "failed") {
          setError(
            "AI chưa phân tích được kết quả. Hãy thử lại sau hoặc liên hệ quản trị viên.",
          );
          setAnalyzing(false);
          savedJob(`quiz-insights:${quizId}`, null);
        } else
          timer = setTimeout(
            poll,
            Math.min(10000, 2000 * Math.pow(1.5, polls++)) +
              Math.random() * 250,
          );
      } catch {
        if (!canceled) {
          setError(
            "Chưa nhận được kết quả AI. Tải lại trang để tiếp tục theo dõi.",
          );
          setAnalyzing(false);
        }
      }
    };
    void poll();
    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [quizId, jobId]);
  const analyze = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    setError("");
    try {
      const job = await quizService.analyzeQuizResults(quizId);
      if (!alive.current) return;
      savedJob(`quiz-insights:${quizId}`, job.job_id);
      setJobId(job.job_id);
    } catch {
      if (alive.current) {
        setError(
          "Không tạo được phân tích AI. Cần có bài đã chấm và dịch vụ AI sẵn sàng.",
        );
        setAnalyzing(false);
      }
    }
  };
  const selectAttempt = async (id: number, attempt?: QuizResultAttempt) => {
    setSelectedAttempt(
      attempt ?? report?.attempts.find((a) => a.id === id) ?? null,
    );
    setAnswers(null);
    setAnswerError(false);
    const version = ++selection.current;
    try {
      const data = await quizService.getTeacherAttemptAnswers(quizId, id);
      if (alive.current && version === selection.current) setAnswers(data);
    } catch {
      if (alive.current && version === selection.current) setAnswerError(true);
    }
  };
  return {
    report,
    loading,
    error,
    search,
    setSearch,
    insights,
    analyzing,
    analyze,
    selectedAttempt,
    attemptPage,
    setAttemptPage,
    studentPage,
    setStudentPage,
    answers,
    answerError,
    selectAttempt,
    reload,
  };
}
