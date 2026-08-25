"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { BarChart3 } from "lucide-react";

// Lazy-load heavy component for performance
const AIQuizGenPanel = dynamic(
  () => import("@/components/lms/teacher/views/AIQuizGenPanel").then(m => ({ default: m.AIQuizGenPanel })),
  { ssr: false, loading: () => <div className="py-12 text-center text-xs text-slate-400">Đang tải AI Panel…</div> },
);

/**
 * /lms/teacher/courses/[courseId]/analytics
 *
 * Knowledge Hub:
 * - Knowledge graph manager (nodes) + draft question review.
 * - Quiz authoring moved to the "Thư viện đề thi" tab, where AI generation
 *   draws context from the knowledge graph + existing bank questions
 *   automatically (no manual node picking).
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
            Kiến thức & Quản lý AI Khóa học
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Quản lý cây kiến thức và duyệt câu hỏi AI. Sinh đề đã chuyển sang tab Thư viện đề thi.
          </p>
        </div>
      </div>

      {/* ── Knowledge nodes + drafts ── */}
      <section aria-label="AI Quiz & Knowledge Nodes">
        <AIQuizGenPanel courseId={id} />
      </section>
    </div>
  );
}
