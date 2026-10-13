import { useEffect, useState } from "react";
import { learningScopeService } from "@/services/lms/learningScopeService";
import type { LearningScope, LearningScopeSection } from "@/types/lms/learning-scope";

export function useLearningScope(courseId: number, defaultWholeCourse = false) {
  const [selection, setSelection] = useState<LearningScope>({ whole_course: defaultWholeCourse, section_ids: [], content_ids: [] });
  const [sections, setSections] = useState<LearningScopeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setSections([]);
    setSelection({ whole_course: defaultWholeCourse, section_ids: [], content_ids: [] });
    learningScopeService.list(courseId).then((items) => {
      if (active) setSections(items);
    }).catch((err: unknown) => {
      if (active) setError(err instanceof Error ? err.message : "Không tải được chương và bài học.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseId, defaultWholeCourse, revision]);
  const hasSelection = !loading && !error && sections.some((s) => s.contents.length > 0) && (
    selection.whole_course || selection.section_ids.length > 0 || selection.content_ids.length > 0
  );
  return { sections, selection, setSelection, loading, error, hasSelection,
    retry: () => setRevision((r) => r + 1),
    payload: { section_ids: selection.section_ids, content_ids: selection.content_ids } };
}
