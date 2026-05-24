"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy-load the video panel
const VideoGenPanel = dynamic(
  () => import("@/components/lms/teacher/video/VideoGenPanel"),
  { ssr: false, loading: () => <div className="py-12 text-center text-sm text-slate-400 font-medium">Đang tải cấu hình video...</div> }
);

/**
 * /lms/teacher/courses/[courseId]/video
 *
 * Video overview generation dashboard tab.
 */
export default function CourseVideoPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  return (
    <div className="space-y-6">
      <VideoGenPanel courseId={id} targetType="course" />
    </div>
  );
}
