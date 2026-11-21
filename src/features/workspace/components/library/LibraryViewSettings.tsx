"use client";
import { ArrowLeft, ChevronRight, Eye, Filter, X } from "lucide-react";
import type { WorkspaceLibraryModel } from "../../hooks/useWorkspaceLibrary";
import { readyFilter } from "../../utils/library";
import { LibraryColumns } from "./LibraryColumns";
import { LibraryFilters } from "./LibraryFilters";
import { LibraryFilterPicker } from "./LibraryFilterPicker";
import styles from "./WorkspaceLibrary.module.css";
export type LibraryPanel = "settings" | "columns" | "filters" | "filterBy";
export function LibraryViewSettings({
  model,
  panel,
  onPanel,
}: {
  model: WorkspaceLibraryModel;
  panel: LibraryPanel | null;
  onPanel: (panel: LibraryPanel | null) => void;
}) {
  const active = model.preferences.filters.filter(readyFilter).length;
  return (
    <>
      <div className={styles.panelHeading}>
        {panel !== "settings" && (
          <button
            type="button"
            aria-label="Về thiết lập thư viện"
            className={styles.iconButton}
            onClick={() => onPanel("settings")}
          >
            <ArrowLeft size={17} />
          </button>
        )}
        <h2>
          {panel === "settings"
            ? "Thiết lập chế độ xem"
            : panel === "columns"
              ? "Hiển thị thuộc tính"
              : "Bộ lọc"}
        </h2>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Đóng thiết lập thư viện"
          onClick={() => onPanel(null)}
        >
          <X size={17} />
        </button>
      </div>
      {panel === "settings" ? (
        <div className={styles.settingsList}>
          <button type="button" onClick={() => onPanel("columns")}>
            <Eye size={18} />
            <span>Hiển thị thuộc tính</span>
            <small>
              {model.preferences.columns.length -
                model.preferences.hidden.length}
            </small>
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              onPanel("filters");
              void model.refreshPeople();
            }}
          >
            <Filter size={18} />
            <span>Bộ lọc</span>
            {active > 0 && <small>{active}</small>}
            <ChevronRight size={16} />
          </button>
        </div>
      ) : panel === "columns" ? (
        <LibraryColumns model={model} />
      ) : panel === "filterBy" ? (
        <LibraryFilterPicker
          onChoose={(field) => {
            model.addFilter(field);
            onPanel("filters");
          }}
          onAdvanced={() => onPanel("filters")}
        />
      ) : (
        <LibraryFilters model={model} />
      )}
    </>
  );
}
