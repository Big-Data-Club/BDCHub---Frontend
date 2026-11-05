"use client";
import { X } from "lucide-react";
import {
  useWorkspacePanel,
  type InspectorTab,
} from "../hooks/useWorkspacePanel";
import type {
  WorkspacePage,
  WorkspaceSpace,
  WorkspaceUser,
  EditorActions,
} from "../types";
import { WorkspaceButton, WorkspaceErrorBanner } from "./WorkspacePrimitives";
import { CommentsPanel } from "./panels/CommentsPanel";
import { SharingPanel } from "./panels/SharingPanel";
import { HistoryPanel } from "./panels/HistoryPanel";
import { SourcesPanel } from "./panels/SourcesPanel";
import { AiPanel } from "./panels/AiPanel";
const names: [InspectorTab, string][] = [
  ["comments", "Bình luận"],
  ["sharing", "Chia sẻ"],
  ["history", "Lịch sử"],
  ["sources", "Liên kết"],
  ["ai", "AI"],
];
export function WorkspaceInspector({
  page,
  space,
  user,
  tab,
  onTab,
  onClose,
  onRefresh,
  onOpen,
  editor,
  selection,
  blockId,
}: {
  page: WorkspacePage;
  space?: WorkspaceSpace;
  user: WorkspaceUser;
  tab: InspectorTab;
  onTab: (tab: InspectorTab) => void;
  onClose: () => void;
  onRefresh: () => void;
  onOpen: (id: string) => void;
  editor: EditorActions | null;
  selection: string;
  blockId?: string;
}) {
  const model = useWorkspacePanel(page, tab);
  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col border-l border-slate-200 bg-white dark:border-lms-border dark:bg-lms-shell"
      aria-label="Thông tin trang"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-lms-border">
        <div className="flex min-w-0 flex-wrap gap-1">
          {names.map(([id, name]) => (
            <WorkspaceButton
              key={id}
              aria-pressed={tab === id}
              className={`px-2 text-xs ${tab === id ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-cyan-300" : ""}`}
              onClick={() => onTab(id)}
            >
              {name}
            </WorkspaceButton>
          ))}
        </div>
        <WorkspaceButton
          aria-label="Đóng bảng thông tin"
          onClick={onClose}
          className="px-2"
        >
          <X className="size-4" />
        </WorkspaceButton>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-sm">
        <WorkspaceErrorBanner message={model.error} />
        {tab === "comments" && (
          <CommentsPanel
            model={model}
            page={page}
            user={user}
            blockId={blockId}
          />
        )}{" "}
        {tab === "sharing" && (
          <SharingPanel model={model} page={page} space={space} />
        )}{" "}
        {tab === "history" && (
          <HistoryPanel model={model} page={page} onRefresh={onRefresh} />
        )}{" "}
        {tab === "sources" && (
          <SourcesPanel
            model={model}
            page={page}
            onRefresh={onRefresh}
            onOpen={onOpen}
          />
        )}{" "}
        {tab === "ai" && (
          <AiPanel
            model={model}
            page={page}
            editor={editor}
            selection={selection}
          />
        )}
      </div>
    </aside>
  );
}
