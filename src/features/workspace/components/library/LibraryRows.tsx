"use client";
import type { WorkspaceLibraryModel } from "../../hooks/useWorkspaceLibrary";
import type { LibraryColumn, LibraryPage } from "../../types/library";
import { LibraryPageRow } from "./LibraryPageRow";
import styles from "./WorkspaceLibrary.module.css";
export function renderLibraryRows(
  model: WorkspaceLibraryModel,
  rows: LibraryPage[],
  columns: LibraryColumn[],
  now: number,
  depth = 0,
  visited = new Set<string>(),
): React.ReactNode {
  return rows.map((row) => {
    if (visited.has(row.id) || depth > 50) return null;
    visited.add(row.id);
    const expanded = model.expanded.has(row.id),
      children = model.children[row.id];
    return (
      <tbody key={row.id} data-page-id={row.id}>
        <LibraryPageRow
          row={row}
          columns={columns}
          depth={depth}
          now={now}
          model={model}
        />
        {expanded && row.has_children && (
          <tr className={styles.childRow}>
            <td colSpan={columns.length}>
              <table
                aria-label={`Trang con của ${row.title}`}
                className={styles.childTable}
              >
                <colgroup>
                  {columns.map((id) => (
                    <col
                      key={id}
                      className={id === "title" ? styles.titleCol : undefined}
                    />
                  ))}
                </colgroup>
                {children?.items.length ? (
                  renderLibraryRows(
                    model,
                    children.items,
                    columns,
                    now,
                    depth + 1,
                    visited,
                  )
                ) : (
                  <tbody>
                    <tr>
                      <td
                        colSpan={columns.length}
                        className={styles.childState}
                      >
                        {children?.loading
                          ? "Đang mở trang con…"
                          : children?.error ||
                            "Không có trang con phù hợp với chế độ xem này."}
                        {children?.error && (
                          <button
                            type="button"
                            className={styles.textButton}
                            onClick={() => void model.loadChildren(row.id)}
                          >
                            Thử lại
                          </button>
                        )}
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
              {children?.next_offset !== null &&
                children?.next_offset !== undefined && (
                  <button
                    type="button"
                    className={styles.childMore}
                    disabled={children.loading}
                    onClick={() => void model.loadChildren(row.id, true)}
                  >
                    {children.loading ? "Đang mở…" : "Xem thêm trang con"}
                  </button>
                )}
            </td>
          </tr>
        )}
      </tbody>
    );
  });
}
