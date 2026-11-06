"use client";
import { ArrowRight, MoreHorizontal, Settings2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WorkspaceField } from "../../types";
import { FieldArtwork } from "./FieldArtwork";
import styles from "./Fields.module.css";
export function FieldCard({
  field,
  index,
  canEdit,
  canManage,
  personal,
  onEdit,
  onArchive,
  onOpen,
}: {
  field: WorkspaceField;
  index: number;
  canEdit: boolean;
  canManage: boolean;
  personal: boolean;
  onEdit: (field: WorkspaceField) => void;
  onArchive: (field: WorkspaceField) => void;
  onOpen: (field: WorkspaceField) => void;
}) {
  return (
    <article className={styles.card} data-tone={field.color} key={field.id}>
      {canEdit && (
        <div className={styles.cardMenu}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Thao tác lĩnh vực ${field.title}`}
                className="rounded-lg bg-white/70 p-1.5 text-slate-500 backdrop-blur hover:bg-white dark:bg-slate-900/60 dark:text-slate-300"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(field)}>
                <Settings2 className="mr-2 size-4" />
                Chỉnh sửa lĩnh vực
              </DropdownMenuItem>
              {canManage && (
                <DropdownMenuItem
                  onClick={() => onArchive(field)}
                  className="text-rose-600"
                >
                  <Trash2 className="mr-2 size-4" />
                  Lưu trữ lĩnh vực
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <button
        type="button"
        className={styles.cardLink}
        onClick={() => onOpen(field)}
        aria-label={`Mở lĩnh vực ${field.title}`}
      >
        <FieldArtwork icon={field.icon} color={field.color} index={index} />
        <div className={styles.body}>
          <span className={styles.eyebrow}>
            {personal ? "CÁ NHÂN" : "NHÓM"} / NOTEBOOK
          </span>
          <h3>{field.title}</h3>
          <p className={styles.description}>
            {field.description ||
              "Nơi lưu lại những ý tưởng, ghi chép và khám phá của bạn."}
          </p>
          <div className={styles.tags}>
            {field.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className={styles.cardFooter}>
            <span>
              Mở không gian<small>{field.page_count} trang</small>
            </span>
            <ArrowRight className="size-5" />
          </div>
        </div>
      </button>
    </article>
  );
}
