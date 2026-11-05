"use client";
import { useEffect, useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { DatabaseField, FieldType, WorkspacePage } from "../../types";
import { useRelationOptions } from "../../hooks/useRelationOptions";
import {
  WorkspaceButton,
  WorkspaceDialog,
  WorkspaceErrorBanner,
  workspaceInputClass,
} from "../WorkspacePrimitives";
const fieldTypes: [FieldType, string][] = [
  ["text", "Văn bản"],
  ["number", "Số"],
  ["status", "Trạng thái"],
  ["select", "Một lựa chọn"],
  ["multi_select", "Nhiều nhãn"],
  ["person", "Người phụ trách"],
  ["date", "Ngày / khoảng ngày"],
  ["checkbox", "Checkbox"],
  ["url", "Liên kết"],
  ["relation", "Liên kết bảng"],
  ["formula", "Công thức tính"],
  ["rollup", "Tổng hợp từ bảng"],
];

export function SchemaEditorDialog({
  open,
  onOpenChange,
  fields,
  pages,
  onSave,
  version,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  fields: DatabaseField[];
  pages: WorkspacePage[];
  onSave: (value: DatabaseField[], version: number) => Promise<unknown>;
  version: number;
}) {
  const [draft, setDraft] = useState<DatabaseField[]>(fields),
    [error, setError] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  const { schemas } = useRelationOptions(draft);
  const wasOpen = useRef(false);
  const editVersion = useRef(version);
  useEffect(() => {
    if (open && !wasOpen.current) {
      setDraft(structuredClone(fields));
      editVersion.current = version;
      setError(null);
    }
    wasOpen.current = open;
  }, [open, fields, version]);
  function update(id: string, input: Partial<DatabaseField>) {
    setDraft((items) =>
      items.map((item) => (item.id === id ? { ...item, ...input } : item)),
    );
  }
  async function save() {
    setBusy(true);
    try {
      if (draft.some((field) => !field.name.trim()))
        throw new Error("Đặt tên cho tất cả thuộc tính.");
      await onSave(draft, editVersion.current);
      onOpenChange(false);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa lưu được cấu trúc.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <WorkspaceDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Thuộc tính của bảng"
      description="Cấu trúc dùng chung cho các cách xem. Dữ liệu đang có được kiểm tra trước khi đổi kiểu."
      wide
    >
      <WorkspaceErrorBanner message={error} />
      <div className="space-y-4">
        {draft.map((field) => (
          <fieldset
            key={field.id}
            className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-lms-border"
          >
            <div className="flex flex-wrap gap-2">
              <input
                aria-label="Tên thuộc tính"
                className={`${workspaceInputClass} min-w-40 flex-1`}
                value={field.name}
                onChange={(event) =>
                  update(field.id, { name: event.target.value })
                }
              />
              <select
                aria-label={`Kiểu của ${field.name}`}
                className={workspaceInputClass}
                value={field.type}
                onChange={(event) => {
                  const type = event.target.value as FieldType;
                  const existing = field.options || [
                    {
                      id: "option_1",
                      label: "Lựa chọn 1",
                      color: "slate" as const,
                    },
                  ];
                  setDraft((items) =>
                    items.map((item) =>
                      item.id === field.id
                        ? {
                            id: item.id,
                            name: item.name,
                            type,
                            ...(["status", "select", "multi_select"].includes(
                              type,
                            )
                              ? { options: existing }
                              : {}),
                            ...(type === "formula" ? { formula: "" } : {}),
                          }
                        : item,
                    ),
                  );
                }}
              >
                {fieldTypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {!fields.some((item) => item.id === field.id) && (
                <WorkspaceButton
                  aria-label={`Bỏ thuộc tính ${field.name}`}
                  onClick={() =>
                    setDraft((items) =>
                      items.filter((item) => item.id !== field.id),
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </WorkspaceButton>
              )}
            </div>
            {["select", "status", "multi_select"].includes(field.type) && (
              <label className="grid gap-2 text-xs text-slate-500 dark:text-slate-400">
                Các lựa chọn, mỗi dòng một tên
                <textarea
                  className={workspaceInputClass}
                  value={(field.options || [])
                    .map((option) => option.label)
                    .join("\n")}
                  onChange={(event) =>
                    update(field.id, {
                      options: event.target.value
                        .split("\n")
                        .filter(Boolean)
                        .map((label, index) => ({
                          id:
                            field.options?.find(
                              (option) => option.label === label,
                            )?.id ||
                            field.options?.[index]?.id ||
                            `choice_${crypto.randomUUID().slice(0, 8)}`,
                          label,
                          color: field.options?.[index]?.color || "slate",
                        })),
                    })
                  }
                />
              </label>
            )}
            {field.type === "formula" && (
              <label className="grid gap-2 text-xs text-slate-500 dark:text-slate-400">
                Ví dụ: [Giờ] * [Đơn giá]. Hàm: SUM, AVG, MIN, MAX, ROUND, IF,
                COUNT, CONCAT, DAYS.
                <input
                  aria-label={`Công thức ${field.name}`}
                  className={`${workspaceInputClass} font-mono`}
                  value={field.formula || ""}
                  onChange={(event) =>
                    update(field.id, { formula: event.target.value })
                  }
                />
              </label>
            )}
            {field.type === "relation" && (
              <label className="grid gap-2 text-xs text-slate-500 dark:text-slate-400">
                Bảng được liên kết
                <select
                  className={workspaceInputClass}
                  value={field.relation_page_id || ""}
                  onChange={(event) =>
                    update(field.id, { relation_page_id: event.target.value })
                  }
                >
                  <option value="">Chọn bảng…</option>
                  {pages
                    .filter((page) => page.kind === "database")
                    .map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title}
                      </option>
                    ))}
                </select>
              </label>
            )}
            {field.type === "rollup" && (
              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  aria-label="Thuộc tính liên kết"
                  className={workspaceInputClass}
                  value={field.relation_field_id || ""}
                  onChange={(event) =>
                    update(field.id, { relation_field_id: event.target.value })
                  }
                >
                  <option value="">Chọn liên kết…</option>
                  {draft
                    .filter((item) => item.type === "relation")
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
                <select
                  aria-label="Thuộc tính cần tổng hợp"
                  className={workspaceInputClass}
                  value={field.target_field_id || ""}
                  onChange={(event) =>
                    update(field.id, { target_field_id: event.target.value })
                  }
                >
                  <option value="">Chọn thuộc tính…</option>
                  {(
                    schemas[
                      draft.find((item) => item.id === field.relation_field_id)
                        ?.relation_page_id || ""
                    ] || []
                  ).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Phép tổng hợp"
                  className={workspaceInputClass}
                  value={field.aggregate || ""}
                  onChange={(event) =>
                    update(field.id, {
                      aggregate: event.target
                        .value as DatabaseField["aggregate"],
                    })
                  }
                >
                  <option value="">Chọn phép tính…</option>
                  {[
                    ["count", "Đếm"],
                    ["sum", "Tổng"],
                    ["avg", "Trung bình"],
                    ["min", "Nhỏ nhất"],
                    ["max", "Lớn nhất"],
                  ].map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </fieldset>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <WorkspaceButton
          disabled={draft.length >= 40 || busy}
          onClick={() =>
            setDraft((items) => [
              ...items,
              {
                id: `field_${crypto.randomUUID().slice(0, 8)}`,
                name: "Thuộc tính mới",
                type: "text",
              },
            ])
          }
        >
          <Plus className="size-4" />
          Thêm thuộc tính
        </WorkspaceButton>
        <WorkspaceButton
          className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white"
          disabled={busy}
          onClick={() => void save()}
        >
          {busy ? "Đang lưu…" : "Lưu cấu trúc"}
        </WorkspaceButton>
      </div>
    </WorkspaceDialog>
  );
}
