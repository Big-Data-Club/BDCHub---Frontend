"use client";

/**
 * GenerateSectionOverviewModal
 *
 * Configures and triggers an AI section overview generation job.
 * Teacher sets language + question count, then the job is queued.
 */

import { useState } from "react";
import { BookOpen, Loader2, X } from "lucide-react";
import { sectionOverviewService } from "@/services/sectionOverviewService";

interface Props {
  courseId: number;
  sectionId: number;
  sectionTitle: string;
  onClose: () => void;
  onJobCreated: (jobId: number) => void;
}

export function GenerateSectionOverviewModal({
  courseId,
  sectionId,
  sectionTitle,
  onClose,
  onJobCreated,
}: Props) {
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [questionCount, setQuestionCount] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await sectionOverviewService.generate(courseId, sectionId, {
        language,
        question_count: questionCount,
      });
      onJobCreated(res.job_id);
    } catch (e) {
      const msg =
        (e as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Không khởi tạo được tác vụ";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-slate-50">
              Tạo bài học tổng quan chương
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Section label */}
          <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 px-4 py-3">
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-0.5">
              Chương đang chọn
            </p>
            <p className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm truncate">
              {sectionTitle}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400">
            AI sẽ tổng hợp toàn bộ nội dung trong chương, tạo ra{" "}
            <strong>bài học tổng quan dạng Markdown</strong> và một{" "}
            <strong>bộ câu hỏi trắc nghiệm</strong> bao phủ các kiến thức
            trọng tâm. Bạn có thể chỉnh sửa và xuất bản sau khi hoàn thành.
          </p>

          {/* Language */}
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
              Ngôn ngữ đầu ra
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "vi" | "en")}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Question count */}
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
              Số câu hỏi trắc nghiệm ({questionCount} câu)
            </label>
            <input
              type="number"
              min={5}
              max={30}
              step={1}
              value={questionCount}
              onChange={(e) =>
                setQuestionCount(
                  Math.max(5, Math.min(30, Number(e.target.value) || 10)),
                )
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1">Từ 5 đến 30 câu</p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-2 disabled:opacity-60 transition-all duration-200 active:scale-95"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BookOpen className="w-4 h-4" />
            )}
            Tạo tổng quan
          </button>
        </div>
      </div>
    </div>
  );
}
