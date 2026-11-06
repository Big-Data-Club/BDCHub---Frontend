"use client";
import { useState } from "react";
import { SideMenuExtension } from "@blocknote/core/extensions";
import {
  BlockColorsItem,
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
  PaintRoller,
  Repeat2,
  Search,
  Sigma,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useWorkspaceEditorContext } from "./EditorContext";
import { contentText, duplicateBlock } from "../../utils/editorContent";
import { useBlockActivity } from "../../hooks/useBlockActivity";
import styles from "./EditorMenus.module.css";
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
    [deleting, setDeleting] = useState(false),
    [deleteError, setDeleteError] = useState(""),
    [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  const activity = useBlockActivity(
    context?.page.id,
    block?.id,
    block ? JSON.stringify(block) : undefined,
  );
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
    <Menu.Dropdown
      className={`bn-menu-dropdown bn-drag-handle-menu ${styles.menu}`}
    >
      <div className={styles.search}>
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
      <div className={styles.caption}>
        {block.type === "pageLink"
          ? "Trang liên kết"
          : block.type === "mathBlock"
            ? "Công thức"
            : "Khối nội dung"}
      </div>
      {editor.isEditable &&
        match("Chuyển thành Turn into Công thức Equation Trang Page") && (
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
            <Menu.Dropdown sub className={`bn-menu-dropdown ${styles.menu}`}>
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
              {match("Công thức Equation") && (
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
              {block.type !== "pageLink" &&
                context?.page.space_role &&
                match("Trang Page") && (
                  <Menu.Item
                    onClick={() => {
                      editor.getExtension(SideMenuExtension)?.unfreezeMenu();
                      context.onConvertBlock(block.id);
                    }}
                  >
                    <FileText className="size-4" />
                    Chuyển thành trang con
                  </Menu.Item>
                )}
            </Menu.Dropdown>
          </Menu.Root>
        )}
      {editor.isEditable && match("Màu Color") && (
        <BlockColorsItem>
          <PaintRoller className="size-4" />
          Màu chữ & nền
        </BlockColorsItem>
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
      {context &&
        match(
          "Cộng tác Trợ giúp Bình luận Comment Hỏi AI Ask AI Hướng dẫn LaTeX",
        ) && (
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
                <MessageSquare className="size-4" />
                Cộng tác & trợ giúp
              </Menu.Item>
            </Menu.Trigger>
            <Menu.Dropdown sub className={`bn-menu-dropdown ${styles.menu}`}>
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
            </Menu.Dropdown>
          </Menu.Root>
        )}
      {editor.isEditable && (
        <>
          <Menu.Divider />
          {block.type === "pageLink" &&
          ["owner", "manager"].includes(context?.page.space_role || "") ? (
            <Menu.Item
              className={styles.danger}
              onClick={() => {
                if (deleting) return;
                setDeleting(true);
                void context
                  ?.onTrashPage(block.props.pageId)
                  .catch((reason) =>
                    setDeleteError(
                      reason instanceof Error
                        ? reason.message
                        : "Chưa xóa được trang.",
                    ),
                  )
                  .finally(() => setDeleting(false));
              }}
            >
              <Trash2 className="size-4" />
              Chuyển vào thùng rác
            </Menu.Item>
          ) : (
            <RemoveBlockItem>
              <Trash2 className={`size-4 ${styles.danger}`} />
              <span className={styles.danger}>
                {block.type === "pageLink"
                  ? "Gỡ liên kết khỏi nội dung"
                  : "Xóa khối"}
              </span>
            </RemoveBlockItem>
          )}
        </>
      )}
      <div className={styles.footer}>
        {deleteError && (
          <div role="alert" className={styles.danger}>
            {deleteError}
          </div>
        )}
        {activity && (
          <>
            <div>Sửa gần nhất bởi {activity.author}</div>
            <div>{new Date(activity.updated_at).toLocaleString("vi-VN")}</div>
          </>
        )}
        {text.trim() ? text.trim().split(/\s+/u).length : 0} từ ·{" "}
        {Array.from(text).length} ký tự
      </div>
    </Menu.Dropdown>
  );
}
