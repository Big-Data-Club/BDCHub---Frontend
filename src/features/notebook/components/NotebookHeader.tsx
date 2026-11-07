import { BookOpenText, Plus, Search } from "lucide-react";

type Props = {
  courseId?: number;
  count: number;
  busy: boolean;
  editing: boolean;
  scope: "course" | "all";
  onScope: (scope: "course" | "all") => void;
  query: string;
  onQuery: (query: string) => void;
  onCreate: () => void;
  searching: boolean;
};
export function NotebookHeader({
  courseId,
  count,
  busy,
  editing,
  scope,
  onScope,
  query,
  onQuery,
  onCreate,
  searching,
}: Props) {
  return (
    <div className="space-y-3 border-b border-slate-200 px-4 py-4 dark:border-blue-500/10">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
            <BookOpenText size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold">Vở ghi của bạn</h3>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              AI & bài học · {count} ghi chú
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Thêm ghi chú"
          disabled={busy || editing}
          onClick={onCreate}
          className="rounded-xl border border-blue-200 bg-blue-50 p-2 text-blue-600 transition-all duration-200 active:scale-95 disabled:opacity-40 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400"
        >
          <Plus size={17} />
        </button>
      </div>
      {courseId && (
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-xs dark:bg-lms-card">
          {(
            [
              ["course", "Khóa học này"],
              ["all", "Tất cả ghi chú"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              disabled={editing || busy}
              aria-pressed={scope === key}
              onClick={() => onScope(key)}
              className={`rounded-lg px-2 py-2 font-semibold ${scope === key ? "bg-white text-blue-700 shadow-sm dark:bg-blue-500/15 dark:text-cyan-300" : "text-slate-500 dark:text-slate-400"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {searching && (
        <label className="relative block">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            aria-label="Tìm kiếm ghi chú"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Tìm trong vở ghi…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 dark:border-blue-500/15 dark:bg-lms-card"
          />
        </label>
      )}
    </div>
  );
}
