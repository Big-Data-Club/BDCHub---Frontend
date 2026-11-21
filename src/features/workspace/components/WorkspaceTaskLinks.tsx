"use client";
import { useEffect, useState } from "react";
import { workspaceService } from "../api/workspaceService";
import type { LinkedTask } from "../api/linkedTasks.server";
import type { WorkspacePage } from "../types";
import {
  WorkspaceButton,
  WorkspaceErrorBanner,
  workspaceInputClass,
} from "./WorkspacePrimitives";
export function WorkspaceTaskLinks({
  page,
  onRefresh,
}: {
  page: WorkspacePage;
  onRefresh: () => void;
}) {
  const [tasks, setTasks] = useState<LinkedTask[]>([]),
    [id, setId] = useState(""),
    [error, setError] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void workspaceService
      .linkedTasks(page.id)
      .then((value) => {
        if (active) setTasks(value);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, [page.id]);
  const linked = tasks.filter((task) =>
    page.sources.some(
      (source) => source.type === "task" && source.id === String(task.id),
    ),
  );
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Tasks của BDC</h3>
      <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
        Hiển thị task bạn tạo, được giao hoặc có quyền quản trị. Trạng thái lấy
        từ Tasks hiện tại.
      </p>
      <WorkspaceErrorBanner message={error} />
      {linked.map((task) => (
        <div
          key={task.id}
          className="rounded-xl bg-slate-50 p-3 dark:bg-lms-card"
        >
          <strong>{task.title}</strong>
          <p className="mt-1 text-xs text-slate-500">
            {(
              {
                todo: "Chưa làm",
                "in-progress": "Đang làm",
                done: "Hoàn thành",
                cancel: "Đã hủy",
              } as Record<string, string>
            )[task.columnId] || task.columnId}
            {task.endDate
              ? ` · ${new Date(task.endDate).toLocaleDateString("vi-VN")}`
              : ""}
          </p>
        </div>
      ))}
      {(page.access || 0) >= 3 && (
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const task = tasks.find((item) => String(item.id) === id);
            if (!task) return;
            setBusy(true);
            setError(null);
            void workspaceService
              .updatePage(page.id, {
                version: page.version,
                sources: [
                  ...page.sources,
                  {
                    type: "task",
                    id: String(task.id),
                    label: task.title,
                    url: `/tasks?task=${task.id}`,
                  },
                ],
              })
              .then(() => {
                onRefresh();
                setId("");
              })
              .catch((reason) => setError(reason.message))
              .finally(() => setBusy(false));
          }}
        >
          <select
            aria-label="Task BDC được gắn"
            className={`${workspaceInputClass} w-full`}
            value={id}
            onChange={(event) => setId(event.target.value)}
          >
            <option value="">Chọn task…</option>
            {tasks
              .filter((task) => !linked.some((item) => item.id === task.id))
              .map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
          </select>
          <WorkspaceButton type="submit" disabled={!id || busy}>
            Gắn
          </WorkspaceButton>
        </form>
      )}
    </div>
  );
}
