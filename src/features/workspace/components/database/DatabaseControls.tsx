"use client";
import { Plus, X } from "lucide-react";
import type { DatabaseField, DatabaseViewConfig } from "../../types";
import { WorkspaceButton, workspaceInputClass } from "../WorkspacePrimitives";
export function DatabaseControls({
  fields,
  config,
  onChange,
  viewType,
}: {
  fields: DatabaseField[];
  config: DatabaseViewConfig;
  onChange: (value: DatabaseViewConfig) => void;
  viewType: string;
}) {
  const all = [{ id: "title", name: "Tên" }, ...fields];
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-lms-border dark:bg-lms-input">
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-xs text-slate-500 dark:text-slate-400">
          Sắp xếp
          <select
            className={workspaceInputClass}
            value={config.sort_by || ""}
            onChange={(event) =>
              onChange({ ...config, sort_by: event.target.value || undefined })
            }
          >
            <option value="">Thứ tự ban đầu</option>
            {all.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-slate-500 dark:text-slate-400">
          Chiều
          <select
            className={workspaceInputClass}
            value={config.sort_direction || "asc"}
            onChange={(event) =>
              onChange({
                ...config,
                sort_direction: event.target.value as "asc" | "desc",
              })
            }
          >
            <option value="asc">Tăng dần</option>
            <option value="desc">Giảm dần</option>
          </select>
        </label>
        {viewType === "board" && (
          <label className="grid gap-1 text-xs text-slate-500 dark:text-slate-400">
            Nhóm thẻ theo
            <select
              className={workspaceInputClass}
              value={config.group_by || ""}
              onChange={(event) =>
                onChange({ ...config, group_by: event.target.value })
              }
            >
              <option value="">Tự chọn</option>
              {fields
                .filter((field) => ["status", "select"].includes(field.type))
                .map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
            </select>
          </label>
        )}
        {["calendar", "timeline"].includes(viewType) && (
          <label className="grid gap-1 text-xs text-slate-500 dark:text-slate-400">
            Ngày hiển thị
            <select
              className={workspaceInputClass}
              value={config.date_field || ""}
              onChange={(event) =>
                onChange({ ...config, date_field: event.target.value })
              }
            >
              <option value="">Tự chọn</option>
              {fields
                .filter((field) => field.type === "date")
                .map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
            </select>
          </label>
        )}
      </div>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          Bộ lọc · khớp tất cả điều kiện
        </legend>
        {(config.filters || []).map((filter, index) => (
          <div key={index} className="flex flex-wrap gap-2">
            <select
              aria-label="Thuộc tính lọc"
              className={workspaceInputClass}
              value={filter.field}
              onChange={(event) =>
                onChange({
                  ...config,
                  filters: config.filters?.map((item, i) =>
                    i === index ? { ...item, field: event.target.value } : item,
                  ),
                })
              }
            >
              {all.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Điều kiện lọc"
              className={workspaceInputClass}
              value={filter.op}
              onChange={(event) =>
                onChange({
                  ...config,
                  filters: config.filters?.map((item, i) =>
                    i === index
                      ? { ...item, op: event.target.value as typeof filter.op }
                      : item,
                  ),
                })
              }
            >
              {[
                ["contains", "Chứa"],
                ["eq", "Bằng"],
                ["empty", "Trống"],
                ["not_empty", "Có giá trị"],
                ["gte", "Lớn hơn hoặc bằng"],
                ["lte", "Nhỏ hơn hoặc bằng"],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {!["empty", "not_empty"].includes(filter.op) &&
              (fields.find((field) => field.id === filter.field)?.options ? (
                <select
                  aria-label="Giá trị lọc"
                  className={workspaceInputClass}
                  value={String(filter.value || "")}
                  onChange={(event) =>
                    onChange({
                      ...config,
                      filters: config.filters?.map((item, i) =>
                        i === index
                          ? { ...item, value: event.target.value }
                          : item,
                      ),
                    })
                  }
                >
                  <option value="">Chọn…</option>
                  {fields
                    .find((field) => field.id === filter.field)
                    ?.options?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  aria-label="Giá trị lọc"
                  className={`${workspaceInputClass} min-w-24 flex-1`}
                  value={String(filter.value ?? "")}
                  onChange={(event) =>
                    onChange({
                      ...config,
                      filters: config.filters?.map((item, i) =>
                        i === index
                          ? { ...item, value: event.target.value }
                          : item,
                      ),
                    })
                  }
                />
              ))}
            <WorkspaceButton
              aria-label="Bỏ điều kiện"
              onClick={() =>
                onChange({
                  ...config,
                  filters: config.filters?.filter((item, i) => i !== index),
                })
              }
            >
              <X className="size-4" />
            </WorkspaceButton>
          </div>
        ))}
        <WorkspaceButton
          disabled={(config.filters?.length || 0) >= 20}
          onClick={() =>
            onChange({
              ...config,
              filters: [
                ...(config.filters || []),
                { field: "title", op: "contains", value: "" },
              ],
            })
          }
        >
          <Plus className="size-4" />
          Thêm điều kiện
        </WorkspaceButton>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          Thuộc tính hiển thị
        </legend>
        <div className="flex flex-wrap gap-4">
          {fields.map((field) => (
            <label key={field.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={
                  !config.visible_fields ||
                  config.visible_fields.includes(field.id)
                }
                onChange={(event) => {
                  const current =
                    config.visible_fields || fields.map((item) => item.id);
                  onChange({
                    ...config,
                    visible_fields: event.target.checked
                      ? [...current, field.id]
                      : current.filter((id) => id !== field.id),
                  });
                }}
              />
              {field.name}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
