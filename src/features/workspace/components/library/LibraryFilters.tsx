"use client";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import type { WorkspaceLibraryModel } from "../../hooks/useWorkspaceLibrary";
import type { LibraryFilterField, LibraryOperator } from "../../types/library";
import {
  dateFields,
  libraryColumns,
  operatorsFor,
  readyFilter,
  unaryOperators,
} from "../../utils/library";
import styles from "./WorkspaceLibrary.module.css";
export function LibraryFilters({ model }: { model: WorkspaceLibraryModel }) {
  return (
    <div className={styles.filterPanel}>
      <label className={styles.match}>
        Hiển thị trang đáp ứng
        <select
          aria-label="Kết hợp bộ lọc"
          value={model.preferences.match}
          onChange={(event) =>
            model.setPreferences((previous) => ({
              ...previous,
              match: event.target.value as "all" | "any",
            }))
          }
        >
          <option value="all">Tất cả điều kiện</option>
          <option value="any">Một trong các điều kiện</option>
        </select>
      </label>
      {model.preferences.filters.map((rule, index) => {
        const isPerson = rule.field === "creator" || rule.field === "editor",
          people =
            rule.field === "creator"
              ? model.people.creators
              : model.people.editors;
        return (
          <div
            className={styles.rule}
            key={rule.id}
            data-incomplete={!readyFilter(rule) || undefined}
          >
            <div className={styles.ruleTop}>
              <select
                aria-label={`Thuộc tính bộ lọc ${index + 1}`}
                value={rule.field}
                onChange={(event) => {
                  const field = event.target.value as LibraryFilterField;
                  model.updateFilter(rule.id, {
                    field,
                    op: operatorsFor(field)[0].id,
                    value: "",
                  });
                }}
              >
                {libraryColumns
                  .filter((column) => column.id !== "source")
                  .map((column) => (
                    <option value={column.id} key={column.id}>
                      {column.label}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Xóa bộ lọc ${index + 1}`}
                title="Xóa bộ lọc"
                onClick={() => model.removeFilter(rule.id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <select
              aria-label={`Điều kiện bộ lọc ${index + 1}`}
              value={rule.op}
              onChange={(event) =>
                model.updateFilter(rule.id, {
                  op: event.target.value as LibraryOperator,
                  value: "",
                })
              }
            >
              {operatorsFor(rule.field).map((op) => (
                <option key={op.id} value={op.id}>
                  {op.label}
                </option>
              ))}
            </select>
            {!unaryOperators.includes(rule.op) &&
              (isPerson ? (
                <select
                  aria-label={`Giá trị bộ lọc ${index + 1}`}
                  value={rule.value || ""}
                  onChange={(event) =>
                    model.updateFilter(rule.id, { value: event.target.value })
                  }
                >
                  <option value="">Chọn người…</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  aria-label={`Giá trị bộ lọc ${index + 1}`}
                  type={dateFields.includes(rule.field) ? "date" : "text"}
                  maxLength={200}
                  value={rule.value || ""}
                  placeholder="Nhập giá trị…"
                  onChange={(event) =>
                    model.updateFilter(rule.id, { value: event.target.value })
                  }
                />
              ))}
            {!readyFilter(rule) && (
              <small>Chọn giá trị để áp dụng điều kiện này.</small>
            )}
          </div>
        );
      })}
      {model.peopleError && (
        <p className={styles.muted}>
          {model.peopleError}
          <button
            type="button"
            onClick={() => void model.refreshPeople()}
            className={styles.textButton}
          >
            Thử lại
          </button>
        </p>
      )}
      <button
        type="button"
        className={styles.panelAction}
        disabled={model.preferences.filters.length >= 12}
        onClick={() => model.addFilter()}
      >
        <Plus size={17} />
        Thêm bộ lọc
      </button>
      {model.preferences.filters.length > 0 && (
        <button
          type="button"
          className={styles.panelAction}
          onClick={model.resetFilters}
        >
          <RotateCcw size={17} />
          Đặt lại bộ lọc
        </button>
      )}
    </div>
  );
}
