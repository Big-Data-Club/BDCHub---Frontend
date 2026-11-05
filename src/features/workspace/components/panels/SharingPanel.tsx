"use client";
import { useState } from "react";
import { Copy } from "lucide-react";
import { workspaceService } from "../../api/workspaceService";
import type { WorkspacePage, WorkspaceSpace, WorkspaceRole } from "../../types";
import type { useWorkspacePanel } from "../../hooks/useWorkspacePanel";
import { WorkspaceButton, workspaceInputClass } from "../WorkspacePrimitives";

const roles: [WorkspaceRole, string][] = [
  ["viewer", "Xem"],
  ["commenter", "Bình luận"],
  ["editor", "Chỉnh sửa"],
  ["manager", "Quản lý"],
];

export function SharingPanel({
  model,
  page,
  space,
}: {
  model: ReturnType<typeof useWorkspacePanel>;
  page: WorkspacePage;
  space?: WorkspaceSpace;
}) {
  const access = page.access || 0;
  const [email, setEmail] = useState(""),
    [role, setRole] = useState<WorkspaceRole>("viewer"),
    [scope, setScope] = useState("page");
  return (
    <>
      <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
        Liên kết yêu cầu người nhận có quyền truy cập. Chia sẻ một trang thường
        không tự chia sẻ các trang con; chia sẻ bảng cho phép xem các mục thuộc
        bảng.
      </p>
      <WorkspaceButton
        onClick={() =>
          void model.run(() =>
            navigator.clipboard.writeText(
              `${location.origin}/workspace?page=${page.id}`,
            ),
          )
        }
      >
        <Copy className="size-4" />
        Sao chép liên kết
      </WorkspaceButton>
      {access >= 4 && (
        <form
          className="space-y-3 rounded-xl bg-slate-50 p-3 dark:bg-lms-card"
          onSubmit={(event) => {
            event.preventDefault();
            void model.run(async () => {
              await workspaceService.invite({
                ...(scope === "space"
                  ? { space_id: page.space_id }
                  : { page_id: page.id }),
                email,
                role,
              });
              setEmail("");
            });
          }}
        >
          <label className="grid gap-1">
            Mời bằng email
            <input
              type="email"
              required
              maxLength={200}
              aria-label="Email người được mời"
              className={workspaceInputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <select
            aria-label="Quyền được mời"
            className={`${workspaceInputClass} w-full`}
            value={role}
            onChange={(event) => setRole(event.target.value as WorkspaceRole)}
          >
            {roles.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          {space?.kind === "team" &&
            ["owner", "manager"].includes(space.role) && (
              <label className="grid gap-1 text-xs">
                Phạm vi
                <select
                  className={workspaceInputClass}
                  value={scope}
                  onChange={(event) => setScope(event.target.value)}
                >
                  <option value="page">Trang hiện tại</option>
                  <option value="space">Cả không gian nhóm</option>
                </select>
              </label>
            )}
          <WorkspaceButton type="submit" disabled={model.busy}>
            Tạo lời mời
          </WorkspaceButton>
          <p className="text-xs text-slate-500">
            Lời mời xuất hiện trong Workspace của người nhận, hiệu lực 7 ngày.
          </p>
        </form>
      )}
      {model.sharing?.members.map((member) => (
        <div
          key={`${member.source}:${member.id}`}
          className="space-y-2 border-b border-slate-200 pb-3 dark:border-lms-border"
        >
          <div>
            <strong>{member.name}</strong>
            <p className="break-all text-xs text-slate-500">{member.email}</p>
            <p className="text-xs text-slate-500">
              {member.source === "space"
                ? "Quyền từ không gian"
                : "Chia sẻ trang"}
            </p>
          </div>
          {access >= 4 &&
          member.role !== "owner" &&
          (member.source === "page" ||
            (space?.role === "owner" && space.kind === "team")) ? (
            <select
              aria-label={`Quyền của ${member.name}`}
              className={workspaceInputClass}
              value={member.role}
              disabled={model.busy}
              onChange={(event) =>
                void model.run(() =>
                  workspaceService.grant({
                    ...(member.source === "space"
                      ? { space_id: page.space_id }
                      : { page_id: page.id }),
                    member_id: member.id,
                    role:
                      event.target.value === "remove"
                        ? null
                        : (event.target.value as WorkspaceRole),
                  }),
                )
              }
            >
              {roles.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
              <option value="remove">Thu hồi quyền này</option>
            </select>
          ) : (
            <span className="text-xs">
              {member.role === "owner"
                ? "Chủ sở hữu"
                : roles.find(([id]) => id === member.role)?.[1]}
            </span>
          )}
        </div>
      ))}
      {model.sharing?.pending.map((invite) => (
        <div
          key={invite.id}
          className="flex flex-wrap items-center justify-between gap-2 text-xs"
        >
          <span className="break-all">{invite.email} · chờ chấp nhận</span>
          <WorkspaceButton
            disabled={model.busy}
            onClick={() =>
              void model.run(() => workspaceService.cancelInvite(invite.id))
            }
          >
            Hủy lời mời
          </WorkspaceButton>
        </div>
      ))}
    </>
  );
}
