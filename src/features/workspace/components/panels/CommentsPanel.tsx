"use client";
import { useState } from "react";
import { Send, Check, Trash2 } from "lucide-react";
import { workspaceService } from "../../api/workspaceService";
import type { WorkspacePage, WorkspaceUser } from "../../types";
import type { useWorkspacePanel } from "../../hooks/useWorkspacePanel";
import { WorkspaceButton, workspaceInputClass } from "../WorkspacePrimitives";

const time = (value: string) => new Date(value).toLocaleString("vi-VN");
export function CommentsPanel({
  model,
  page,
  user,
  blockId,
}: {
  model: ReturnType<typeof useWorkspacePanel>;
  page: WorkspacePage;
  user: WorkspaceUser;
  blockId?: string;
}) {
  const access = page.access || 0;
  const [body, setBody] = useState(""),
    [reply, setReply] = useState<string>(),
    [mentions, setMentions] = useState<string[]>([]);
  return (
    <>
      {blockId && (
        <p className="rounded-lg bg-blue-50 p-2 text-xs dark:bg-blue-500/10">
          Bình luận gắn với khối đang chọn.
        </p>
      )}
      {model.comments.map((comment) => (
        <article
          key={comment.id}
          className={`space-y-2 rounded-xl border border-slate-200 p-3 dark:border-lms-border ${comment.parent_id ? "ml-4" : ""} ${comment.resolved ? "opacity-60" : ""}`}
        >
          <p className="flex justify-between gap-2 text-xs">
            <strong>{comment.author_name}</strong>
            <time>{time(comment.created_at)}</time>
          </p>
          <p className="whitespace-pre-wrap break-words">{comment.body}</p>
          {comment.block_id && (
            <a
              className="text-xs text-blue-600 dark:text-cyan-400"
              href={`/workspace?page=${page.id}&block=${encodeURIComponent(comment.block_id)}`}
            >
              Đến khối được nhắc
            </a>
          )}
          <div className="flex flex-wrap gap-1">
            {comment.resolved && <span className="text-xs">Đã giải quyết</span>}
            {access >= 2 && (
              <WorkspaceButton
                className="h-7 px-2 text-xs"
                onClick={() => setReply(comment.parent_id || comment.id)}
              >
                Trả lời
              </WorkspaceButton>
            )}
            {(comment.author_id === user.id || access >= 4) && (
              <>
                <WorkspaceButton
                  disabled={model.busy}
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    void model.run(() =>
                      workspaceService.changeComment(comment.id, {
                        resolved: !comment.resolved,
                      }),
                    )
                  }
                >
                  <Check className="size-3" />
                  {comment.resolved ? "Mở lại" : "Giải quyết"}
                </WorkspaceButton>
                <WorkspaceButton
                  aria-label="Xóa bình luận"
                  disabled={model.busy}
                  className="h-7 px-2"
                  onClick={() =>
                    void model.run(() =>
                      workspaceService.changeComment(comment.id, {
                        delete: true,
                      }),
                    )
                  }
                >
                  <Trash2 className="size-3" />
                </WorkspaceButton>
              </>
            )}
          </div>
        </article>
      ))}
      {access >= 2 ? (
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            void model.run(async () => {
              await workspaceService.comment(
                page.id,
                body,
                blockId,
                reply,
                mentions,
              );
              setBody("");
              setReply(undefined);
              setMentions([]);
            });
          }}
        >
          {reply && (
            <WorkspaceButton
              onClick={() => setReply(undefined)}
              className="text-xs"
            >
              Hủy trả lời
            </WorkspaceButton>
          )}
          <textarea
            required
            maxLength={10000}
            aria-label="Nội dung bình luận"
            placeholder="Viết bình luận…"
            className={`${workspaceInputClass} min-h-24 w-full`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <label className="grid gap-1 text-xs">
            Nhắc thành viên
            <select
              multiple
              aria-label="Nhắc thành viên"
              className={workspaceInputClass}
              value={mentions}
              onChange={(event) =>
                setMentions(
                  Array.from(
                    event.target.selectedOptions,
                    (option) => option.value,
                  ),
                )
              }
            >
              {model.sharing?.members.map((member) => (
                <option key={`${member.source}:${member.id}`} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <WorkspaceButton type="submit" disabled={model.busy || !body.trim()}>
            <Send className="size-4" />
            Gửi bình luận
          </WorkspaceButton>
        </form>
      ) : (
        <p className="text-slate-500">Bạn có quyền xem trang.</p>
      )}
    </>
  );
}
