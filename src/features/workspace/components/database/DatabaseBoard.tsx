"use client";
import { useState } from "react";
import { GripVertical, Plus } from "lucide-react";
import type { DatabaseField } from "../../types";
import type { RecordViewProps } from "./DatabaseRows";
import { WorkspaceButton, WorkspaceErrorBanner } from "../WorkspacePrimitives";

export function DatabaseBoard({
  records,
  fields,
  editable,
  onOpen,
  onUpdate,
  groupBy,
  onNew,
}: RecordViewProps & {
  groupBy?: string;
  onNew: (values: Record<string, string>) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const field: DatabaseField | undefined =
    fields.find(
      (item) => item.id === groupBy && ["status", "select"].includes(item.type),
    ) || fields.find((item) => ["status", "select"].includes(item.type));
  if (!field)
    return (
      <p className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500 dark:bg-lms-card dark:text-slate-400">
        Chọn hoặc thêm thuộc tính Trạng thái / Lựa chọn để nhóm các thẻ.
      </p>
    );
  const groups = [...(field.options || []), { id: "", label: "Chưa chọn" }];
  async function move(id: string, group: string) {
    const record = records.find((item) => item.id === id);
    if (!record || !editable) return;
    try {
      await onUpdate(record, { [field!.id]: group || null });
      setError(null);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa di chuyển được thẻ.",
      );
    }
  }
  return (
    <div className="space-y-3">
      <WorkspaceErrorBanner message={error} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] items-start gap-4">
        {groups.map((group) => {
          const items = records.filter(
            (record) => (record.properties[field.id] || "") === group.id,
          );
          return (
            <section
              key={group.id}
              aria-label={`Cột ${group.label}`}
              className="min-w-0 rounded-xl bg-slate-50 p-3 dark:bg-lms-input"
              onDragOver={(event) => {
                if (editable) event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                void move(
                  event.dataTransfer.getData("application/x-bdc-record"),
                  group.id,
                );
              }}
            >
              <header className="mb-3 flex items-center gap-2 px-1 text-sm">
                <span className="font-semibold">{group.label}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {items.length}
                </span>
                {editable && (
                  <WorkspaceButton
                    className="ml-auto size-7 p-1"
                    aria-label={`Thêm mục ${group.label}`}
                    onClick={() =>
                      onNew(group.id ? { [field.id]: group.id } : {})
                    }
                  >
                    <Plus className="size-4" />
                  </WorkspaceButton>
                )}
              </header>
              <div className="space-y-3">
                {items.map((record) => (
                  <article
                    key={record.id}
                    draggable={editable}
                    onDragStart={(event) =>
                      event.dataTransfer.setData(
                        "application/x-bdc-record",
                        record.id,
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-lms-border dark:bg-lms-card dark:shadow-none"
                  >
                    <button
                      type="button"
                      className="flex w-full items-start gap-2 text-left text-sm font-medium transition-all active:scale-95"
                      onClick={() => onOpen(record.id)}
                    >
                      {editable && (
                        <GripVertical className="mt-0.5 size-3 shrink-0 text-slate-400" />
                      )}
                      <span>{record.title}</span>
                    </button>
                    {editable && (
                      <select
                        aria-label={`${field.name} của ${record.title}`}
                        value={String(record.properties[field.id] || "")}
                        className="mt-3 w-full rounded-lg bg-slate-50 px-2 py-1.5 text-xs text-slate-600 dark:bg-lms-input dark:text-slate-300"
                        onChange={(event) =>
                          void move(record.id, event.target.value)
                        }
                      >
                        {groups.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
