"use client";
import { useState } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import { ExternalLink, Link2, Pencil } from "lucide-react";
import { workspaceInputClass, WorkspaceButton } from "../WorkspacePrimitives";

export function safeWebUrl(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export const webLinkBlock = createReactBlockSpec(
  { type: "webLink", propSchema: { url: { default: "" } }, content: "none" },
  {
    render: function WebLink({ block, editor }) {
      const [editing, setEditing] = useState(false),
        [draft, setDraft] = useState(block.props.url),
        [error, setError] = useState("");
      const url = safeWebUrl(block.props.url);
      return (
        <div
          contentEditable={false}
          className="my-2 w-full rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-lms-border dark:bg-lms-shell"
        >
          {url && !editing ? (
            <div className="flex items-center gap-3">
              <Link2 className="size-5 shrink-0 text-blue-500" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1"
              >
                <span className="block font-medium">
                  {new URL(url).hostname}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {url}
                </span>
              </a>
              <ExternalLink className="size-4 text-slate-400" />
              {editor.isEditable && (
                <WorkspaceButton
                  aria-label="Sửa liên kết web"
                  onClick={() => {
                    setDraft(block.props.url);
                    setEditing(true);
                  }}
                >
                  <Pencil className="size-4" />
                </WorkspaceButton>
              )}
            </div>
          ) : editor.isEditable ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const valid = safeWebUrl(draft);
                if (!valid) {
                  setError("Nhập địa chỉ bắt đầu bằng https:// hoặc http://.");
                  return;
                }
                editor.updateBlock(block, { props: { url: valid } });
                setEditing(false);
                setError("");
              }}
              className="space-y-3"
            >
              <label className="grid gap-2 text-sm font-medium">
                Liên kết web
                <input
                  aria-label="Địa chỉ liên kết web"
                  placeholder="https://…"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className={workspaceInputClass}
                  maxLength={2048}
                />
              </label>
              {error && (
                <p role="alert" className="text-xs text-red-500">
                  {error}
                </p>
              )}
              <WorkspaceButton type="submit">Lưu liên kết</WorkspaceButton>
              {editing && (
                <WorkspaceButton onClick={() => setEditing(false)}>
                  Hủy
                </WorkspaceButton>
              )}
            </form>
          ) : (
            <span className="text-sm text-slate-500">
              Liên kết chưa có địa chỉ
            </span>
          )}
        </div>
      );
    },
    toExternalHTML: ({ block }) => (
      <a href={safeWebUrl(block.props.url) || undefined}>
        {safeWebUrl(block.props.url) || "Liên kết web"}
      </a>
    ),
  },
)();
