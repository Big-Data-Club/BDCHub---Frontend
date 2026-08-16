"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Sparkles, BarChart3 } from "lucide-react";

// Lazy-load heavy components for performance
const AIHeatmapSection = dynamic(
  () => import("@/components/lms/AIHeatmapSection").then(m => ({ default: m.AIHeatmapSection })),
  { ssr: false, loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" /> },
);

const AIQuizGenPanel = dynamic(
  () => import("@/components/lms/teacher/page/AIQuizGenPanel").then(m => ({ default: m.AIQuizGenPanel })),
  { ssr: false, loading: () => <div className="py-12 text-center text-sm text-slate-400">Đang tải AI Panel…</div> },
);

/**
 * /lms/teacher/courses/[courseId]/analytics
 *
 * Consolidated Analytics & AI Hub:
 * 1. AI Class Knowledge-Gap Heatmap (Visual Analytics on top)
 * 2. AI Quiz Generator & Knowledge Node Manager
 */
export default function CourseAnalyticsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  return (
    <div className="space-y-10">
      {/* ── Section 1: Visual Learning Analytics ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-950/30 text-blue-600 dark:text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Báo cáo & Bản đồ Lỗ hổng Kiến thức
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Phân tích mức độ nắm bắt bài học của cả lớp để kịp thời hỗ trợ các nội dung học sinh đang gặp khó khăn.
            </p>
          </div>
        </div>

        <AIHeatmapSection courseId={id} role="teacher" />
      </section>

      {/* Divider line */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-blue-500/20 to-transparent" />

      {/* ── Section 2: AI Quiz Center & Knowledge Nodes ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Trung tâm Trợ lý AI & Ngân hàng Đề thi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý Cây kiến thức (Knowledge Graph) và khởi tạo câu hỏi trắc nghiệm tự động từ tài liệu khóa học.
            </p>
          </div>
        </div>

        <AIQuizGenPanel courseId={id} />
      </section>
    </div>
  );
}
