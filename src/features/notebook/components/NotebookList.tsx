import { FileText, Highlighter, Loader2 } from "lucide-react";
import type { NotebookEntry } from "@/types/ai/notebook";

export function NotebookList({
  notes,
  loading,
  query,
  onSelect,
}: {
  notes: NotebookEntry[];
  loading: boolean;
  query: string;
  onSelect: (entry: NotebookEntry) => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      {loading && !notes.length ? (
        <div
          role="status"
          className="flex justify-center gap-2 py-12 text-xs text-slate-500 dark:text-slate-400"
        >
          <Loader2 size={16} className="animate-spin" />
          Đang tải ghi chú…
        </div>
      ) : !notes.length ? (
        <div className="px-5 py-14 text-center">
          <FileText
            size={30}
            className="mx-auto mb-4 text-blue-300 dark:text-cyan-800"
          />
          <p className="text-sm font-semibold">
            {query
              ? "Không tìm thấy ghi chú"
              : "Không gian cho ý tưởng của bạn"}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Bôi đen đoạn trong bài học hoặc lưu một câu trả lời AI.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => onSelect(note)}
              className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/40 active:scale-[0.99] dark:border-blue-500/10 dark:bg-lms-card dark:hover:border-cyan-500/40 dark:hover:bg-blue-500/10"
            >
              <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  {note.annotation ? (
                    <Highlighter size={12} />
                  ) : (
                    <FileText size={12} />
                  )}
                  {note.annotation ? "Đoạn đã đánh dấu" : "Ghi chú"}
                </span>
                <time>
                  {new Date(note.created_at).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </time>
              </div>
              <h4 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400">
                {note.title}
              </h4>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {note.annotation?.quote ||
                  note.content.replace(/[#*>`_\[\]]/g, " ")}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
