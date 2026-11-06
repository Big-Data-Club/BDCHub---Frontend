"use client";
import { useState } from "react";
import { FileText, Layers3, RotateCcw, Search, Trash2 } from "lucide-react";
import {
  useWorkspaceTrash,
  type TrashItem,
} from "../../hooks/useWorkspaceTrash";
import type { WorkspaceSpace } from "../../types";
import {
  WorkspaceButton,
  WorkspaceDialog,
  WorkspaceErrorBanner,
  WorkspaceLoading,
  workspaceInputClass,
} from "../WorkspacePrimitives";
export function WorkspaceTrashDialog({
  space,
  onClose,
  onRefresh,
}: {
  space?: WorkspaceSpace;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}) {
  const model = useWorkspaceTrash(space?.id, onRefresh),
    [query, setQuery] = useState(""),
    [confirm, setConfirm] = useState<TrashItem | null>(null);
  const canManage = !!space && ["owner", "manager"].includes(space.role);
  const shown = model.items.filter((item) =>
    item.title.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")),
  );
  return (
    <WorkspaceDialog
      open
      wide
      title="Thùng rác"
      description="Khôi phục trang, lĩnh vực đã xóa hoặc xóa vĩnh viễn khi bạn không còn cần."
      onOpenChange={(open) => {
        if (!open && !model.busy) onClose();
      }}
    >
      <WorkspaceErrorBanner message={model.error} />
      {confirm ? (
        <div className="space-y-4 rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/50 dark:bg-rose-950/20">
          <h3 className="break-words font-semibold">
            Xóa vĩnh viễn “{confirm.title}”?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {confirm.count} trang cùng nội dung, bình luận và lịch sử sẽ bị xóa.
            Bạn không thể khôi phục bằng thùng rác sau thao tác này.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <WorkspaceButton
              disabled={model.busy}
              onClick={() => setConfirm(null)}
            >
              Hủy
            </WorkspaceButton>
            <WorkspaceButton
              disabled={model.busy}
              className="bg-rose-600 text-white hover:bg-rose-700"
              onClick={() =>
                void model.run(confirm, true).then((ok) => {
                  if (ok) setConfirm(null);
                })
              }
            >
              <Trash2 className="size-4" />
              Xóa vĩnh viễn
            </WorkspaceButton>
          </div>
        </div>
      ) : (
        <>
          <label className="flex items-center gap-2">
            <Search className="size-4 shrink-0 text-slate-400" />
            <input
              className={`${workspaceInputClass} w-full`}
              aria-label="Tìm trong thùng rác"
              placeholder="Tìm theo tên…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {model.loading ? (
            <WorkspaceLoading label="Đang mở thùng rác…" />
          ) : shown.length ? (
            <div
              className="max-h-[55dvh] overflow-y-auto"
              role="list"
              aria-label="Mục trong thùng rác"
            >
              {shown.map((item) => (
                <div
                  key={item.id}
                  role="listitem"
                  className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-4 dark:border-lms-border"
                >
                  {item.kind === "field" ? (
                    <Layers3 className="size-5 shrink-0 text-violet-400" />
                  ) : (
                    <FileText className="size-5 shrink-0 text-slate-400" />
                  )}
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="truncate font-medium" title={item.title}>
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.kind === "field" ? "Lĩnh vực" : "Trang"} ·{" "}
                      {item.count} trang ·{" "}
                      {new Date(item.deletedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <WorkspaceButton
                      disabled={model.busy || !canManage}
                      aria-label={`Khôi phục ${item.title}`}
                      onClick={() => void model.run(item, false)}
                    >
                      <RotateCcw className="size-4" />
                      Khôi phục
                    </WorkspaceButton>
                    <WorkspaceButton
                      disabled={model.busy || !canManage}
                      aria-label={`Xóa vĩnh viễn ${item.title}`}
                      className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      onClick={() => setConfirm(item)}
                    >
                      <Trash2 className="size-4" />
                      <span className="hidden sm:inline">Xóa vĩnh viễn</span>
                    </WorkspaceButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid min-h-40 place-content-center justify-items-center gap-3 text-sm text-slate-500">
              <Trash2 className="size-9 text-slate-400" />
              {query ? "Không có mục phù hợp." : "Thùng rác trống."}
            </div>
          )}
        </>
      )}
    </WorkspaceDialog>
  );
}
