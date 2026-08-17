"use client";

import { useEffect, useState } from "react";
import quizService from "@/services/quizService";
import lmsService from "@/services/lmsService";

export interface QuizCourseInfo {
  quizId:    number;
  quizTitle: string;
  contentId: number;
  courseId:  number;
  courseTitle: string;
  loading: boolean;
}

/**
 * useQuizCourse
 *
 * Resolves the full breadcrumb chain for a quiz page:
 *   quizId → quiz.content_id → content.section_id → section.course_id → course.title
 *
 * Usage:
 *   const { courseId, courseTitle, quizTitle, loading } = useQuizCourse(quizId);
 */
export function useQuizCourse(quizId: number): QuizCourseInfo {
  const [info, setInfo] = useState<QuizCourseInfo>({
    quizId,
    quizTitle: "...",
    contentId: 0,
    courseId:  0,
    courseTitle: "...",
    loading: true,
  });

  useEffect(() => {
    if (!quizId) return;

    let cancelled = false;

    const resolve = async () => {
      try {
        // Step 1: quiz → content_id + title
        const quizRes = await quizService.getQuiz(quizId);
        const quiz = quizRes?.data ?? quizRes;
        if (cancelled) return;

        const contentId = quiz?.content_id;
        const quizTitle = quiz?.title ?? "Quiz";

        if (!contentId) {
          setInfo(prev => ({ ...prev, quizTitle, loading: false }));
          return;
        }

        // Step 2: content → section_id
        const contentRes = await lmsService.getContent(contentId);
        const content = contentRes?.data ?? contentRes;
        if (cancelled) return;

        const sectionId = content?.section_id;
        if (!sectionId) {
          setInfo(prev => ({ ...prev, quizTitle, contentId, loading: false }));
          return;
        }

        // Step 3: section → course_id
        const sectionRes = await lmsService.getSection(sectionId);
        const section = sectionRes?.data ?? sectionRes;
        if (cancelled) return;

        const courseId = section?.course_id;
        if (!courseId) {
          setInfo(prev => ({ ...prev, quizTitle, contentId, loading: false }));
          return;
        }

        // Step 4: course → title
        const courseRes = await lmsService.getCourse(courseId);
        const course = courseRes?.data ?? courseRes;
        if (cancelled) return;

        setInfo({
          quizId,
          quizTitle,
          contentId,
          courseId,
          courseTitle: course?.title ?? "Khóa học",
          loading: false,
        });
      } catch {
        if (!cancelled) {
          setInfo(prev => ({ ...prev, loading: false }));
        }
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [quizId]);

  return info;
}