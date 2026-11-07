"use client";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Clock3,
  FileText,
  Folder,
  UserRound,
} from "lucide-react";
import type { WorkspaceLibraryModel } from "../../hooks/useWorkspaceLibrary";
import { libraryColumns } from "../../utils/library";
import { renderLibraryRows } from "./LibraryRows";
import styles from "./WorkspaceLibrary.module.css";
const columnIcons = {
  title: FileText,
  creator: UserRound,
  source: Folder,
  created: Clock3,
  editor: UserRound,
  edited: Clock3,
  visited: Clock3,
};
export function LibraryTable({ model }: { model: WorkspaceLibraryModel }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const columns = model.preferences.columns.filter(
      (id) => !model.preferences.hidden.includes(id),
    ),
    nestedIds = new Set<string>();
  for (const id of model.expanded)
    for (const row of model.children[id]?.items || []) nestedIds.add(row.id);
  return (
    <div className={styles.tableScroll} aria-busy={model.loading}>
      <table
        className={styles.table}
        aria-label="Danh sách trang trong thư viện"
        style={{ minWidth: Math.max(400, 330 + (columns.length - 1) * 175) }}
      >
        <colgroup>
          {columns.map((id) => (
            <col
              key={id}
              className={id === "title" ? styles.titleCol : undefined}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((id) => {
              const Icon = columnIcons[id];
              return (
                <th
                  key={id}
                  scope="col"
                  aria-sort={
                    model.preferences.sort === id
                      ? model.preferences.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button type="button" onClick={() => model.sort(id)}>
                    <Icon size={16} />
                    {libraryColumns.find((column) => column.id === id)!.label}
                    {model.preferences.sort === id &&
                      (model.preferences.direction === "asc" ? (
                        <ArrowUp size={13} />
                      ) : (
                        <ArrowDown size={13} />
                      ))}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        {renderLibraryRows(
          model,
          model.items.filter((row) => !nestedIds.has(row.id)),
          columns,
          now,
        )}
      </table>
    </div>
  );
}
