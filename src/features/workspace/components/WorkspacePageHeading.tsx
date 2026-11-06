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
      {page.cover || page.cover_image_id ? (
        <div className={styles.cover}>
          <div className={styles.coverArt}>
            {page.cover_image_id ? (
              // Private attachments are served by the authenticated Workspace endpoint.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/workspace/files/${page.cover_image_id}`}
                alt="Ảnh bìa trang"
                className="h-[185px] w-full object-cover max-sm:h-[145px]"
              />
            ) : (
              <FieldArtwork
                icon={field?.icon || "book"}
                color={page.cover || "violet"}
              />
            )}
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
      <div
        className={
          page.cover || page.cover_image_id
            ? styles.titleWithCover
            : styles.title
        }
      >
        <WorkspacePageTitle page={page} editable={editable} onSave={onSave} />
      </div>
    </div>
  );
}
