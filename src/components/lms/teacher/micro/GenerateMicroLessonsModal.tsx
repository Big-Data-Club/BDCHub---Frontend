"use client";

/**
 * GenerateMicroLessonsModal
 *
 * Configures a micro-lesson generation request and kicks it off. The
 * teacher picks a source (existing content file or YouTube URL),
 * chooses an approximate per-lesson duration, and (optionally) which
 * section to publish lessons into. The modal returns the new job_id
 * via onJobCreated so the parent can navigate to the editor view.
 */

import { useEffect, useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import lmsService from "@/services/lmsService";
import microLessonService from "@/services/microLessonService";
import type { Content, Section } from "@/types";

interface Props {
  courseId: number;
  sections: Section[];
  presetContentId?: number;
  presetSectionId?: number;
  onClose: () => void;
  onJobCreated: (jobId: number) => void;
}

export function GenerateMicroLessonsModal({
  courseId,
  sections,
  presetContentId,
  presetSectionId,
  onClose,
  onJobCreated,
}: Props) {
  const [mode, setMode] = useState<"file" | "youtube">(presetContentId ? "file" : "file");
  const [contentId, setContentId] = useState<number | undefined>(presetContentId);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [sectionId, setSectionId] = useState<number | undefined>(presetSectionId);
  const [targetMinutes, setTargetMinutes] = useState(5);
  const [language, setLanguage] = useState<"vi" | "en">("vi");

  const [allContents, setAllContents] = useState<Content[]>([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all DOCUMENT/VIDEO contents across the course's sections, so the
  // teacher can pick from a single dropdown rather than navigating sections.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingContents(true);
      try {
        const promises = sections.map(s => lmsService.listContent(s.id));
        const results = await Promise.all(promises);
        const flat: Content[] = [];
        results.forEach(r => {
          (r?.data ?? []).forEach((c: Content) => {
            if (c.type === "DOCUMENT" || c.type === "VIDEO" || c.type === "IMAGE") {
              flat.push(c);
            }
          });
        });
        if (!cancelled) setAllContents(flat);
      } finally {
        if (!cancelled) setLoadingContents(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sections]);

  const submit = async () => {
    setError(null);
    if (mode === "file" && !contentId) {
      setError("Vui lòng chọn tài liệu nguồn");
      return;
    }
    if (mode === "youtube" && !/youtu/.test(youtubeUrl)) {
      setError("URL YouTube không hợp lệ");
      return;
    }
    setSubmitting(true);
    try {
      const res = await microLessonService.generate(courseId, {
        contentId: mode === "file" ? contentId : undefined,
        youtubeUrl: mode === "youtube" ? youtubeUrl : undefined,
        sectionId,
        targetMinutes,
        language,
      });
      onJobCreated(res.job_id);
    } catch (e) {
      const msg = (e as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message || "Không khởi tạo được tác vụ";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-slate-900 dark:text-slate-50">
              Tạo bài học micro bằng AI
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            AI sẽ phân tích tài liệu của bạn và chia thành nhiều bài học ngắn
            (~{targetMinutes} phút đọc/bài). Mỗi bài học là Markdown có sẵn,
            giảng viên có thể chỉnh sửa trước khi xuất bản.
          </p>

          {/* Source mode tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                mode === "file"
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Từ tài liệu đã upload
            </button>
            <button
              type="button"
              onClick={() => setMode("youtube")}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                mode === "youtube"
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Từ video YouTube
            </button>
          </div>

          {mode === "file" ? (
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                Tài liệu nguồn
              </label>
              {loadingContents ? (
                <div className="text-sm text-slate-400">Đang tải danh sách…</div>
              ) : allContents.length === 0 ? (
                <div className="text-sm text-amber-600 dark:text-amber-400">
                  Chưa có tài liệu nào trong khóa. Hãy upload PDF/DOCX/PPTX trước.
                </div>
              ) : (
                <select
                  value={contentId ?? ""}
                  onChange={e => setContentId(Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="">— Chọn tài liệu —</option>
                  {allContents.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.type}] {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                URL video YouTube
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                Độ dài/bài học (phút đọc)
              </label>
              <input
                type="number"
                min={2}
                max={15}
                value={targetMinutes}
                onChange={e => setTargetMinutes(Math.max(2, Math.min(15, Number(e.target.value) || 5)))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                Ngôn ngữ
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as "vi" | "en")}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
              Chương đích khi xuất bản (tuỳ chọn — có thể chọn lúc publish)
            </label>
            <select
              value={sectionId ?? ""}
              onChange={e => setSectionId(Number(e.target.value) || undefined)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">— Chưa chọn —</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white inline-flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Bắt đầu tạo
          </button>
        </div>
      </div>
    </div>
  );
}