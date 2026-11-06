"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Files,
  Layers3,
  LockKeyhole,
  Plus,
  Search,
  Trash2,
  Users,
  LibraryBig,
} from "lucide-react";
import type {
  WorkspaceBootstrap,
  WorkspaceField,
  WorkspaceSpace,
} from "../../types";
import { useFieldActions } from "../../hooks/useFieldActions";
import { WorkspaceTabPicker } from "../WorkspaceTabPicker";
import { FieldCard } from "./FieldCard";
import { FieldDialog } from "./FieldDialog";
import {
  WorkspaceButton,
  WorkspaceDialog,
  WorkspaceErrorBanner,
  workspaceInputClass,
} from "../WorkspacePrimitives";
import styles from "./Fields.module.css";
export function WorkspaceLanding({
  bootstrap,
  space,
  error,
  onRefresh,
  onSpace,
  onField,
  onPage,
  onCreateSpace,
  onInbox,
  onTrash,
}: {
  bootstrap: WorkspaceBootstrap;
  space?: WorkspaceSpace;
  error: string | null;
  onRefresh: () => Promise<void>;
  onSpace: (id: string) => void;
  onField: (field: WorkspaceField) => void;
  onPage: (id: string) => void;
  onCreateSpace: () => void;
  onInbox: () => void;
  onTrash: () => void;
}) {
  const [query, setQuery] = useState(""),
    [picker, setPicker] = useState(false),
    [confirm, setConfirm] = useState<WorkspaceField | null>(null),
    actions = useFieldActions(space?.id, onRefresh);
  const fields = bootstrap.fields.filter(
      (field) => field.space_id === space?.id,
    ),
    shown = fields.filter((field) =>
      `${field.title} ${field.description} ${field.tags.join(" ")}`
        .toLocaleLowerCase("vi")
        .includes(query.toLocaleLowerCase("vi")),
    ),
    canEdit = !!space && ["owner", "manager", "editor"].includes(space.role),
    canManage = !!space && ["owner", "manager"].includes(space.role);
  return (
    <div className={styles.landing}>
      <div className={styles.content}>
        <header className={styles.topbar}>
          <span className={styles.wordmark}>
            <Layers3 className="size-5" />
            Workspace
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/workspace/library"
              className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-lms-hover"
            >
              <LibraryBig className="size-4" />
              Thư viện
            </Link>
            <label className="sr-only" htmlFor="workspace-space">
              Không gian
            </label>
            <select
              id="workspace-space"
              aria-label="Không gian Workspace"
              className={`${workspaceInputClass} max-w-60`}
              value={space?.id || ""}
              onChange={(event) => onSpace(event.target.value)}
            >
              {bootstrap.spaces.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <WorkspaceButton
              onClick={() => setPicker(true)}
              aria-label="Tìm trang trong Workspace"
            >
              <Files className="size-4" />
            </WorkspaceButton>
            <WorkspaceButton
              onClick={onCreateSpace}
              aria-label="Tạo không gian nhóm"
            >
              <Users className="size-4" />
            </WorkspaceButton>
            <WorkspaceButton
              onClick={onInbox}
              aria-label="Lời mời và thông báo"
            >
              <Bell className="size-4" />
              {bootstrap.invitations.length > 0 && (
                <span>{bootstrap.invitations.length}</span>
              )}
            </WorkspaceButton>
          </div>
        </header>
        <section className={styles.intro}>
          <span className={styles.eyebrow}>
            Ý TƯỞNG CỦA BẠN · KHÔNG GIAN CỦA BẠN
          </span>
          <h1>Một lĩnh vực của riêng bạn.</h1>
          <p>
            Một nơi để suy nghĩ, kết nối và viết. Tự tạo lĩnh vực, bắt đầu một
            trang và xây dựng thư viện tri thức theo cách của bạn.
          </p>
          <span className={styles.private}>
            {space?.kind === "personal" ? (
              <LockKeyhole className="size-4" />
            ) : (
              <Users className="size-4" />
            )}
            {space?.kind === "personal"
              ? "Riêng tư mặc định · Chia sẻ khi bạn sẵn sàng"
              : `Không gian nhóm · ${space?.title || "Chọn không gian"}`}
          </span>
        </section>
        <WorkspaceErrorBanner
          message={error || (!actions.open ? actions.error : null)}
        />
        <section aria-label="Các lĩnh vực">
          <div className={styles.heading}>
            <div>
              <h2>Lĩnh vực của bạn</h2>
              <p className="mt-2 text-[11px] tracking-widest text-slate-400">
                {String(fields.length).padStart(2, "0")} / LĨNH VỰC
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {fields.length > 0 && (
                <label className="flex items-center gap-2">
                  <Search className="size-4 text-slate-400" />
                  <input
                    aria-label="Tìm lĩnh vực"
                    placeholder="Tìm lĩnh vực…"
                    className={`${workspaceInputClass} w-44`}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
              )}
              {canEdit && (
                <WorkspaceButton
                  onClick={actions.create}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Plus className="size-4" />
                  Tạo lĩnh vực
                </WorkspaceButton>
              )}
              {canManage && (
                <WorkspaceButton aria-label="Mở thùng rác" onClick={onTrash}>
                  <Trash2 className="size-4" />
                </WorkspaceButton>
              )}
            </div>
          </div>
          {shown.length ? (
            <div className={styles.grid}>
              {shown.map((field, index) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  index={index}
                  canEdit={canEdit}
                  canManage={canManage}
                  personal={space?.kind === "personal"}
                  onEdit={actions.edit}
                  onArchive={setConfirm}
                  onOpen={onField}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <BookOpen className="size-10 text-violet-400" />
              <h3>
                {fields.length
                  ? "Chưa tìm thấy lĩnh vực phù hợp"
                  : "Bắt đầu với điều bạn quan tâm"}
              </h3>
              <p>
                {fields.length
                  ? "Thử một từ khóa khác để tìm lại lĩnh vực của bạn."
                  : "Bạn tự đặt tên và tổ chức lĩnh vực. Một môn học, một dự án hay một ý tưởng mới đều có thể bắt đầu ở đây."}
              </p>
              {canEdit && !fields.length && (
                <WorkspaceButton
                  onClick={actions.create}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Plus className="size-4" />
                  Tạo lĩnh vực đầu tiên
                </WorkspaceButton>
              )}
            </div>
          )}
        </section>
        <Link className={styles.guide} href="/workspace/guide">
          <BookOpen className="size-5 shrink-0" />
          <span>Hướng dẫn editor & thư viện công thức LaTeX</span>
          <ArrowRight className="size-4 shrink-0" />
        </Link>
      </div>
      {picker && (
        <WorkspaceTabPicker
          bootstrap={bootstrap}
          canCreate={false}
          onClose={() => setPicker(false)}
          onOpen={(id) => {
            setPicker(false);
            onPage(id);
          }}
          onNew={() => {}}
        />
      )}
      <FieldDialog
        open={actions.open}
        editing={actions.editing}
        busy={actions.busy}
        error={actions.error}
        onOpenChange={actions.setOpen}
        onSave={actions.save}
      />
      <WorkspaceDialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title="Chuyển lĩnh vực vào thùng rác?"
        description="Lĩnh vực cùng các trang bên trong sẽ vào thùng rác. Bạn có thể khôi phục lại sau."
      >
        <WorkspaceErrorBanner message={actions.error} />
        <WorkspaceButton
          disabled={actions.busy}
          className="bg-rose-600 text-white hover:bg-rose-700"
          onClick={() => {
            if (confirm)
              void actions.archive(confirm).then((ok) => {
                if (ok) setConfirm(null);
              });
          }}
        >
          <Trash2 className="size-4" /> Chuyển vào thùng rác
        </WorkspaceButton>
      </WorkspaceDialog>
    </div>
  );
}
