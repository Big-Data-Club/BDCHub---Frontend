"use client";

import { useParams } from "next/navigation";
import QuizReviewModal from "@/components/lms/student/QuizReviewModal";

export default function AttemptResultPage() {
  const params = useParams();
  const attemptId = parseInt(params.attemptId as string);
  const courseId = parseInt(params.courseId as string);

  return (
    <QuizReviewModal
      attemptId={attemptId}
      courseId={courseId}
      onBack={() => window.history.back()}
    />
  );
}