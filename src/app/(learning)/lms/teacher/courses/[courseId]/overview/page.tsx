"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import lmsService from "@/services/lms/lmsService";
import { OverviewTab } from "@/components/lms/teacher/views/OverviewTab";
import { Alert, PageLoader } from "@/components/lms/shared";
import { Course, Section } from "@/types";

/**
 * /lms/teacher/courses/[courseId]/overview
 *
 * Streamlined course overview tab displaying curriculum summary,
 * co-teachers management, and teacher quick tools.
 */
export default function CourseOverviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  const [course, setCourse]   = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [courseRes, sectionsRes] = await Promise.all([
        lmsService.getCourse(id),
        lmsService.listSections(id),
      ]);
      setCourse(courseRes?.data ?? null);
      setSections(sectionsRes?.data ?? []);
    } catch {
      setError("Không thể tải thông tin khóa học.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader message="Đang tải tổng quan…" />;

  return (
    <div className="space-y-5">
      {error && <Alert type="error">{error}</Alert>}
      {course && <OverviewTab course={course} sections={sections} />}
    </div>
  );
}
