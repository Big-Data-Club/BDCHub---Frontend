import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import lmsService from "@/services/lms/lmsService";
import quizService from "@/services/lms/quizService";

export interface QuestionImage {
  id: string;
  url: string;
  file_name: string;
  caption?: string;
  alt_text?: string;
  display_width?: string;
  position?: string;
}

export interface Question {
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

export interface Quiz {
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

export interface QuizTakingAttempt {
  id: number;
  quiz_id: number;
  started_at: string;
  time_spent_seconds: number;
}

export function useQuizTaking(quizId: number, courseId: number, shouldStart: boolean) {
  const router = useRouter();
  const hasStartedRef = useRef(false);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<QuizTakingAttempt | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSaveRequests, setActiveSaveRequests] = useState(0);
  const activeSaveRequestsRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [fetchingServerAnswers, setFetchingServerAnswers] = useState(false);
  const [serverAnswers, setServerAnswers] = useState<{ [key: number]: any }>({});

  const updateActiveSaveRequests = (val: number | ((prev: number) => number)) => {
    if (typeof val === "function") {
      setActiveSaveRequests((prev) => {
        const next = val(prev);
        activeSaveRequestsRef.current = next;
        return next;
      });
    } else {
      setActiveSaveRequests(val);
      activeSaveRequestsRef.current = val;
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

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (!attempt) return;

    if (activeSaveRequestsRef.current > 0) {
      if (!isAutoSubmit) {
        alert("Hệ thống đang lưu các câu trả lời cuối cùng của bạn. Vui lòng đợi trong giây lát rồi thử lại.");
        return;
      }
      let retries = 30;
      while (activeSaveRequestsRef.current > 0 && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries--;
      }
    }

    const unansweredRequired = questions.filter((q) => {
      if (!q.is_required) return false;
      const answer = answers[q.id];
      if (!answer) return true;
      if (q.question_type === "FILE_UPLOAD") return !answer.file_name;
      return false;
    });

    if (unansweredRequired.length > 0 && !isAutoSubmit) {
      if (!confirm(`Còn ${unansweredRequired.length} câu hỏi bắt buộc chưa trả lời. Bạn có chắc muốn nộp bài?`)) {
        return;
      }
    }

    if (!isAutoSubmit && !confirm("Bạn có chắc muốn nộp bài? Bạn sẽ không thể chỉnh sửa sau khi nộp.")) {
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
  }, [attempt, questions, answers, courseId, quizId, router]);

  const handleAutoSubmit = useCallback(async () => {
    if (submitting) return;
    alert("Hết giờ! Quiz sẽ được tự động nộp.");
    await handleSubmit(true);
  }, [submitting, handleSubmit]);

  const startQuiz = useCallback(async () => {
    if (isNaN(quizId) || isNaN(courseId)) return;
    try {
      const [quizData, courseRes] = await Promise.all([
        quizService.getQuiz(quizId),
        lmsService.getCourse(courseId),
      ]);
      const quizInfo = quizData.data;
      setQuiz(quizInfo);
      setCourseTitle(courseRes?.data?.title || "Khóa học");

      const attemptsResponse = await quizService.getMyQuizAttempts(quizId);
      const attempts = attemptsResponse?.data || [];
      const inProgressAttempt = attempts.find((a: any) => a.status === "IN_PROGRESS");

      if (!shouldStart && !inProgressAttempt) {
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
          const elapsed = Math.floor((Date.now() - new Date(inProgressAttempt.started_at).getTime()) / 1000);
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

      const questionsData = await quizService.listQuestions(quizId);
      let questionList = questionsData.data || [];

      if (quizInfo.shuffle_questions) {
        questionList = shuffleArray(questionList);
      }

      if (quizInfo.shuffle_answers) {
        questionList = questionList.map((q: Question) => ({
          ...q,
          answer_options: q.answer_options ? shuffleArray(q.answer_options) : [],
        }));
      }

      setQuestions(questionList);

      if (quizInfo.time_limit_minutes && !inProgressAttempt) {
        setTimeLeft(quizInfo.time_limit_minutes * 60);
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error starting quiz:", error);
      alert(error.response?.data?.message || "Không thể bắt đầu quiz");
      router.push(`/lms/student/courses/${courseId}/quiz/${quizId}/history`);
    }
  }, [quizId, courseId, shouldStart, router]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

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
  }, [quiz, timeLeft, handleAutoSubmit]);

  const handleAnswerChange = async (questionId: number, answerData: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerData }));
    if (attempt) {
      updateActiveSaveRequests((prev) => prev + 1);
      try {
        await quizService.submitAnswer(attempt.id, {
          attempt_id: attempt.id,
          question_id: questionId,
          answer_data: answerData,
        });
      } catch (error) {
        console.error("Error saving answer:", error);
      } finally {
        updateActiveSaveRequests((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleOpenReviewModal = async () => {
    if (activeSaveRequestsRef.current > 0) {
      alert("Hệ thống đang lưu các câu trả lời cuối cùng của bạn. Vui lòng đợi trong giây lát rồi thử lại.");
      return;
    }
    setShowReviewModal(true);
    setFetchingServerAnswers(true);
    try {
      if (attempt) {
        const response = await quizService.getAttemptAnswers(attempt.id);
        const serverAnswersMap: { [key: number]: any } = {};
        response.data?.forEach((answer: any) => {
          serverAnswersMap[answer.question_id] = answer.answer_data;
        });
        setServerAnswers(serverAnswersMap);
      }
    } catch (error) {
      console.error("Error fetching server answers:", error);
      setServerAnswers(answers);
    } finally {
      setFetchingServerAnswers(false);
    }
  };

  return {
    quiz,
    questions,
    attempt,
    answers,
    currentQuestion,
    setCurrentQuestion,
    loading,
    submitting,
    activeSaveRequests,
    timeLeft,
    courseTitle,
    showImageModal,
    setShowImageModal,
    showReviewModal,
    setShowReviewModal,
    fetchingServerAnswers,
    serverAnswers,
    handleAnswerChange,
    handleSubmit,
    handleOpenReviewModal,
  };
}
