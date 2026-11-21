"use client";
import type { useLibraryCreate } from "../../hooks/useLibraryCreate";
import {
  WorkspaceButton,
  WorkspaceDialog,
  WorkspaceErrorBanner,
  workspaceInputClass,
} from "../WorkspacePrimitives";
export function LibraryCreateDialog({
  model,
}: {
  model: ReturnType<typeof useLibraryCreate>;
}) {
  return (
    <WorkspaceDialog
      open={model.open}
      onOpenChange={(open) => {
        if (!open) model.close();
      }}
      title="Trang mới"
      description="Chọn nơi lưu trang trong Workspace của bạn."
    >
      <WorkspaceErrorBanner message={model.error} />
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void model.create();
        }}
      >
        <label className="grid gap-2 text-sm">
          Tên trang
          <input
            autoFocus
            aria-label="Tên trang mới"
            className={workspaceInputClass}
            maxLength={300}
            placeholder="Trang không tiêu đề"
            value={model.title}
            onChange={(event) => model.setTitle(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm">
          Không gian
          <select
            className={workspaceInputClass}
            aria-label="Không gian lưu trang"
            value={model.spaceId}
            onChange={(event) => model.setSpaceId(event.target.value)}
          >
            {model.spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {space.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Lĩnh vực
          <select
            className={workspaceInputClass}
            aria-label="Lĩnh vực lưu trang"
            value={model.fieldId}
            onChange={(event) => model.setFieldId(event.target.value)}
          >
            <option value="">Chưa xếp lĩnh vực</option>
            {model.fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Loại trang
          <select
            className={workspaceInputClass}
            aria-label="Loại trang mới"
            value={model.kind}
            onChange={(event) =>
              model.setKind(event.target.value as "page" | "database")
            }
          >
            <option value="page">Trang ghi chép</option>
            <option value="database">Bảng quản lý</option>
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <WorkspaceButton disabled={model.busy} onClick={model.close}>
            Hủy
          </WorkspaceButton>
          <WorkspaceButton
            type="submit"
            disabled={model.busy || !model.spaceId}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {model.busy ? "Đang tạo…" : "Tạo trang"}
          </WorkspaceButton>
        </div>
      </form>
    </WorkspaceDialog>
  );
}
