import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "@/lib/tenant/Link";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import type { NotebookAnnotation, NotebookEntry } from "@/types/ai/notebook";
import { highlightColors } from "../colors";
import { ColorPicker } from "./ColorPicker";

type Props = {
  note: NotebookEntry;
  busy: boolean;
  onBack: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onAnnotation: (annotation: NotebookAnnotation | null) => void;
};
export function NoteReader({
  note,
  busy,
  onBack,
  onEdit,
  onRemove,
  onAnnotation,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-blue-500/10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
        >
          <ArrowLeft size={14} />
          Danh sách
        </button>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Sửa ghi chú"
            disabled={busy}
            onClick={onEdit}
            className="rounded-xl p-2 text-blue-600 hover:bg-blue-50 dark:text-cyan-400 dark:hover:bg-blue-950"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            aria-label="Xóa ghi chú"
            disabled={busy}
            onClick={onRemove}
            className="rounded-xl p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <article className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <div>
          <h4 className="break-words text-lg font-bold leading-snug">
            {note.title}
          </h4>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {new Date(note.created_at).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "short",
            })}
          </p>
        </div>
        {note.annotation && (
          <div className="space-y-3">
            <blockquote
              style={{
                backgroundColor: highlightColors.find(
                  (color) => color.value === note.annotation?.color,
                )?.background,
              }}
              className="whitespace-pre-wrap rounded-xl border-l-4 border-blue-500 p-3 text-sm leading-relaxed"
            >
              {note.annotation.quote}
            </blockquote>
            <ColorPicker
              value={note.annotation.color}
              disabled={busy}
              onChange={(color) => onAnnotation({ ...note.annotation!, color })}
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                className="text-xs text-slate-500 underline dark:text-slate-400"
                onClick={() => onAnnotation(null)}
              >
                Bỏ highlight, giữ ghi chú
              </button>
              {note.course_id && (
                <Link
                  href={`/lms/student/courses/${note.course_id}/learn?contentId=${note.annotation.content_id}`}
                  className="text-xs font-semibold text-blue-600 underline dark:text-cyan-400"
                >
                  Mở bài học ↗
                </Link>
              )}
            </div>
          </div>
        )}
        {(!note.annotation || note.content !== note.annotation.quote) && (
          <div className="break-words text-sm leading-relaxed">
            <MarkdownRenderer content={note.content} />
          </div>
        )}
      </article>
    </>
  );
}
