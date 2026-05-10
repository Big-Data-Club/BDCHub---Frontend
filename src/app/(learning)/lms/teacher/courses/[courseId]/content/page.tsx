"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import lmsService from "@/services/lmsService";
import { ContentTab } from "@/components/lms/teacher/page/ContentTab";
import { Alert, PageLoader } from "@/components/lms/shared";
import { Section } from "@/types";

/**
 * /lms/teacher/courses/[courseId]/content
 *
 * Owns the sections state and delegates all rendering/CRUD to ContentTab.
 * Being a separate page means navigating back to this tab triggers a
 * fresh render and data re-fetch automatically.
 */
export default function CourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const loadSections = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await lmsService.listSections(id);
      setSections(res?.data ?? []);
    } catch {
      setError("Không thể tải danh sách chương.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadSections(); }, [loadSections]);

  if (loading) return <PageLoader message="Đang tải nội dung…" />;

  return (
    <div className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}
      <ContentTab
        courseId={id}
        sections={sections}
        onSectionsChange={loadSections}
      />
    </div>
  );
}
