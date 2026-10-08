"use client";
import { useCallback, useEffect, useState } from "react";
import lmsService from "@/services/lms/lmsService";
import type { Enrollment } from "@/types/lms/course";
export function useFlashcardCourses() {
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    void lmsService.getMyEnrollments("ACCEPTED").then((rows: Enrollment[]) => {
      if (!active) return;
      const available = (rows ?? []).filter(c => c.course_status !== "ARCHIVED").map(c => ({ id: c.course_id, title: c.course_title || `Khóa học ${c.course_id}` }));
      setCourses(available);
      const requested = Number(new URLSearchParams(window.location.search).get("courseId"));
      setCourseId(available.find(c => c.id === requested)?.id ?? available[0]?.id ?? null);
    }).catch(() => { if (active) setError("Chưa tải được khóa học. Hãy thử lại."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const select = useCallback((id: number) => {
    setCourseId(id);
    const url = new URL(window.location.href); url.searchParams.set("courseId", String(id));
    window.history.replaceState(null, "", url);
  }, []);
  return { courses, courseId, select, loading, error, retry: () => setRetry(v => v + 1) };
}
