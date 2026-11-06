"use client";
import { useEffect, useRef, useState } from "react";
import { WorkspaceTrashDialog } from "./dialogs/WorkspaceTrashDialog";
import { PageAppearanceFields } from "./PageAppearanceFields";
import { workspaceService } from "../api/workspaceService";
import type {
  WorkspaceBootstrap,
  WorkspacePage,
  WorkspaceSpace,
} from "../types";
import {
  WorkspaceButton,
  WorkspaceDialog,
  WorkspaceErrorBanner,
  workspaceInputClass,
} from "./WorkspacePrimitives";
export type WorkspaceDialogState =
  | { type: "create"; parent?: string }
  | { type: "team" | "trash" | "notes" | "inbox" }
  | { type: "rename" | "appearance" | "move" | "archive"; page: WorkspacePage }
  | null;
export function WorkspaceDialogs({
  value,
  onClose,
  space,
  pages,
  bootstrap,
  onRefresh,
  onOpen,
  onCreate,
}: {
  value: WorkspaceDialogState;
  onClose: () => void;
  space?: WorkspaceSpace;
  pages: WorkspacePage[];
  bootstrap: WorkspaceBootstrap;
  onRefresh: () => Promise<void>;
  onOpen: (id?: string, space?: string) => void;
  onCreate: (
    title: string,
    kind: "page" | "database",
    parent?: string,
    template?: string,
  ) => Promise<unknown>;
}) {
  const [title, setTitle] = useState(""),
    [kind, setKind] = useState<"page" | "database">("page"),
    [template, setTemplate] = useState("blank"),
    [parent, setParent] = useState(""),
    [fieldId, setFieldId] = useState(""),
    [icon, setIcon] = useState(""),
    [cover, setCover] = useState<WorkspacePage["cover"]>(""),
    [full, setFull] = useState(false);
  const [notes, setNotes] = useState<
      Awaited<ReturnType<typeof workspaceService.legacyNotes>>
    >([]),
    [notifications, setNotifications] = useState<
      { id: string; page_id: string; title: string; kind: string }[]
    >([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const spaceId = space?.id;
  useEffect(() => {
    const current = ++generation.current;
    let cancelled = false;
    setError(null);
    setTitle(value && "page" in value ? value.page.title : "");
    setKind("page");
    setTemplate("blank");
    setParent(value && "page" in value ? value.page.parent_id || "" : "");
    setFieldId(value && "page" in value ? value.page.field_id || "" : "");
    setIcon(value && "page" in value ? value.page.icon : "");
    setCover(value && "page" in value ? value.page.cover : "");
    setFull(Boolean(value && "page" in value && value.page.full_width));
    setNotes([]);
    const load = async () => {
      if (value?.type === "notes") {
        const result = await workspaceService.legacyNotes();
        if (!cancelled && current === generation.current) setNotes(result);
      }
      if (value?.type === "inbox") {
        const result = await workspaceService.notifications();
        if (!cancelled && current === generation.current)
          setNotifications(result);
      }
    };
    void load().catch((reason) => {
      if (!cancelled && current === generation.current)
        setError(
          reason instanceof Error ? reason.message : "Chưa tải được thông tin.",
        );
    });
    return () => {
      cancelled = true;
    };
  }, [value, spaceId]);
  if (!value) return null;
  if (value.type === "trash")
    return (
      <WorkspaceTrashDialog
        space={space}
        onClose={onClose}
        onRefresh={onRefresh}
      />
    );
  const titles = {
    create: "Trang mới",
    team: "Không gian nhóm mới",
    trash: "Thùng rác",
    notes: "Vở ghi hiện có",
    inbox: "Lời mời & thông báo",
    rename: "Đổi tên trang",
    appearance: "Icon & cover",
    move: "Di chuyển trang",
    archive: "Đưa vào thùng rác",
  };
  const description =
    value.type === "notes"
      ? "Đưa bản ghi chú vào không gian cá nhân và giữ liên kết nguồn."
      : value.type === "archive"
        ? "Cả nhánh trang con sẽ vào thùng rác. Bạn có thể khôi phục sau."
        : value.type === "team"
          ? "Thành viên tham gia bằng lời mời."
          : "Các thay đổi được kiểm tra theo quyền của bạn.";
  async function run(action: () => Promise<unknown>, close = true) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await onRefresh();
      if (close) onClose();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa hoàn thành thao tác.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!value) return;
    if (value.type === "create")
      await onCreate(title.trim(), kind, value.parent, template);
    if (value.type === "team") {
      const created = await workspaceService.createSpace(title.trim());
      onOpen(undefined, created.id);
    }
    if ("page" in value) {
      const page = value.page;
      if (value.type === "archive") {
        await workspaceService.archive(page.id);
        onOpen(undefined, page.space_id);
      } else
        await workspaceService.updatePage(page.id, {
          version: page.version,
          ...(value.type === "rename"
            ? { title: title.trim() }
            : value.type === "appearance"
              ? { icon, cover, full_width: full }
              : { parent_id: parent || null, field_id: fieldId || null }),
        });
    }
  }
  const forbidden = new Set<string>();
  if ("page" in value) {
    forbidden.add(value.page.id);
    let changed = true;
    while (changed) {
      changed = false;
      for (const page of pages)
        if (
          page.parent_id &&
          forbidden.has(page.parent_id) &&
          !forbidden.has(page.id)
        ) {
          forbidden.add(page.id);
          changed = true;
        }
    }
  }
  return (
    <WorkspaceDialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
      title={titles[value.type]}
      description={description}
    >
      <WorkspaceErrorBanner message={error} />
      {["create", "team", "rename", "appearance", "move", "archive"].includes(
        value.type,
      ) && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void run(save);
          }}
        >
          {["create", "team", "rename"].includes(value.type) && (
            <label className="grid gap-2 text-sm">
              Tên
              <input
                autoFocus
                required
                aria-label="Tên trang hoặc không gian"
                maxLength={value.type === "team" ? 120 : 300}
                className={workspaceInputClass}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
          )}
          {value.type === "create" && (
            <>
              <label className="grid gap-2 text-sm">
                Loại
                <select
                  aria-label="Loại trang"
                  className={workspaceInputClass}
                  value={kind}
                  onChange={(event) =>
                    setKind(event.target.value as typeof kind)
                  }
                >
                  <option value="page">Trang ghi chép</option>
                  <option value="database">Bảng quản lý · database</option>
                </select>
              </label>
              {kind === "page" && (
                <label className="grid gap-2 text-sm">
                  Mẫu khởi đầu
                  <select
                    className={workspaceInputClass}
                    aria-label="Mẫu trang"
                    value={template}
                    onChange={(event) => setTemplate(event.target.value)}
                  >
                    {[
                      ["blank", "Trang trống"],
                      ["meeting", "Biên bản họp"],
                      ["research", "Nghiên cứu"],
                      ["lab", "Nhật ký lab"],
                      ["learning", "Ghi chú bài học"],
                    ].map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}
          {value.type === "appearance" && (
            <PageAppearanceFields
              icon={icon}
              cover={cover}
              full={full}
              onIcon={setIcon}
              onCover={setCover}
              onFull={setFull}
            />
          )}
          {value.type === "move" && (
            <label className="grid gap-2 text-sm">
              Lĩnh vực
              <select
                aria-label="Lĩnh vực đích"
                className={workspaceInputClass}
                value={fieldId}
                onChange={(event) => {
                  setFieldId(event.target.value);
                  setParent("");
                }}
              >
                <option value="">Chưa xếp lĩnh vực</option>
                {bootstrap.fields
                  .filter(
                    (field) =>
                      field.space_id ===
                      ("page" in value ? value.page.space_id : space?.id),
                  )
                  .map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.title}
                    </option>
                  ))}
              </select>
            </label>
          )}
          {value.type === "move" && (
            <label className="grid gap-2 text-sm">
              Trang cha
              <select
                aria-label="Trang cha mới"
                className={workspaceInputClass}
                value={parent}
                onChange={(event) => setParent(event.target.value)}
              >
                <option value="">Cấp cao nhất</option>
                {pages
                  .filter(
                    (page) =>
                      page.kind === "page" &&
                      !forbidden.has(page.id) &&
                      page.field_id === (fieldId || null),
                  )
                  .map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <WorkspaceButton
            type="submit"
            disabled={busy}
            className={
              value.type === "archive"
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }
          >
            {busy
              ? "Đang lưu…"
              : value.type === "archive"
                ? "Đưa nhánh vào thùng rác"
                : value.type === "create" || value.type === "team"
                  ? "Tạo mới"
                  : "Lưu thay đổi"}
          </WorkspaceButton>
        </form>
      )}
      {value.type === "notes" &&
        (notes.length ? (
          notes.map((note) => (
            <div
              key={note.id}
              className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-lms-border"
            >
              <strong className="text-sm">{note.title}</strong>
              <p className="line-clamp-2 text-xs text-slate-500">
                {note.content}
              </p>
              <WorkspaceButton
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const page = await workspaceService.importLegacy(note.id);
                    onOpen(page.id);
                  })
                }
              >
                Đưa vào Workspace
              </WorkspaceButton>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Chưa có ghi chú để đưa vào.</p>
        ))}
      {value.type === "inbox" && (
        <>
          <h3 className="font-medium">Lời mời</h3>
          {bootstrap.invitations.length ? (
            bootstrap.invitations.map((invite) => (
              <div
                key={invite.id}
                className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-lms-border"
              >
                <strong>{invite.title}</strong>
                <p className="text-xs text-slate-500">
                  {invite.sender} mời bạn · quyền {invite.role}
                </p>
                <div className="flex gap-2">
                  <WorkspaceButton
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => workspaceService.respond(invite.id, "accept"),
                        false,
                      )
                    }
                  >
                    Chấp nhận
                  </WorkspaceButton>
                  <WorkspaceButton
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => workspaceService.respond(invite.id, "decline"),
                        false,
                      )
                    }
                  >
                    Từ chối
                  </WorkspaceButton>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Không có lời mời đang chờ.</p>
          )}
          <h3 className="font-medium">Nhắc đến bạn</h3>
          {notifications.map((item) => (
            <WorkspaceButton
              key={item.id}
              className="h-auto w-full justify-start whitespace-normal text-left"
              onClick={() =>
                void run(async () => {
                  await workspaceService.readNotification(item.id);
                  onOpen(item.page_id);
                })
              }
            >
              {item.title}
            </WorkspaceButton>
          ))}
        </>
      )}
    </WorkspaceDialog>
  );
}
