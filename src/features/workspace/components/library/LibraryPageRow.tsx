"use client";
import Link from "next/link";
import { ChevronDown, ChevronRight, FileText, Star } from "lucide-react";
import type { WorkspaceLibraryModel } from "../../hooks/useWorkspaceLibrary";
import type { LibraryColumn, LibraryPage } from "../../types/library";
import { LibraryCell } from "./LibraryCell";
import styles from "./WorkspaceLibrary.module.css";
export function LibraryPageRow({
  row,
  columns,
  depth,
  now,
  model,
}: {
  row: LibraryPage;
  columns: LibraryColumn[];
  depth: number;
  now: number;
  model: WorkspaceLibraryModel;
}) {
  const expanded = model.expanded.has(row.id);
  return (
    <tr>
      {columns.map((column) => (
        <td key={column} data-column={column}>
          {column === "title" ? (
            <div
              className={styles.pageName}
              style={{ paddingLeft: Math.min(depth, 12) * 20 }}
            >
              <button
                type="button"
                className={styles.expand}
                disabled={!row.has_children}
                aria-label={`${expanded ? "Thu gọn" : "Mở rộng"} ${row.title}`}
                aria-expanded={row.has_children ? expanded : undefined}
                onClick={() => model.toggleExpanded(row.id)}
              >
                {row.has_children ? (
                  expanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )
                ) : (
                  <span />
                )}
              </button>
              <span className={styles.pageIcon}>
                {row.icon || <FileText size={19} />}
              </span>
              <Link href={`/workspace?page=${row.id}`} title={row.title}>
                {row.title}
              </Link>
              <button
                type="button"
                className={styles.favorite}
                data-favorite={row.favorite || undefined}
                aria-label={`${row.favorite ? "Bỏ yêu thích" : "Yêu thích"} ${row.title}`}
                aria-pressed={row.favorite}
                disabled={model.busyFavorites.has(row.id)}
                onClick={() => void model.toggleFavorite(row)}
              >
                <Star size={16} fill={row.favorite ? "currentColor" : "none"} />
              </button>
            </div>
          ) : (
            <LibraryCell row={row} column={column} model={model} now={now} />
          )}
        </td>
      ))}
    </tr>
  );
}
