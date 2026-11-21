"use client";
import { useEffect, useState } from "react";
import type {
  FieldColor,
  FieldIcon,
  FieldInput,
  WorkspaceField,
} from "../../types";
import {
  WorkspaceButton,
  WorkspaceDialog,
  WorkspaceErrorBanner,
  workspaceInputClass,
} from "../WorkspacePrimitives";
import {
  FieldArtwork,
  fieldIcons,
  iconLabels,
  colorLabels,
} from "./FieldArtwork";
const empty: FieldInput = {
  title: "",
  description: "",
  icon: "book",
  color: "violet",
  tags: [],
};
export function FieldDialog({
  open,
  editing,
  busy,
  error,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  editing: WorkspaceField | null;
  busy: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: FieldInput) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<FieldInput>(empty),
    [tags, setTags] = useState("");
  useEffect(() => {
    if (open) {
      setDraft(
        editing
          ? {
              title: editing.title,
              description: editing.description,
              icon: editing.icon,
              color: editing.color,
              tags: editing.tags,
            }
          : empty,
      );
      setTags(editing?.tags.join(", ") || "");
    }
  }, [open, editing]);
  return (
    <WorkspaceDialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value);
      }}
      title={editing ? "Chỉnh sửa lĩnh vực" : "Tạo lĩnh vực của bạn"}
      description="Đặt tên theo môn học, chủ đề nghiên cứu hoặc dự án. Bạn có thể đổi lại bất cứ lúc nào."
      wide
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onSave({
            ...draft,
            title: draft.title.trim(),
            tags: [
              ...new Set(
                tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              ),
            ],
          });
        }}
        className="grid gap-6 md:grid-cols-[minmax(0,1fr)_200px]"
      >
        <div className="space-y-4">
          <label className="grid gap-2 text-sm">
            Tên lĩnh vực
            <input
              autoFocus
              required
              maxLength={120}
              aria-label="Tên lĩnh vực"
              placeholder="Ví dụ: Thiết kế hệ thống"
              className={workspaceInputClass}
              value={draft.title}
              onChange={(event) =>
                setDraft((value) => ({ ...value, title: event.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm">
            Mô tả
            <textarea
              maxLength={280}
              aria-label="Mô tả lĩnh vực"
              placeholder="Bạn muốn khám phá và lưu lại điều gì?"
              className={`${workspaceInputClass} min-h-24`}
              value={draft.description}
              onChange={(event) =>
                setDraft((value) => ({
                  ...value,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm">
            Chủ đề nhỏ
            <input
              maxLength={200}
              aria-label="Nhãn lĩnh vực"
              placeholder="Tối đa 6 nhãn, ngăn cách bằng dấu phẩy"
              className={workspaceInputClass}
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </label>
          <WorkspaceErrorBanner message={error} />
        </div>
        <div className="space-y-4">
          <FieldArtwork color={draft.color} icon={draft.icon} compact />
          <fieldset>
            <legend className="mb-2 text-xs font-medium">Biểu tượng</legend>
            <div className="grid grid-cols-6 gap-1">
              {(Object.keys(fieldIcons) as FieldIcon[]).map((key) => {
                const Icon = fieldIcons[key];
                return (
                  <WorkspaceButton
                    key={key}
                    aria-label={`Biểu tượng ${iconLabels[key]}`}
                    aria-pressed={draft.icon === key}
                    className={`size-8 p-1 ${draft.icon === key ? "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-cyan-300" : ""}`}
                    onClick={() =>
                      setDraft((value) => ({ ...value, icon: key }))
                    }
                  >
                    <Icon className="size-4" />
                  </WorkspaceButton>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-xs font-medium">Màu sắc</legend>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(colorLabels) as FieldColor[]).map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Màu ${colorLabels[color]}`}
                  aria-pressed={draft.color === color}
                  onClick={() => setDraft((value) => ({ ...value, color }))}
                  className={`h-9 overflow-hidden rounded-lg border-2 [&>div]:min-h-9 [&>div]:h-9 [&_svg]:hidden ${draft.color === color ? "border-blue-500" : "border-transparent"}`}
                >
                  <FieldArtwork color={color} icon={draft.icon} compact />
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="flex justify-end gap-2 md:col-span-2">
          <WorkspaceButton disabled={busy} onClick={() => onOpenChange(false)}>
            Hủy
          </WorkspaceButton>
          <WorkspaceButton
            type="submit"
            disabled={busy || !draft.title.trim()}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {busy ? "Đang lưu…" : editing ? "Lưu lĩnh vực" : "Tạo lĩnh vực"}
          </WorkspaceButton>
        </div>
      </form>
    </WorkspaceDialog>
  );
}
