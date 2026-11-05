"use client";

import { useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import type { NotebookAnnotation } from "@/types/ai/notebook";
import { ColorPicker } from "./ColorPicker";

type Props = {
  title: string;
  content: string;
  annotation?: NotebookAnnotation | null;
  busy: boolean;
  editing: boolean;
  onCancel: () => void;
  onSave: (
    title: string,
    content: string,
    annotation?: NotebookAnnotation | null,
  ) => Promise<void>;
  onChange?: (
    title: string,
    content: string,
    annotation?: NotebookAnnotation | null,
  ) => void;
};
export function NoteEditor({
  title: initialTitle,
  content: initialContent,
  annotation: initialAnnotation,
  busy,
  editing,
  onCancel,
  onSave,
  onChange,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [annotation, setAnnotation] = useState(initialAnnotation);
  function cancel() {
    if (
      (title !== initialTitle ||
        content !== initialContent ||
        annotation?.color !== initialAnnotation?.color) &&
      !confirm("Bỏ thay đổi chưa lưu của ghi chú này?")
    )
      return;
    onCancel();
  }
  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        if (title.trim() && (content.trim() || annotation) && !busy)
          void onSave(
            title.trim(),
            content.trim() || annotation!.quote,
            annotation,
          );
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-blue-500/10">
        <button
          type="button"
          onClick={cancel}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-blue-950"
        >
          <ArrowLeft size={14} />
          Quay lại
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
          {editing ? "Chỉnh sửa" : "Ghi chú mới"}
        </span>
      </div>
      <fieldset
        disabled={busy}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
      >
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
          Tiêu đề
          <input
            aria-label="Tiêu đề ghi chú"
            required
            maxLength={180}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onChange?.(e.target.value, content, annotation);
            }}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-blue-500/20 dark:bg-lms-bg dark:text-slate-100"
          />
        </label>
        {annotation && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Đoạn đã chọn
            </p>
            <blockquote className="max-h-44 overflow-y-auto whitespace-pre-wrap rounded-xl border-l-4 border-blue-500 bg-slate-50 p-3 text-xs leading-relaxed dark:bg-lms-card">
              {annotation.quote}
            </blockquote>
            <ColorPicker
              value={annotation.color}
              onChange={(color) => {
                const value = { ...annotation, color };
                setAnnotation(value);
                onChange?.(title, content, value);
              }}
            />
          </div>
        )}
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
          {annotation ? "Ghi chú thêm (tùy chọn)" : "Nội dung"}
          <textarea
            aria-label="Nội dung ghi chú"
            required={!annotation}
            maxLength={100000}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onChange?.(title, e.target.value, annotation);
            }}
            className="mt-2 min-h-48 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-blue-500/20 dark:bg-lms-bg dark:text-slate-200"
          />
        </label>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Ghi chú và highlight được lưu vào cùng vở ghi với câu trả lời AI.
        </p>
      </fieldset>
      <div className="border-t border-slate-200 p-4 dark:border-blue-500/10">
        <button
          type="submit"
          disabled={busy || !title.trim() || (!content.trim() && !annotation)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {busy ? "Đang lưu…" : "Lưu ghi chú"}
        </button>
      </div>
    </form>
  );
}
