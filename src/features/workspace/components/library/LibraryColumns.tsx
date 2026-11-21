"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Search,
} from "lucide-react";
import type { WorkspaceLibraryModel } from "../../hooks/useWorkspaceLibrary";
import type { LibraryColumn } from "../../types/library";
import { libraryColumns } from "../../utils/library";
import styles from "./WorkspaceLibrary.module.css";
const dragType = "application/x-bdc-library-column";
export function LibraryColumns({ model }: { model: WorkspaceLibraryModel }) {
  const [query, setQuery] = useState("");
  const section = (hidden: boolean) =>
    model.preferences.columns
      .filter((id) => model.preferences.hidden.includes(id) === hidden)
      .filter((id) =>
        libraryColumns
          .find((column) => column.id === id)!
          .label.toLocaleLowerCase("vi")
          .includes(query.toLocaleLowerCase("vi")),
      )
      .map((id) => {
        const label = libraryColumns.find((column) => column.id === id)!.label,
          index = model.preferences.columns.indexOf(id);
        return (
          <div
            key={id}
            className={styles.columnOption}
            draggable={id !== "title"}
            onDragStart={(event) => event.dataTransfer.setData(dragType, id)}
            onDragOver={(event) => {
              if (id !== "title" && event.dataTransfer.types.includes(dragType))
                event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              const from = event.dataTransfer.getData(
                dragType,
              ) as LibraryColumn;
              if (from) model.moveColumn(from, id);
            }}
          >
            <GripVertical size={15} className={styles.grip} />
            <span>{label}</span>
            {id !== "title" && (
              <span className={styles.columnArrows}>
                <button
                  type="button"
                  disabled={index <= 1}
                  aria-label={`Đưa ${label} lên`}
                  onClick={() =>
                    model.moveColumn(id, model.preferences.columns[index - 1])
                  }
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  disabled={index === model.preferences.columns.length - 1}
                  aria-label={`Đưa ${label} xuống`}
                  onClick={() =>
                    model.moveColumn(id, model.preferences.columns[index + 1])
                  }
                >
                  <ArrowDown size={13} />
                </button>
              </span>
            )}
            <button
              type="button"
              disabled={id === "title"}
              aria-label={`${hidden ? "Hiện" : "Ẩn"} cột ${label}`}
              title={
                id === "title"
                  ? "Tên trang luôn hiển thị"
                  : `${hidden ? "Hiện" : "Ẩn"} cột`
              }
              className={styles.iconButton}
              onClick={() => model.toggleColumn(id)}
            >
              {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        );
      });
  return (
    <div className={styles.columnPanel}>
      <label className={styles.panelSearch}>
        <Search size={16} />
        <input
          autoFocus
          aria-label="Tìm thuộc tính hiển thị"
          placeholder="Tìm thuộc tính…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className={styles.sectionLabel}>
        <span>Hiện trong bảng</span>
        <button
          type="button"
          className={styles.textButton}
          onClick={() =>
            model.setPreferences((previous) => ({
              ...previous,
              hidden: libraryColumns
                .filter((column) => column.id !== "title")
                .map((column) => column.id),
            }))
          }
        >
          Ẩn tất cả
        </button>
      </div>
      {section(false)}
      <div className={styles.sectionLabel}>
        <span>Ẩn trong bảng</span>
        <button
          type="button"
          className={styles.textButton}
          onClick={() =>
            model.setPreferences((previous) => ({ ...previous, hidden: [] }))
          }
        >
          Hiện tất cả
        </button>
      </div>
      {section(true)}
    </div>
  );
}
