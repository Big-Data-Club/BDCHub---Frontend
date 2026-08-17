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
  () => import("@/components/lms/teacher/views/AIQuizGenPanel").then(m => ({ default: m.AIQuizGenPanel })),
  { ssr: false, loading: () => <div className="py-12 text-center text-xs text-slate-400">Đang tải AI Panel…</div> },
);

/**
 * /lms/teacher/courses/[courseId]/analytics
 *
 * Consolidated Analytics & AI Hub:
 * 1. AI Class Knowledge-Gap Heatmap (Visual Analytics)
 * 2. AI Quiz Generator & Knowledge Node Manager
 */
export default function CourseAnalyticsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  return (
    <div className="space-y-6 animate-fadeIn motion-reduce:animate-none duration-300">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60 dark:border-blue-500/15">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-cyan-400 flex-shrink-0" />
            Báo cáo & Trung tâm AI Khóa học
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Phân tích lỗ hổng kiến thức sinh viên, quản lý cây bài học (Knowledge Graph) và tạo đề thi tự động.
          </p>
        </div>
      </div>

      {/* ── Section 1: Visual Learning Analytics ── */}
      <section aria-label="Visual Heatmap Analytics">
        <AIHeatmapSection courseId={id} role="teacher" />
      </section>

      {/* ── Section 2: AI Quiz Center & Knowledge Nodes ── */}
      <section aria-label="AI Quiz & Knowledge Nodes">
        <AIQuizGenPanel courseId={id} />
      </section>
    </div>
  );
}

