"use client";
import { FileText, Palette, Plus } from "lucide-react";
import type { WorkspaceField, WorkspacePage } from "../types";
import { WorkspacePageTitle } from "./WorkspacePageTitle";
import { WorkspaceButton } from "./WorkspacePrimitives";
import { FieldArtwork, fieldIcons } from "./fields/FieldArtwork";
import styles from "./WorkspacePageHeading.module.css";
export function WorkspacePageHeading({
  page,
  field,
  editable,
  onCustomize,
  onSave,
}: {
  page: WorkspacePage;
  field: WorkspaceField | null;
  editable: boolean;
  onCustomize: () => void;
  onSave: (title: string, version: number) => Promise<unknown>;
}) {
  const Icon = field ? fieldIcons[field.icon] : FileText;
  return (
    <div className={styles.heading}>
      {page.cover ? (
        <div className={styles.cover}>
          <div className={styles.coverArt}>
            <FieldArtwork icon={field?.icon || "book"} color={page.cover} />
          </div>
          <button
            type="button"
            aria-label="Đổi icon và cover"
            disabled={!editable}
            className={styles.badge}
            onClick={onCustomize}
          >
            {page.icon || <Icon className="size-10" strokeWidth={1.4} />}
          </button>
          {editable && (
            <WorkspaceButton onClick={onCustomize} className={styles.customize}>
              <Palette className="size-4" />
              Tùy chỉnh trang
            </WorkspaceButton>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 pb-3">
          <button
            type="button"
            aria-label="Đổi icon và cover"
            disabled={!editable}
            className={`${styles.badge} ${styles.withoutCover}`}
            onClick={onCustomize}
          >
            {page.icon || <Icon className="size-10" strokeWidth={1.4} />}
          </button>
          {editable && (
            <WorkspaceButton
              onClick={onCustomize}
              className="text-xs text-slate-500"
            >
              <Plus className="size-3" />
              Thêm bìa & biểu tượng
            </WorkspaceButton>
          )}
        </div>
      )}
      <div className={page.cover ? styles.titleWithCover : styles.title}>
        <WorkspacePageTitle page={page} editable={editable} onSave={onSave} />
        <p className={styles.caption}>
          {field?.title || "Trang ghi chép"}
          <span>·</span>Cập nhật{" "}
          {new Date(page.updated_at).toLocaleDateString("vi-VN")}
        </p>
      </div>
    </div>
  );
}
