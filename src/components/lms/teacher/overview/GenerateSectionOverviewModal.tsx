"use client";

import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import BaseModal from "@/components/lms/shared/BaseModal";
import { Button } from "@/components/ui/button";
import { sectionOverviewService } from "@/services/lms/sectionOverviewService";

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
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">Tạo bài học tổng quan chương</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">AI tự động tổng hợp nội dung và tạo bộ câu hỏi trắc nghiệm</div>
          </div>
        </div>
      }
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-all duration-200"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold rounded-xl shadow-sm active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BookOpen className="w-4 h-4" />
            )}
            <span>Tạo tổng quan</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Section label */}
        <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-0.5">
            Chương đang chọn
          </p>
          <p className="font-semibold text-blue-950 dark:text-slate-100 text-sm truncate">
            {sectionTitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          AI sẽ tổng hợp toàn bộ nội dung trong chương, tạo ra bài học tổng quan dạng Markdown và bộ câu hỏi trắc nghiệm bao phủ kiến thức trọng tâm.
        </p>

        {/* Language */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Ngôn ngữ đầu ra
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "vi" | "en")}
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-blue-500/20 rounded-xl bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm font-medium"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Question count */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-blue-500/20 rounded-xl bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm font-medium"
          />
          <p className="text-xs text-slate-400">Cho phép chọn từ 5 đến 30 câu</p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-xs text-red-700 dark:text-red-300 font-medium">
            {error}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
