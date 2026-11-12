"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { workspaceService } from "../../api/workspaceService";
import type { WorkspacePage } from "../../types";
import type { useWorkspacePanel } from "../../hooks/useWorkspacePanel";
import { WorkspaceButton, workspaceInputClass } from "../WorkspacePrimitives";

const time = (value: string) => new Date(value).toLocaleString("vi-VN");
export function HistoryPanel({
  model,
  page,
  onRefresh,
}: {
  model: ReturnType<typeof useWorkspacePanel>;
  page: WorkspacePage;
  onRefresh: () => void;
}) {
  const access = page.access || 0;
  const [label, setLabel] = useState("");
  return (
    <>
      {access >= 3 && (
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void model.run(async () => {
              await workspaceService.snapshot(page.id, label);
              setLabel("");
            });
          }}
        >
          <input
            aria-label="Tên phiên bản"
            className={`${workspaceInputClass} w-full`}
            required
            maxLength={120}
            placeholder="Đánh dấu phiên bản…"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
          <WorkspaceButton type="submit" disabled={model.busy}>
            <Plus className="size-4" />
          </WorkspaceButton>
        </form>
      )}
      <p className="text-xs text-slate-500">
        Tạo bản trước khi sửa tối đa mỗi 10 phút. Khôi phục giữ một bản dự phòng
        và yêu cầu các phiên đang mở tải lại.
      </p>
      {model.versions.map((version) => (
        <div
          key={version.id}
          className="rounded-xl border border-slate-200 p-3 dark:border-lms-border"
        >
          <strong>{version.label}</strong>
          <p className="mt-1 text-xs text-slate-500">
            {version.author} · {time(version.created_at)}
          </p>
          {access >= 4 && (
            <WorkspaceButton
              disabled={model.busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Khôi phục nội dung, tiêu đề và thuộc tính từ phiên bản này?",
                  )
                )
                  void model.run(async () => {
                    await workspaceService.restoreVersion(page.id, version.id);
                    onRefresh();
                  });
              }}
            >
              Khôi phục phiên bản
            </WorkspaceButton>
          )}
        </div>
      ))}
      <h3 className="font-semibold">Hoạt động gần đây</h3>
      {model.activity.map((item) => (
        <p
          key={item.id}
          className="border-b border-slate-100 py-2 text-xs dark:border-lms-border"
        >
          {item.actor} ·{" "}
          {(
            {
              "document.edited": "Sửa nội dung",
              "page.created": "Tạo trang",
              "page.updated": "Cập nhật trang",
              "comment.created": "Bình luận",
              "access.changed": "Đổi quyền",
              "document.restored": "Khôi phục",
            } as Record<string, string>
          )[item.action] || item.action}
          <time className="mt-1 block text-slate-500">
            {time(item.created_at)}
          </time>
        </p>
      ))}
    </>
  );
}
