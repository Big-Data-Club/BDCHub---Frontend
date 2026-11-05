"use client";
import {
  ChevronRight,
  MessageSquare,
  PanelRight,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import type { WorkspacePage, CollaborationStatus } from "../types";
import type { InspectorTab } from "../hooks/useWorkspacePanel";
import { WorkspaceButton } from "./WorkspacePrimitives";
import { WorkspacePageMenu, type PageAction } from "./WorkspacePageMenu";
const saveLabels = {
  connecting: "Đang kết nối…",
  saved: "Đã lưu",
  saving: "Đang lưu…",
  offline: "Bản nháp trên thiết bị",
  readonly: "Chỉ xem",
  revoked: "Quyền truy cập đã đổi",
  restored: "Trang vừa khôi phục",
  error: "Chưa lưu được",
};
export function WorkspaceHeader({
  page,
  status,
  spaceName,
  parentTitle,
  manager,
  onOpen,
  onPanel,
  onAction,
  setTab,
}: {
  page: WorkspacePage;
  status: CollaborationStatus;
  spaceName?: string;
  parentTitle?: string;
  manager: boolean;
  onOpen: (id: string) => void;
  onPanel: (tab: InspectorTab) => void;
  onAction: (action: PageAction, page: WorkspacePage) => void;
  setTab: (action: (tab: InspectorTab | null) => InspectorTab | null) => void;
}) {
  const editable = (page.access || 0) >= 3;
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2 dark:border-lms-border">
      <div className="flex min-w-0 items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="max-w-28 truncate">{spaceName || "Được chia sẻ"}</span>
        <ChevronRight className="size-3 shrink-0" />
        {page.parent_id && (
          <button
            type="button"
            className="max-w-24 truncate hover:text-blue-600"
            onClick={() => onOpen(page.parent_id!)}
          >
            {parentTitle || "Trang cha"}
          </button>
        )}
        <span className="max-w-44 truncate text-slate-800 dark:text-slate-200">
          {page.title}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span
          role="status"
          className={`mr-1 text-xs ${status.state === "saved" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
        >
          {saveLabels[status.state]}
        </span>
        <WorkspaceButton
          aria-label={page.favorite ? "Bỏ yêu thích" : "Yêu thích"}
          aria-pressed={page.favorite}
          className="px-2"
          onClick={() => void onAction("favorite", page)}
        >
          <Star
            className={`size-4 ${page.favorite ? "fill-amber-400 text-amber-500" : ""}`}
          />
        </WorkspaceButton>
        <WorkspaceButton onClick={() => onPanel("sharing")}>
          <Share2 className="size-4" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </WorkspaceButton>
        <WorkspaceButton
          aria-label="Bình luận"
          className="px-2"
          onClick={() => onPanel("comments")}
        >
          <MessageSquare className="size-4" />
        </WorkspaceButton>
        <WorkspaceButton
          aria-label="AI hỗ trợ trang"
          className="px-2"
          onClick={() => onPanel("ai")}
        >
          <Sparkles className="size-4" />
        </WorkspaceButton>
        <WorkspaceButton
          aria-label="Lịch sử và nguồn"
          className="px-2"
          onClick={() => setTab((value) => (value ? null : "history"))}
        >
          <PanelRight className="size-4" />
        </WorkspaceButton>
        <WorkspacePageMenu
          page={page}
          editable={editable}
          manager={manager}
          onAction={(type, target) => void onAction(type, target)}
        />
      </div>
    </header>
  );
}
