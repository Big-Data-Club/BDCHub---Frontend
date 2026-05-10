"use client";

/**
 * ContentModal (refactored)
 *
 * This component is intentionally thin — it owns the shared form fields
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import lmsService from "@/services/lmsService";
import quizService from "@/services/quizService";
import { Content, ContentType, FileInfo } from "@/types";

import { TextContentForm }              from "./forms/TextContentForm";
import { VideoContentForm }             from "./forms/VideoContentForm";
import { DocumentContentForm,
         ImageContentForm }             from "./forms/FileContentForms";
import { QuizContentForm }              from "./forms/QuizContentForm";
import { ForumAnnouncementContentForm } from "./forms/ForumAnnouncementContentForm";
import { QuizSettings } from "./QuizSettingsForm";
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
  onSuccess: () => void;
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
    if (err) { alert(err); return; }

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
          alert("Nội dung đã được tạo nhưng có lỗi khi tạo quiz. Hãy vào Chỉnh sửa để thử lại.");
        }
      }

      alert("Tạo nội dung thành công!");
      onSuccess();
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || "Lỗi khi tạo nội dung.");
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

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-lg">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Thêm nội dung mới
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Content type selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Loại nội dung *
            </label>
            <select
              value={formData.type}
              onChange={e => handleTypeChange(e.target.value as ContentType)}
              disabled={loading}
              className="
                w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl
                bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-all
              "
            >
              {CONTENT_TYPES.map(ct => (
                <option key={ct.value} value={ct.value}>{ct.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleTitleChange(e.target.value)}
              disabled={loading}
              required
              placeholder="Nhập tiêu đề nội dung…"
              className="
                w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl
                bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                placeholder:text-slate-400 dark:placeholder:text-slate-600
                focus:bg-white dark:focus:bg-slate-900
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-all
              "
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={e => handleDescriptionChange(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Mô tả ngắn về nội dung…"
              className="
                w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl
                bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                placeholder:text-slate-400 dark:placeholder:text-slate-600
                focus:bg-white dark:focus:bg-slate-900
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-all resize-none
              "
            />
          </div>

          {/* ── Type-specific form ── */}
          {formData.type !== "TEXT" && formData.type !== "QUIZ" && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
              {typeForm}
            </div>
          )}
          {(formData.type === "TEXT" || formData.type === "QUIZ") && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
              {typeForm}
            </div>
          )}

          {/* Order + mandatory */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Thứ tự
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={e => update({ order_index: parseInt(e.target.value) || 1 })}
                disabled={loading}
                min={1}
                className="
                  w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl
                  bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                  transition-all
                "
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_mandatory}
                  onChange={e => update({ is_mandatory: e.target.checked })}
                  disabled={loading}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nội dung bắt buộc
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="submit"
              disabled={loading}
              className="
                flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                rounded-xl shadow-sm active:scale-95 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? "Đang tạo…" : "✓ Tạo nội dung"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                px-4 py-3 border border-slate-300 dark:border-slate-700
                text-slate-700 dark:text-slate-300
                bg-white dark:bg-slate-900
                hover:bg-slate-50 dark:hover:bg-slate-800
                rounded-xl font-medium active:scale-95 transition-all duration-200
                disabled:opacity-50
              "
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
