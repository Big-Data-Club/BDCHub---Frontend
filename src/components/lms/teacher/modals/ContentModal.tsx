"use client";

/**
 * ContentModal (refactored)
 *
 * This component is intentionally thin - it owns the shared form fields
 * (title, description, type selector, order_index, is_mandatory) and the
 * submit/cancel buttons.  All type-specific UI is delegated to the
 * content-forms/ components.
 *
 * Refactoring rationale
 * ─────────────────────
 * The previous version was ~450 lines with every content-type's UI
 * inlined. That made it hard to understand, test, or extend.  The new
 * structure keeps each type's concerns isolated:
 *
 *   TextContentForm              → markdown editor
 *   VideoContentForm             → YouTube / Server / URL
 *   DocumentContentForm          → file upload
 *   ImageContentForm             → file upload + URL
 *   QuizContentForm              → QuizSettingsForm wrapper
 *   ForumAnnouncementContentForm → info card (no upload needed)
 */

import { FilePlus } from "lucide-react";
import { Select } from "@/components/lms/shared";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import BaseModal from "@/components/lms/shared/BaseModal";
import lmsService from "@/services/lms/lmsService";
import quizService from "@/services/lms/quizService";
import { Content, ContentType, FileInfo } from "@/types";
import { toast } from "sonner";

import { TextContentForm }              from "../forms/TextContentForm";
import { VideoContentForm }             from "../forms/VideoContentForm";
import { DocumentContentForm,
         ImageContentForm }             from "../forms/FileContentForms";
import { QuizContentForm }              from "../forms/QuizContentForm";
import { ForumAnnouncementContentForm } from "../forms/ForumAnnouncementContentForm";
import { QuizSettings } from "../quiz/QuizSettingsForm";
import type { ContentFormState } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "TEXT",         label: "Văn bản"  },
  { value: "VIDEO",        label: "Video"    },
  { value: "DOCUMENT",     label: "Tài liệu" },
  { value: "IMAGE",        label: "Hình ảnh" },
  { value: "QUIZ",         label: "Quiz"     },
  { value: "FORUM",        label: "Diễn đàn" },
  { value: "ANNOUNCEMENT", label: "Thông báo"},
];

