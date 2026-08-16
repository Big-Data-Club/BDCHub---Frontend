"use client";

import { redirect, useParams } from "next/navigation";
import { useEffect } from "react";

export default function LegacyLearnersRedirect() {
  const { courseId } = useParams<{ courseId: string }>();

  useEffect(() => {
    if (courseId) {
      redirect(`/lms/teacher/courses/${courseId}/students`);
    }
  }, [courseId]);

  return (
    <div className="py-12 text-center text-sm text-slate-400">
      Đang chuyển hướng sang trang Học viên & Tiến độ…
    </div>
  );
}
