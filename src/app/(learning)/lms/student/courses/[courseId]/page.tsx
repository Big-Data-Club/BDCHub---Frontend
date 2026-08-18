"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentCourseRoot() {
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();

  useEffect(() => {
    if (courseId) {
      router.replace(`/lms/student/courses/${courseId}/learn`);
    }
  }, [courseId, router]);

  return null;
}