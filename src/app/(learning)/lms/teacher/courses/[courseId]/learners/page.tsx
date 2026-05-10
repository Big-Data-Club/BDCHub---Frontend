"use client";

import { useParams } from "next/navigation";
import { LearnersTab } from "@/components/lms/teacher/page/LearnersTab";

/**
 * /lms/teacher/courses/[courseId]/learners
 *
 * Shows enrolled learners with ACCEPTED / REJECTED filter.
 */
export default function CourseLearnersPage() {
  const { courseId } = useParams<{ courseId: string }>();
  return <LearnersTab courseId={Number(courseId)} />;
}
