"use client";

import { useParams } from "@/lib/tenant/navigation";
import { QuestionBankView } from "@/components/lms/teacher/question-bank/QuestionBankView";

export default function QuestionBankPage() {
  const { courseId } = useParams<{ courseId: string }>();
  return <QuestionBankView key={courseId} courseId={Number(courseId)} />;
}
