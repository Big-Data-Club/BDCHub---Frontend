"use client";
import { useEffect, useState, useRef } from "react";
import { ArrowRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { WorkspacePage } from "../types";
import { relativeTime } from "../utils/relativeTime";
import { WorkspaceButton } from "./WorkspacePrimitives";
export function WorkspaceEdited({
  page,
  onActivity,
}: {
  page: WorkspacePage;
  onActivity: () => void;
}) {
  const [now, setNow] = useState(() => Date.now()),
    [open, setOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setOpen(true);
  };
  const hide = () => {
    hoverTimer.current = setTimeout(() => setOpen(false), 120);
  };
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      clearInterval(timer);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Thông tin chỉnh sửa trang"
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onClick={(event) => {
            event.preventDefault();
            if (hoverTimer.current) clearTimeout(hoverTimer.current);
            setOpen(false);
            onActivity();
          }}
          className="rounded-lg px-2 py-2 text-xs text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-lms-hover"
          title={new Date(page.updated_at).toLocaleString("vi-VN")}
        >
          Đã sửa {relativeTime(page.updated_at, now)}
        </button>
      </PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onMouseEnter={show}
        onMouseLeave={hide}
        align="end"
        className="w-80 rounded-xl border-slate-200 bg-white p-0 text-slate-700 shadow-xl dark:border-lms-border dark:bg-lms-card dark:text-slate-200"
      >
        <h3 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold dark:border-lms-border">
          Hoạt động
        </h3>
        <div className="space-y-3 p-4 text-xs">
          <div className="flex justify-between gap-4">
            <span>
              Đã sửa bởi <strong>{page.last_editor || "Thành viên"}</strong>
            </span>
            <time
              dateTime={page.updated_at}
              title={new Date(page.updated_at).toLocaleString("vi-VN")}
              className="shrink-0 text-slate-400"
            >
              {relativeTime(page.updated_at, now)}
            </time>
          </div>
          <div className="flex justify-between gap-4">
            <span>
              Được tạo bởi <strong>{page.creator_name || "Thành viên"}</strong>
            </span>
            <time
              dateTime={page.created_at}
              title={new Date(page.created_at).toLocaleString("vi-VN")}
              className="shrink-0 text-slate-400"
            >
              {relativeTime(page.created_at, now)}
            </time>
          </div>
        </div>
        <div className="border-t border-slate-200 p-2 dark:border-lms-border">
          <WorkspaceButton
            className="w-full justify-between text-xs"
            onClick={() => {
              setOpen(false);
              onActivity();
            }}
          >
            Xem cập nhật & thống kê
            <ArrowRight className="size-3" />
          </WorkspaceButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}
