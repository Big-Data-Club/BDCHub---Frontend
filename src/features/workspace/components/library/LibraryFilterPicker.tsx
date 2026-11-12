"use client";
import { useState } from "react";
import { Clock3, FileText, Plus, Search, UserRound } from "lucide-react";
import { libraryColumns } from "../../utils/library";
import type { LibraryFilterField } from "../../types/library";
import styles from "./WorkspaceLibrary.module.css";
export function LibraryFilterPicker({
  onChoose,
  onAdvanced,
}: {
  onChoose: (field: LibraryFilterField) => void;
  onAdvanced: () => void;
}) {
  const [query, setQuery] = useState("");
  return (
    <div>
      <label className={styles.panelSearch}>
        <Search size={16} />
        <input
          autoFocus
          aria-label="Tìm thuộc tính để lọc"
          placeholder="Lọc theo thuộc tính…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className={styles.settingsList}>
        {libraryColumns
          .filter(
            (column) =>
              column.id !== "source" &&
              column.label
                .toLocaleLowerCase("vi")
                .includes(query.toLocaleLowerCase("vi")),
          )
          .map((column) => {
            const Icon =
              column.id === "title"
                ? FileText
                : ["creator", "editor"].includes(column.id)
                  ? UserRound
                  : Clock3;
            return (
              <button
                key={column.id}
                type="button"
                onClick={() => onChoose(column.id as LibraryFilterField)}
              >
                <Icon size={17} />
                <span>{column.label}</span>
              </button>
            );
          })}
      </div>
      <button type="button" className={styles.panelAction} onClick={onAdvanced}>
        <Plus size={17} />
        Bộ lọc nâng cao
      </button>
    </div>
  );
}
