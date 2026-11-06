"use client";
import { useState } from "react";
import { Clock3, ShieldCheck } from "lucide-react";
import { usePageActivity } from "../../hooks/usePageActivity";
import type { WorkspacePage, WorkspaceUser } from "../../types";
import { relativeTime } from "../../utils/relativeTime";
import {
  WorkspaceErrorBanner,
  WorkspaceLoading,
  workspaceInputClass,
} from "../WorkspacePrimitives";
import { PageViewsChart } from "./PageViewsChart";
const labels: Record<string, string> = {
  "document.edited": "đã sửa nội dung",
  "page.created": "đã tạo trang",
  "page.updated": "đã cập nhật trang",
  "comment.created": "đã bình luận",
  "document.restored": "đã khôi phục phiên bản",
  "access.changed": "đã thay đổi quyền",
  "page.archived": "đã lưu trữ trang",
};
export function PageActivityPanel({
  page,
  user,
}: {
  page: WorkspacePage;
  user: WorkspaceUser;
}) {
  const [view, setView] = useState<"updates" | "analytics">("updates"),
    [days, setDays] = useState(28),
    model = usePageActivity(page.id, days),
    data = model.analytics;
  return (
    <div>
      <h3 className="mb-4 truncate font-semibold">
        {page.icon} {page.title}
      </h3>
      <div
        className="mb-6 flex gap-5 border-b border-slate-200 dark:border-lms-border"
        role="tablist"
        aria-label="Hoạt động trang"
      >
        {(
          [
            ["updates", "Cập nhật"],
            ["analytics", "Thống kê"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            className={`border-b-2 px-1 pb-3 text-sm ${view === id ? "border-slate-600 text-slate-900 dark:border-slate-200 dark:text-white" : "border-transparent text-slate-500"}`}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <WorkspaceErrorBanner message={model.error} />
      {view === "updates" ? (
        <>
          <div className="mb-5 space-y-3 rounded-xl bg-slate-50 p-4 text-xs dark:bg-lms-card">
            <p className="flex justify-between gap-3">
              <span>
                Đã sửa bởi <strong>{page.last_editor || "Thành viên"}</strong>
              </span>
              <time title={new Date(page.updated_at).toLocaleString("vi-VN")}>
                {relativeTime(page.updated_at)}
              </time>
            </p>
            <p className="flex justify-between gap-3">
              <span>
                Được tạo bởi{" "}
                <strong>{page.creator_name || "Thành viên"}</strong>
              </span>
              <time title={new Date(page.created_at).toLocaleString("vi-VN")}>
                {relativeTime(page.created_at)}
              </time>
            </p>
          </div>
          {model.activity.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 border-b border-slate-100 py-5 dark:border-lms-border"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-100 text-xs text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                {item.actor.slice(0, 1).toLocaleUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  {item.actor_id === user.id ? "Bạn" : item.actor}{" "}
                  {labels[item.action] || "đã cập nhật trang"}
                </p>
                <time
                  dateTime={item.created_at}
                  title={new Date(item.created_at).toLocaleString("vi-VN")}
                  className="mt-1 block text-xs text-slate-500"
                >
                  {relativeTime(item.created_at)}
                </time>
              </div>
              <Clock3 className="size-4 text-slate-400" />
            </div>
          ))}
          {data && !model.activity.length && (
            <p className="py-4 text-sm text-slate-500">
              Chưa có cập nhật nào khác.
            </p>
          )}
          <p className="mt-4 text-xs leading-6 text-slate-400">
            Tối đa 100 cập nhật gần nhất. Các lần sửa nội dung của cùng một
            người trong một phút được gộp lại.
          </p>
        </>
      ) : data ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold">Lượt xem ({data.views})</h4>
            <select
              aria-label="Khoảng thời gian thống kê"
              className={`${workspaceInputClass} w-auto text-xs`}
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
            >
              <option value={7}>7 ngày qua</option>
              <option value={28}>28 ngày qua</option>
              <option value={90}>90 ngày qua</option>
            </select>
          </div>
          <PageViewsChart data={data} />
          <h4 className="mb-3 mt-8 font-semibold">Người xem</h4>
          {data.viewers.length ? (
            data.viewers.map((item) => (
              <p
                key={item.name + item.viewed_at}
                className="flex justify-between gap-3 py-2 text-xs"
              >
                <span>{item.name}</span>
                <span className="text-slate-400">
                  {relativeTime(item.viewed_at)}
                </span>
              </p>
            ))
          ) : (
            <p className="text-xs leading-6 text-slate-500">
              Chưa có người xem nào chọn hiển thị tên.
            </p>
          )}
          <h4 className="mb-3 mt-8 font-semibold">Người chỉnh sửa</h4>
          <p className="mb-3 text-xs text-slate-500">
            Tạo bởi {page.creator_name || "Thành viên"} ·{" "}
            {relativeTime(page.created_at)}
          </p>
          {data.editors.map((item) => (
            <p
              key={item.name + item.edited_at}
              className="flex justify-between gap-3 py-2 text-xs"
            >
              <span>{item.name}</span>
              <span className="text-slate-400">
                {relativeTime(item.edited_at)}
              </span>
            </p>
          ))}
          <p className="mt-6 text-xs leading-6 text-slate-400">
            Thống kê từ{" "}
            {new Date(data.tracked_since).toLocaleDateString("vi-VN")}; ngày
            được tính theo UTC. Các lần mở lại trong 5 phút chỉ tính một lượt.
            Tải lại thông tin nền không tăng lượt xem.
          </p>
        </>
      ) : (
        !model.error && <WorkspaceLoading label="Đang tải hoạt động…" />
      )}
      {data && (
        <div className="mt-8">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-4 text-xs dark:bg-lms-card">
            <ShieldCheck className="size-4 shrink-0" />
            <span className="flex-1">
              Hiển thị tên tôi trong lịch sử xem trang này
            </span>
            <input
              type="checkbox"
              aria-label="Hiển thị tên tôi trong lịch sử xem trang này"
              checked={data.show_name}
              disabled={model.busy}
              onChange={(event) =>
                void model.setPreference(event.target.checked)
              }
              className="size-4 accent-blue-600"
            />
          </label>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Tắt để ẩn tên, kể cả những lần xem trước. Lượt xem vẫn được tính
            trong số liệu tổng hợp.
          </p>
        </div>
      )}
    </div>
  );
}
