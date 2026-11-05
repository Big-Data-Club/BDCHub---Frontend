"use client";
import { useState } from "react";
import { SideMenuExtension } from "@blocknote/core/extensions";
import {
  BlockColorsItem,
  DragHandleMenu,
  RemoveBlockItem,
  blockTypeSelectItems,
  useBlockNoteEditor,
  useComponentsContext,
  useEditorState,
  useExtensionState,
} from "@blocknote/react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Copy,
  FileText,
  Link2,
  MessageSquare,
  Repeat2,
  Search,
  Sigma,
  Sparkles,
} from "lucide-react";
import { useWorkspaceEditorContext } from "./EditorContext";
import { contentText, duplicateBlock } from "../../utils/editorContent";
import { workspaceSchema } from "./schema";

export function EditorBlockMenu() {
  const editor = useBlockNoteEditor<
    typeof workspaceSchema.blockSchema,
    typeof workspaceSchema.inlineContentSchema,
    typeof workspaceSchema.styleSchema
  >();
  const context = useWorkspaceEditorContext(),
    components = useComponentsContext();
  const hovering = useExtensionState(SideMenuExtension, {
    editor,
    selector: (state) => state?.block,
  });
  const block = useEditorState({
    editor,
    selector: () => hovering && editor.getBlock(hovering.id),
  });
  const [query, setQuery] = useState(""),
    [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  if (!block || !components) return null;
  const Menu = components.Generic.Menu;
  const match = (label: string) =>
    !query.trim() ||
    label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  const text = contentText(block.content),
    types = blockTypeSelectItems(editor.dictionary).filter(
      (item) => item.type in editor.schema.blockSchema,
    );
  function copyLink() {
    const url = new URL("/workspace", location.href);
    url.searchParams.set("page", context?.page.id || "");
    url.searchParams.set("block", block!.id);
    void navigator.clipboard
      .writeText(url.href)
      .then(() => setCopied(true))
      .catch(() => setCopyError(true));
  }
  return (
    <DragHandleMenu>
      <div className="flex items-center gap-2 px-3 py-2">
        <Search className="size-4" />
        <input
          aria-label="Tìm thao tác khối"
          placeholder="Tìm thao tác…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (!["Escape", "Tab"].includes(event.key)) event.stopPropagation();
          }}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
        {block.type === "pageLink"
          ? "Trang liên kết"
          : block.type === "mathBlock"
            ? "Công thức"
            : "Khối nội dung"}
      </div>
      {editor.isEditable && match("Chuyển thành Turn into") && (
        <Menu.Root
          sub
          position="right"
          portalElement={
            (editor.domElement?.closest(".bn-root") ||
              null) as HTMLElement | null
          }
        >
          <Menu.Trigger sub>
            <Menu.Item subTrigger>
              <Repeat2 className="size-4" />
              Chuyển thành
            </Menu.Item>
          </Menu.Trigger>
          <Menu.Dropdown sub className="bn-menu-dropdown">
            {types.map((item) => (
              <Menu.Item
                key={item.name}
                onClick={() => {
                  editor.updateBlock(block, {
                    type: item.type as "paragraph",
                    props: item.props,
                  });
                }}
              >
                <item.icon />
                {item.name}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu.Root>
      )}
      {editor.isEditable && match("Công thức Equation") && (
        <Menu.Item
          onClick={() =>
            editor.updateBlock(block, {
              type: "mathBlock",
              props: {},
              content: text,
            })
          }
        >
          <Sigma className="size-4" />
          Chuyển thành công thức
        </Menu.Item>
      )}
      {editor.isEditable &&
        block.type !== "pageLink" &&
        context?.page.space_role &&
        match("Trang Page") && (
          <Menu.Item onClick={() => context.onConvertBlock(block.id)}>
            <FileText className="size-4" />
            Chuyển thành trang con
          </Menu.Item>
        )}
      {editor.isEditable && match("Màu Color") && (
        <BlockColorsItem>Màu chữ & nền</BlockColorsItem>
      )}
      <Menu.Divider />
      {match("Sao chép liên kết Copy link") && (
        <Menu.Item onClick={copyLink}>
          <Link2 className="size-4" />
          {copyError
            ? "Chưa sao chép được"
            : copied
              ? "Đã sao chép"
              : "Sao chép liên kết khối"}
        </Menu.Item>
      )}
      {editor.isEditable && match("Nhân bản Duplicate") && (
        <Menu.Item
          onClick={() =>
            editor.insertBlocks([duplicateBlock(block)], block, "after")
          }
        >
          <Copy className="size-4" />
          Nhân bản
        </Menu.Item>
      )}
      {editor.isEditable && match("Chuyển lên Move up") && (
        <Menu.Item onClick={() => editor.moveBlocksUp(block)}>
          <ArrowUp className="size-4" />
          Chuyển lên
        </Menu.Item>
      )}
      {editor.isEditable && match("Chuyển xuống Move down") && (
        <Menu.Item onClick={() => editor.moveBlocksDown(block)}>
          <ArrowDown className="size-4" />
          Chuyển xuống
        </Menu.Item>
      )}
      {context && match("Bình luận Comment") && (
        <Menu.Item onClick={() => context.onComment(block.id)}>
          <MessageSquare className="size-4" />
          Bình luận
        </Menu.Item>
      )}
      {context && match("Hỏi AI Ask AI") && (
        <Menu.Item onClick={() => context.onAskAi(text)}>
          <Sparkles className="size-4" />
          Hỏi AI về khối này
        </Menu.Item>
      )}
      {context && match("Hướng dẫn LaTeX") && (
        <Menu.Item onClick={context.onGuide}>
          <BookOpen className="size-4" />
          Hướng dẫn LaTeX
        </Menu.Item>
      )}
      {editor.isEditable && (
        <>
          <Menu.Divider />
          <RemoveBlockItem>
            {block.type === "pageLink"
              ? "Gỡ liên kết khỏi nội dung"
              : "Xóa khối"}
          </RemoveBlockItem>
        </>
      )}
      <div className="border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-lms-border dark:text-slate-400">
        {text.trim() ? text.trim().split(/\s+/u).length : 0} từ ·{" "}
        {Array.from(text).length} ký tự
      </div>
    </DragHandleMenu>
  );
}
