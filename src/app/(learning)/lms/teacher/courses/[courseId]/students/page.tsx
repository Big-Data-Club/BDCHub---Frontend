"use client";

import { useParams } from "next/navigation";
import { StudentsTab } from "@/components/lms/teacher/page/StudentTab";

/**
 * /lms/teacher/courses/[courseId]/students
 *
 * Shows per-student progress, quiz averages, last activity,
 * and a detailed side panel on row selection.
 */
export default function CourseStudentsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  return <StudentsTab courseId={Number(courseId)} />;
}
