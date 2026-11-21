"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { blocksToYDoc } from "@blocknote/core/yjs";
import * as Y from "yjs";
import { workspaceService } from "../api/workspaceService";
import { encodeUpdate } from "../api/WorkspaceProvider";
import {
  contentText,
  duplicateBlock,
  mathExportProjection,
} from "../utils/editorContent";
import {
  parseWorkspaceMarkdown,
  type WorkspaceEditorInstance,
} from "../components/editor/schema";
import type { EditorActions, WorkspacePage } from "../types";

export function useEditorCommands(
  editor: WorkspaceEditorInstance,
  page: WorkspacePage,
  onCreateChild: (title: string, parentId?: string) => Promise<WorkspacePage>,
  onActions: (actions: EditorActions | null) => void,
) {
  const [error, setError] = useState<string | null>(null);
  const actions = useMemo<EditorActions>(
    () => ({
      focus: () => editor.focus(),
      selectionText: () => editor.getSelectedText(),
      insertMath: ({ source, mode }) => {
        if (!editor.isEditable) {
          setError("Bạn chưa có quyền sửa trang đang mở.");
          return;
        }
        editor.focus();
        if (mode === "inline")
          editor.insertInlineContent([{ type: "math", content: source }]);
        else {
          const cursor = editor.getTextCursorPosition();
          editor.insertBlocks(
            [{ type: "mathBlock", content: source }],
            cursor.block,
            "after",
          );
        }
      },
      insertMarkdown: async (markdown) => {
        if (!editor.isEditable) throw new Error("Bạn chưa có quyền sửa trang.");
        const blocks = parseWorkspaceMarkdown(editor, markdown);
        if (blocks.length)
          editor.insertBlocks(
            blocks.map(duplicateBlock),
            editor.document[editor.document.length - 1],
            "after",
          );
        editor.focus();
      },
      exportMarkdown: async () => {
        const projected = mathExportProjection(editor.document);
        return projected.restore(
          editor.blocksToMarkdownLossy(projected.blocks),
        );
      },
      exportJson: () =>
        JSON.stringify(
          {
            format: "bdc-workspace-blocks-v1",
            title: page.title,
            blocks: editor.document,
          },
          null,
          2,
        ),
      insertPageLink: (target) => {
        if (editor.isEditable)
          editor.insertBlocks(
            [
              {
                type: "pageLink",
                props: { pageId: target.id, title: target.title },
              },
            ],
            editor.getTextCursorPosition().block,
            "after",
          );
      },
    }),
    [editor, page.title],
  );
  useEffect(() => {
    onActions(actions);
    return () => onActions(null);
  }, [actions, onActions]);
  const convertBlock = useCallback(
    async (id: string) => {
      const original = editor.getBlock(id);
      if (!original || !editor.isEditable || original.type === "pageLink")
        return;
      const before = JSON.stringify(original),
        title =
          contentText(original.content).trim().slice(0, 120) ||
          "Trang không tiêu đề";
      const seed = blocksToYDoc(
        editor,
        [duplicateBlock(original)],
        "document-store",
      );
      try {
        const child = await onCreateChild(title, page.id);
        await workspaceService.initialize(
          child.id,
          encodeUpdate(Y.encodeStateAsUpdate(seed)),
          1,
        );
        const current = editor.getBlock(id);
        if (current && editor.isEditable && JSON.stringify(current) === before)
          editor.updateBlock(current, {
            type: "pageLink",
            props: { pageId: child.id, title: child.title },
            children: [],
          });
        else {
          actions.insertPageLink(child);
          setError(
            "Trang con đã tạo. Khối gốc có thay đổi mới nên vẫn được giữ.",
          );
        }
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Chưa chuyển được. Nội dung gốc vẫn được giữ.",
        );
      } finally {
        seed.destroy();
      }
    },
    [editor, onCreateChild, page.id, actions],
  );
  return { actions, error, setError, convertBlock };
}
