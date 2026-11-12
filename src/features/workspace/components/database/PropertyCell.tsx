"use client";
import { useEffect, useRef, useState } from "react";
import type {
  DatabaseField,
  PropertyValue,
  WorkspaceMember,
  WorkspacePage,
} from "../../types";
import { propertyText, dateValue } from "../../utils/databaseViews";
import { workspaceInputClass, WorkspaceButton } from "../WorkspacePrimitives";

export function PropertyCell({
  field,
  record,
  members,
  editable,
  onSave,
  relationOptions = [],
}: {
  field: DatabaseField;
  record: WorkspacePage;
  members: WorkspaceMember[];
  editable: boolean;
  onSave: (
    values: Record<string, PropertyValue>,
    version: number,
  ) => Promise<unknown>;
  relationOptions?: WorkspacePage[];
}) {
  const value = record.properties[field.id] ?? null;
  const [draft, setDraft] = useState<PropertyValue>(value),
    [error, setError] = useState<string | null>(null),
    [saving, setSaving] = useState(false);
  const dirty = useRef(false),
    version = useRef(record.version);
  useEffect(() => {
    if (!dirty.current) {
      setDraft(value);
      version.current = record.version;
    }
  }, [value, record.version]);
  const focus = () => {
    if (!dirty.current) version.current = record.version;
  };
  async function commit(next: PropertyValue, retry = false) {
    if (!editable || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(
        { [field.id]: next },
        retry ? record.version : version.current,
      );
      dirty.current = false;
    } catch (reason) {
      dirty.current = true;
      setError(
        reason instanceof Error ? reason.message : "Chưa lưu được ô này.",
      );
    } finally {
      setSaving(false);
    }
  }
  const change = (next: PropertyValue, immediate = false) => {
    dirty.current = true;
    setDraft(next);
    if (immediate) void commit(next);
  };
  const label = `${field.name} của ${record.title}`;
  if (["formula", "rollup"].includes(field.type)) {
    const computed = record.computed?.[field.id];
    return (
      <span
        className={`text-sm ${computed && typeof computed === "object" && "error" in computed ? "text-rose-600 dark:text-rose-300" : ""}`}
      >
        {propertyText(computed) || "—"}
      </span>
    );
  }
  if (!editable)
    return (
      <span className="text-sm">
        {field.options?.find((option) => option.id === value)?.label ||
          (field.type === "person" && Array.isArray(value)
            ? value
                .map(
                  (id) =>
                    members.find((member) => member.id === id)?.name ||
                    "Thành viên",
                )
                .join(", ")
            : field.type === "relation" && Array.isArray(value)
              ? value
                  .map(
                    (id) =>
                      relationOptions.find((item) => item.id === id)?.title ||
                      "Mục không có quyền xem",
                  )
                  .join(", ")
              : propertyText(value)) ||
          "—"}
      </span>
    );
  const common = {
    "aria-label": label,
    onFocus: focus,
    disabled: saving,
    className: `${workspaceInputClass} w-full min-w-28 border-transparent px-2 py-1.5 focus:border-blue-300 dark:border-transparent dark:focus:border-cyan-500/40`,
  };
  let control;
  if (field.type === "checkbox")
    control = (
      <input
        aria-label={label}
        type="checkbox"
        checked={Boolean(draft)}
        disabled={saving}
        onFocus={focus}
        onChange={(event) => change(event.target.checked, true)}
        className="size-4 accent-blue-600"
      />
    );
  else if (["select", "status"].includes(field.type))
    control = (
      <select
        {...common}
        value={typeof draft === "string" ? draft : ""}
        onChange={(event) => change(event.target.value || null, true)}
      >
        <option value="">Chưa chọn</option>
        {field.options?.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    );
  else if (field.type === "person" || field.type === "multi_select") {
    const items =
      field.type === "person"
        ? members.map((member) => ({ id: member.id, label: member.name }))
        : field.options || [];
    control = (
      <select
        {...common}
        multiple
        value={Array.isArray(draft) ? draft : []}
        onChange={(event) =>
          change(
            Array.from(event.target.selectedOptions, (option) => option.value),
            true,
          )
        }
      >
        {items.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "date") {
    const dates = dateValue(draft);
    control = (
      <div className="grid gap-1">
        <input
          {...common}
          type="date"
          value={dates?.start || ""}
          onChange={(event) =>
            change(
              event.target.value
                ? {
                    start: event.target.value,
                    ...(dates?.end ? { end: dates.end } : {}),
                  }
                : null,
              true,
            )
          }
        />
        <input
          {...common}
          aria-label={`Ngày kết thúc ${label}`}
          type="date"
          min={dates?.start}
          value={dates?.end || ""}
          onChange={(event) => {
            if (dates)
              change(
                event.target.value
                  ? { start: dates.start, end: event.target.value }
                  : { start: dates.start },
                true,
              );
          }}
        />
      </div>
    );
  } else if (field.type === "relation")
    control = (
      <select
        {...common}
        multiple
        value={Array.isArray(draft) ? draft : []}
        onChange={(event) =>
          change(
            Array.from(event.target.selectedOptions, (option) => option.value),
            true,
          )
        }
      >
        {relationOptions.length ? (
          relationOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))
        ) : (
          <option disabled>Chưa có mục có thể liên kết</option>
        )}
      </select>
    );
  else
    control = (
      <input
        {...common}
        type={field.type === "number" ? "number" : "text"}
        value={
          draft === null
            ? ""
            : typeof draft === "string" || typeof draft === "number"
              ? draft
              : ""
        }
        onChange={(event) =>
          change(
            event.target.value === ""
              ? null
              : field.type === "number"
                ? Number(event.target.value)
                : event.target.value,
          )
        }
        onBlur={() => {
          if (dirty.current) void commit(draft);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
    );
  return (
    <div className="min-w-0">
      {control}
      {error && (
        <div
          className="mt-1 max-w-64 space-y-1 text-xs text-rose-600 dark:text-rose-300"
          role="alert"
        >
          <p>{error}</p>
          <p>Trên máy chủ: {propertyText(value) || "trống"}</p>
          <WorkspaceButton
            onClick={() => void commit(draft, true)}
            disabled={saving}
          >
            Thử lưu lại
          </WorkspaceButton>
        </div>
      )}
    </div>
  );
}
