"use client";
import { createContext, useContext, type PointerEvent } from "react";
import type { WorkspacePage } from "../../types";
export interface EditorContextValue {
  page: WorkspacePage;
  pages: WorkspacePage[];
  onOpen: (id: string) => void;
  onAskAi: (text: string) => void;
  onComment: (blockId: string) => void;
  onGuide: () => void;
  onCreateChild: (title: string, parentId?: string) => Promise<WorkspacePage>;
  onConvertBlock: (id: string) => void;
  onPageMenu: (id: string) => void;
  onTrashPage: (id: string) => Promise<void>;
  onBlockPointerDown: (
    event: PointerEvent,
    payload: { blockId?: string; pageId?: string },
  ) => void;
}
export const WorkspaceEditorContext = createContext<EditorContextValue | null>(
  null,
);
export const useWorkspaceEditorContext = () =>
  useContext(WorkspaceEditorContext);
