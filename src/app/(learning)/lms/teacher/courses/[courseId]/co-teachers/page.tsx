"use client";

import { redirect, useParams } from "next/navigation";
import { useEffect } from "react";

export default function LegacyCoTeachersRedirect() {
  const { courseId } = useParams<{ courseId: string }>();

  useEffect(() => {
    if (courseId) {
      redirect(`/lms/teacher/courses/${courseId}/overview`);
    }
  }, [courseId]);

  return (
    <div className="py-12 text-center text-sm text-slate-400">
      Đang chuyển hướng sang trang Tổng quan & Đồng giáo viên…
    </div>
  );
}
