"use client";
import { useEffect, useState } from "react";
import { ArrowRight, FilePlus2, FileText, Search } from "lucide-react";
import { useTabPages } from "../hooks/useTabPages";
import type { WorkspaceBootstrap } from "../types";
import { relativeTime } from "../utils/relativeTime";
import {
  WorkspaceButton,
  WorkspaceDialog,
  WorkspaceErrorBanner,
  workspaceInputClass,
} from "./WorkspacePrimitives";
export function WorkspaceTabPicker({
  bootstrap,
  fieldId,
  canCreate,
  onClose,
  onOpen,
  onNew,
}: {
  bootstrap: WorkspaceBootstrap;
  fieldId?: string;
  canCreate: boolean;
  onClose: () => void;
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  const [query, setQuery] = useState(""),
    [scope, setScope] = useState(""),
    [selected, setSelected] = useState(0),
    search = useTabPages(query, scope);
  const results = search.results;
  const target = results[selected] || results[0],
    preview = target;
  useEffect(() => {
    setSelected(0);
  }, [query, scope]);
  return (
    <WorkspaceDialog
      open
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
      title="Mở trong tab mới"
      description="Tìm trang đã có hoặc tạo một trang mới trong lĩnh vực đang mở."
      wide
    >
      <div
        className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_230px]"
        onKeyDown={(event) => {
          if (
            event.target instanceof HTMLElement &&
            event.target.closest("select")
          )
            return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setSelected((value) =>
              Math.max(
                0,
                Math.min(
                  results.length - 1,
                  value + (event.key === "ArrowDown" ? 1 : -1),
                ),
              ),
            );
          } else if (
            event.key === "Enter" &&
            event.target instanceof HTMLInputElement &&
            target
          ) {
            event.preventDefault();
            onOpen(target.id);
          }
        }}
      >
        <div className="min-w-0 space-y-4">
          <label className="flex items-center gap-2">
            <Search className="size-4 text-slate-400" />
            <input
              autoFocus
              aria-label="Tìm trang để mở tab"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="workspace-tab-results"
              aria-expanded={results.length > 0}
              aria-activedescendant={
                target ? `workspace-tab-result-${selected}` : undefined
              }
              placeholder="Tìm trang…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={workspaceInputClass}
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Trong
            <select
              aria-label="Lọc lĩnh vực trong bộ chọn tab"
              className={workspaceInputClass}
              value={scope}
              onChange={(event) => setScope(event.target.value)}
            >
              <option value="">Tất cả lĩnh vực</option>
              {bootstrap.fields.map((field) => (
                <option value={field.id} key={field.id}>
                  {field.title}
                </option>
              ))}
            </select>
          </label>
          {canCreate && (
            <WorkspaceButton className="w-full justify-start" onClick={onNew}>
              <FilePlus2 className="size-4" />
              Trang mới
              <span className="truncate text-xs text-slate-400">
                {bootstrap.fields.find((field) => field.id === fieldId)?.title}
              </span>
            </WorkspaceButton>
          )}
          <p className="text-xs text-slate-400">
            {query
              ? "Kết quả tìm kiếm"
              : "Gần đây và các trang trong không gian"}
          </p>
          <WorkspaceErrorBanner message={search.error} />
          <div
            className="max-h-72 space-y-1 overflow-y-auto"
            id="workspace-tab-results"
            role="listbox"
            aria-label="Kết quả trang"
          >
            {results.map((item, index) => (
              <button
                key={item.id}
                type="button"
                id={`workspace-tab-result-${index}`}
                role="option"
                aria-selected={index === selected}
                className={`flex w-full items-center gap-2 rounded-lg p-3 text-left text-sm ${index === selected ? "bg-slate-100 dark:bg-lms-hover" : ""}`}
                onMouseEnter={() => setSelected(index)}
                onClick={() => onOpen(item.id)}
              >
                {item.icon || <FileText className="size-4 shrink-0" />}
                <span className="min-w-0">
                  <span className="block truncate">{item.title}</span>
                  <span className="mt-1 block truncate text-[11px] text-slate-400">
                    {bootstrap.spaces.find(
                      (space) => space.id === item.space_id,
                    )?.title || "Được chia sẻ"}
                    {item.field_id &&
                      ` / ${bootstrap.fields.find((field) => field.id === item.field_id)?.title || "Trang"}`}
                  </span>
                </span>
              </button>
            ))}
            {!results.length && (
              <p className="py-4 text-sm text-slate-500">
                {search.loading ? "Đang tìm…" : "Chưa tìm thấy trang phù hợp."}
              </p>
            )}
          </div>
        </div>
        <div className="hidden min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-lms-border dark:bg-lms-shell sm:block">
          {preview ? (
            <>
              <div className="mb-5 text-4xl">{preview.icon || "▤"}</div>
              <h3 className="break-words text-xl font-semibold">
                {preview.title}
              </h3>
              <p className="my-3 text-xs text-slate-500">
                Đã sửa {relativeTime(preview.updated_at)}
              </p>
              <p className="mb-6 max-h-32 overflow-hidden whitespace-pre-wrap break-words text-sm text-slate-500">
                {preview.snippet?.trim().slice(0, 240) ||
                  "Trang chưa có nội dung văn bản."}
              </p>
              <WorkspaceButton
                onClick={() => onOpen(preview.id)}
                className="h-auto text-left text-xs"
              >
                Mở tab workspace
                <ArrowRight className="size-4" />
              </WorkspaceButton>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              Chọn một trang để xem trước.
            </p>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        ↑ ↓ Chọn trang · Enter mở tab · Esc đóng. Đây là tab trong Workspace.
      </p>
    </WorkspaceDialog>
  );
}
