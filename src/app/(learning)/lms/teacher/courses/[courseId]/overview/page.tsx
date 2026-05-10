"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Eye } from "lucide-react";
import lmsService from "@/services/lmsService";
import { OverviewTab } from "@/components/lms/teacher/page/OverviewTab";
import { Alert, PageLoader, PrimaryBtn } from "@/components/lms/shared";
import { Course, Section } from "@/types";

/**
 * /lms/teacher/courses/[courseId]/overview
 *
 * Displays the full course details grid (level, category, sections count)
 * and the ordered list of sections. The compact course header (title,
 * description, edit button) is rendered by the parent layout.tsx so it
 * remains visible across all tabs.
 */
export default function CourseOverviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  const [course, setCourse]   = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading]  = useState(true);
  const [publishing, setPublishing] = useState(false);
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

  const handlePublish = async () => {
    if (!confirm("Xuất bản khóa học này? Học viên sẽ có thể đăng ký.")) return;
    setPublishing(true);
    try {
      await lmsService.publishCourse(id);
      await load();
    } catch {
      setError("Không thể xuất bản khóa học.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <PageLoader message="Đang tải tổng quan…" />;

  return (
    <div className="space-y-5">
      {error && <Alert type="error">{error}</Alert>}

      {/* Publish action — only for DRAFT courses */}
      {course?.status === "DRAFT" && (
        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Khóa học đang ở trạng thái Nháp
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Xuất bản để học viên có thể tìm thấy và đăng ký.
            </p>
          </div>
          <PrimaryBtn
            size="sm"
            loading={publishing}
            icon={<Eye className="w-4 h-4" />}
            onClick={handlePublish}
          >
            Xuất bản ngay
          </PrimaryBtn>
        </div>
      )}

      {course && <OverviewTab course={course} sections={sections} />}
    </div>
  );
}
