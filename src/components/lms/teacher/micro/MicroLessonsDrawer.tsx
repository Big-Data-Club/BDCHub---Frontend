"use client";

/**
 * MicroLessonsDrawer
 *
 * Right-hand panel that opens after a generation job is queued. Polls
 * job status every few seconds while it's still processing, then
 * renders the list of generated lessons. Each lesson can be edited
 * inline (Markdown) or published into a chosen section, which creates
 * a SectionContent of type TEXT and triggers the existing auto-index
 * pipeline on the AI side.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, Edit3, Loader2, Save, Send, Trash2, X,
} from "lucide-react";
import microLessonService, {
  asImageUrls, asObjectives, unwrapNullString,
  type JobWithLessons, type MicroLesson,
} from "@/services/microLessonService";
import type { Section } from "@/types";

interface Props {
  jobId: number;
  sections: Section[];
  onClose: () => void;
  onPublished: (sectionId: number) => void;
}

const POLL_INTERVAL_MS = 4000;

export function MicroLessonsDrawer({ jobId, sections, onClose, onPublished }: Props) {
  const [data, setData] = useState<JobWithLessons | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const stopPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const refresh = useCallback(async () => {
    try {
      const res = await microLessonService.getJob(jobId);
      setData(res);
      const status = res.job?.status;
      if (status === "completed" || status === "failed") {
        stopPoll();
      }
    } catch {
      setError("Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => stopPoll();
  }, [refresh]);

  const job = data?.job;
  const lessons = useMemo(
    () => (data?.lessons ?? []).slice().sort((a, b) => a.order_index - b.order_index || a.id - b.id),
    [data],
  );

  const handleDelete = async (l: MicroLesson) => {
    if (!confirm(`Xoá bản nháp: "${l.title}"?`)) return;
    await microLessonService.deleteLesson(l.id);
    await refresh();
  };

  const handlePublish = async (l: MicroLesson, sectionId: number) => {
    if (!sectionId) {
      alert("Vui lòng chọn chương đích");
      return;
    }
    await microLessonService.publishLesson(l.id, sectionId);
    await refresh();
    onPublished(sectionId);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="font-bold text-slate-900 dark:text-slate-50">
              Bản nháp bài học micro #{jobId}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading && !data ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Đang tải…
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Job status */}
            <JobStatusCard job={job} />

            {lessons.length === 0 && job?.status === "processing" && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
                AI đang phân tích tài liệu… Bài học sẽ xuất hiện ở đây sau ít phút.
              </div>
            )}

            {lessons.map((l, idx) => (
              <LessonCard
                key={l.id}
                lesson={l}
                idx={idx + 1}
                sections={sections}
                isEditing={editingId === l.id}
                onStartEdit={() => setEditingId(l.id)}
                onCancelEdit={() => setEditingId(null)}
                onSaved={async () => {
                  setEditingId(null);
                  await refresh();
                }}
                onDelete={() => handleDelete(l)}
                onPublish={(sid) => handlePublish(l, sid)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function JobStatusCard({ job }: { job: JobWithLessons["job"] | undefined }) {
  if (!job) return null;
  const colorByStatus: Record<string, string> = {
    queued: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    processing: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    completed: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
    failed: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300",
  };
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorByStatus[job.status] || ""}`}>
          {labelStatus(job.status)}
        </span>
        <span className="text-xs text-slate-500">
          {job.lessons_count > 0 && `${job.lessons_count} bài học`}
        </span>
      </div>
      {job.status === "processing" && (
        <div className="mt-2">
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${job.progress || 0}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-1">{job.stage || "đang xử lý"} · {job.progress || 0}%</p>
        </div>
      )}
      {job.status === "failed" && job.error?.Valid && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{job.error.String}</p>
      )}
    </div>
  );
}

function labelStatus(s: string): string {
  switch (s) {
    case "queued": return "Đang xếp hàng";
    case "processing": return "Đang xử lý";
    case "completed": return "Hoàn thành";
    case "failed": return "Thất bại";
    default: return s;
  }
}

interface LessonCardProps {
  lesson: MicroLesson;
  idx: number;
  sections: Section[];
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaved: () => void;
  onDelete: () => void;
  onPublish: (sectionId: number) => void;
}

function LessonCard({
  lesson, idx, sections, isEditing, onStartEdit, onCancelEdit, onSaved, onDelete, onPublish,
}: LessonCardProps) {
  const [title, setTitle] = useState(lesson.title);
  const [summary, setSummary] = useState(unwrapNullString(lesson.summary));
  const [objectivesText, setObjectivesText] = useState(asObjectives(lesson.objectives).join("\n"));
  const [markdown, setMarkdown] = useState(lesson.markdown_content);
  const [estimatedMinutes, setEstimatedMinutes] = useState(lesson.estimated_minutes);
  const [orderIndex, setOrderIndex] = useState(lesson.order_index);
  const [saving, setSaving] = useState(false);
  const [pickedSection, setPickedSection] = useState<number>(0);

  const isPublished = lesson.status === "published";

  // Sync local state when the upstream lesson changes (e.g. another card refreshed)
  useEffect(() => {
    if (!isEditing) {
      setTitle(lesson.title);
      setSummary(unwrapNullString(lesson.summary));
      setObjectivesText(asObjectives(lesson.objectives).join("\n"));
      setMarkdown(lesson.markdown_content);
      setEstimatedMinutes(lesson.estimated_minutes);
      setOrderIndex(lesson.order_index);
    }
  }, [lesson, isEditing]);

  const save = async () => {
    setSaving(true);
    try {
      await microLessonService.updateLesson(lesson.id, {
        title,
        summary,
        objectives: objectivesText.split("\n").map(s => s.trim()).filter(Boolean),
        markdown_content: markdown,
        estimated_minutes: estimatedMinutes,
        order_index: orderIndex,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const imageUrls = asImageUrls(lesson.image_urls);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3">
        <span className="w-6 h-6 rounded-md bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {idx}
        </span>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold"
            />
          ) : (
            <p className="font-semibold text-slate-900 dark:text-slate-50 truncate">{lesson.title}</p>
          )}
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
            <span>~{lesson.estimated_minutes} phút đọc</span>
            {imageUrls.length > 0 && <span>· {imageUrls.length} hình</span>}
            {isPublished && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium">
                Đã xuất bản
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isPublished && !isEditing && (
            <button
              title="Sửa Markdown"
              onClick={onStartEdit}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isPublished && (
            <button
              title="Xoá bản nháp"
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">Tóm tắt</label>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
              Mục tiêu học (mỗi dòng 1 mục)
            </label>
            <textarea
              rows={3}
              value={objectivesText}
              onChange={e => setObjectivesText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
              Nội dung (Markdown)
            </label>
            <textarea
              rows={14}
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">Phút đọc</label>
              <input
                type="number" min={2} max={30}
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Number(e.target.value) || 5)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">Thứ tự</label>
              <input
                type="number" min={0}
                value={orderIndex}
                onChange={e => setOrderIndex(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onCancelEdit}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Huỷ
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <>
          {summary && (
            <div className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 italic border-b border-slate-100 dark:border-slate-800">
              {summary}
            </div>
          )}
          <div className="px-4 py-3 max-h-72 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap font-mono text-slate-700 dark:text-slate-300 leading-5">
              {lesson.markdown_content}
            </pre>
          </div>

          {!isPublished && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-2">
              <select
                value={pickedSection || ""}
                onChange={e => setPickedSection(Number(e.target.value) || 0)}
                className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="">— Chọn chương để xuất bản —</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              <button
                onClick={() => onPublish(pickedSection)}
                disabled={!pickedSection}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                Xuất bản & Index
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}