const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  title: "",
  description: "",
  instructions: "",
  time_limit_minutes: undefined,
  available_from: undefined,
  available_until: undefined,
  max_attempts: undefined,
  shuffle_questions: false,
  shuffle_answers: false,
  passing_score: undefined,
  total_points: 100,
  auto_grade: true,
  show_results_immediately: true,
  show_correct_answers: true,
  allow_review: true,
  show_feedback: true,
  is_published: true,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContentModalProps {
  sectionId: number;
  existingContents: Content[];
  onClose: () => void;
  onSuccess: (content: Content) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContentModal({
  sectionId,
  existingContents,
  onClose,
  onSuccess,
}: ContentModalProps) {
  // ── Shared state ───────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<ContentFormState>({
    type:        "TEXT",
    title:       "",
    description: "",
    order_index: existingContents.length + 1,
    is_mandatory: false,
    metadata:    {},
  });

  const [quizSettings, setQuizSettings] = useState<QuizSettings>(DEFAULT_QUIZ_SETTINGS);
  const [loading, setLoading]           = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const update = (updates: Partial<ContentFormState>) =>
    setFormData(prev => ({ ...prev, ...updates }));

  const handleTypeChange = (newType: ContentType) => {
    update({ type: newType, metadata: {} });
    // Sync quiz title when switching to QUIZ
    if (newType === "QUIZ") {
      setQuizSettings(prev => ({ ...prev, title: formData.title, description: formData.description }));
    }
  };

  const handleTitleChange = (title: string) => {
    update({ title });
    if (formData.type === "QUIZ") {
      setQuizSettings(prev => ({ ...prev, title }));
    }
  };

  const handleDescriptionChange = (description: string) => {
    update({ description });
    if (formData.type === "QUIZ") {
      setQuizSettings(prev => ({ ...prev, description }));
    }
  };

  const handleFileUploaded = (fileInfo: FileInfo) => {
    if (!formData.title) update({ title: fileInfo.file_name });
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): string | null => {
    if (!formData.title.trim()) return "Vui lòng nhập tiêu đề.";
    if (formData.type === "VIDEO" && !formData.metadata?.file_path && !formData.metadata?.video_url) {
      return "Vui lòng upload video hoặc nhập URL video.";
    }
    if (formData.type === "DOCUMENT" && !formData.metadata?.file_path) {
      return "Vui lòng upload tài liệu.";
    }
    if (formData.type === "IMAGE" && !formData.metadata?.file_path && !formData.metadata?.image_url) {
      return "Vui lòng upload hình ảnh hoặc nhập URL.";
    }
    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    // Build final metadata
    const metadata = { ...formData.metadata };
    if (formData.type === "TEXT")  metadata.content       = metadata.content ?? "";
    if (formData.type === "QUIZ")  metadata.quiz_settings = quizSettings;

    try {
      setLoading(true);
      const contentResponse = await lmsService.createContent(sectionId, {
        ...formData,
        metadata: Object.keys(metadata).length ? metadata : undefined,
      });

      // For QUIZ: create the quiz record linked to the new content
      if (formData.type === "QUIZ" && contentResponse.data) {
        try {
          await quizService.createQuizWithContent(contentResponse.data.id, quizSettings);
        } catch {
          toast.error("Nội dung đã được tạo nhưng có lỗi khi tạo quiz. Hãy vào Chỉnh sửa để thử lại.");
        }
      }

      toast.success("Tạo nội dung thành công!");
      onSuccess(contentResponse.data as Content);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Lỗi khi tạo nội dung.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render type-specific form section ─────────────────────────────────────

  const sharedProps = {
    formData,
    onChange: update,
    onFileUploaded: handleFileUploaded,
    disabled: loading,
  };

  const typeForm = (() => {
    switch (formData.type) {
      case "TEXT":         return <TextContentForm {...sharedProps} />;
      case "VIDEO":        return <VideoContentForm {...sharedProps} />;
      case "DOCUMENT":     return <DocumentContentForm {...sharedProps} />;
      case "IMAGE":        return <ImageContentForm {...sharedProps} />;
      case "QUIZ":         return (
        <QuizContentForm
          {...sharedProps}
          quizSettings={quizSettings}
          onQuizSettingsChange={setQuizSettings}
        />
      );
      case "FORUM":
      case "ANNOUNCEMENT": return <ForumAnnouncementContentForm {...sharedProps} />;
      default:             return null;
    }
  })();

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-cyan-400">
            <FilePlus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">Thêm nội dung mới</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tạo tài liệu, bài giảng video, hoặc bài kiểm tra</div>
          </div>
        </div>
      }
      size="xl"
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-all duration-200"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold rounded-xl shadow-sm active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? "Đang tạo…" : "Tạo nội dung"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Content type selector */}
        <div>
          <Select
            label="Loại nội dung *"
            value={formData.type}
            onValueChange={(val) => handleTypeChange(val as ContentType)}
            disabled={loading}
            options={CONTENT_TYPES.map((ct) => ({
              value: ct.value,
              label: ct.label,
            }))}
          />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Tiêu đề <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={loading}
            required
            placeholder="Nhập tiêu đề nội dung…"
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-blue-500/20 rounded-xl bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Mô tả
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            disabled={loading}
            rows={3}
            placeholder="Mô tả ngắn về nội dung…"
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-blue-500/20 rounded-xl bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm resize-none"
          />
        </div>

        {/* Type-specific form */}
        <div className="border-t border-slate-200/80 dark:border-blue-500/10 pt-5">
          {typeForm}
        </div>

        {/* Order + mandatory */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-200/80 dark:border-blue-500/10 pt-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Thứ tự xuất hiện
            </label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) =>
                update({ order_index: parseInt(e.target.value) || 1 })
              }
              disabled={loading}
              min={1}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-blue-500/20 rounded-xl bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_mandatory}
                onChange={(e) => update({ is_mandatory: e.target.checked })}
                disabled={loading}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#0D192E]"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nội dung bắt buộc
              </span>
            </label>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}

