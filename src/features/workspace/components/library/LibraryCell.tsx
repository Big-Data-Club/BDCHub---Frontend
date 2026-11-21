"use client";
import Link from "next/link";
import { FileText, Folder, LockKeyhole, Users } from "lucide-react";
import type { WorkspaceLibraryModel } from "../../hooks/useWorkspaceLibrary";
import type {
  LibraryColumn,
  LibraryPage,
  LibrarySource,
} from "../../types/library";
import { libraryTime } from "../../utils/library";
import styles from "./WorkspaceLibrary.module.css";
function Source({
  source,
  model,
}: {
  source: LibrarySource;
  model: WorkspaceLibraryModel;
}) {
  const Icon =
    source.kind === "private"
      ? LockKeyhole
      : source.kind === "shared" || source.kind === "space"
        ? Users
        : source.kind === "field"
          ? Folder
          : FileText;
  const content = (
    <>
      <Icon size={16} />
      <span>{source.title}</span>
    </>
  );
  const href =
    source.kind === "page"
      ? `/workspace?page=${source.id}`
      : source.kind === "field"
        ? `/workspace?space=${source.space_id}&field=${source.id}`
        : source.kind === "space"
          ? `/workspace?space=${source.id}`
          : null;
  return href ? (
    <Link href={href} className={styles.source} title={source.title}>
      {content}
    </Link>
  ) : (
    <button
      type="button"
      className={styles.source}
      onClick={() =>
        model.setTab(source.kind === "private" ? "private" : "shared")
      }
    >
      {content}
    </button>
  );
}
export function LibraryCell({
  row,
  column,
  model,
  now,
}: {
  row: LibraryPage;
  column: LibraryColumn;
  model: WorkspaceLibraryModel;
  now: number;
}) {
  if (column === "source") return <Source source={row.source} model={model} />;
  if (column === "creator" || column === "editor") {
    const name = column === "creator" ? row.creator_name : row.last_editor;
    return (
      <span className={styles.person}>
        <i aria-hidden>{name.trim()[0]?.toLocaleUpperCase("vi") || "?"}</i>
        <span>{name}</span>
      </span>
    );
  }
  const value =
    column === "created"
      ? row.created_at
      : column === "visited"
        ? row.opened_at
        : row.updated_at;
  return (
    <time
      dateTime={value || undefined}
      title={
        value ? new Date(value).toLocaleString("vi-VN") : "Chưa truy cập trang"
      }
    >
      {libraryTime(value, now)}
    </time>
  );
}
