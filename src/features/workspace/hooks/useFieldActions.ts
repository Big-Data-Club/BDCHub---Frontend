"use client";
import { useState } from "react";
import { workspaceService } from "../api/workspaceService";
import type { FieldInput, WorkspaceField } from "../types";
export function useFieldActions(
  spaceId: string | undefined,
  onRefresh: () => Promise<void>,
) {
  const [editing, setEditing] = useState<WorkspaceField | null>(null),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const create = () => {
    setEditing(null);
    setError(null);
    setOpen(true);
  };
  const edit = (field: WorkspaceField) => {
    setEditing(field);
    setError(null);
    setOpen(true);
  };
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa hoàn thành thao tác.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  const save = (input: FieldInput) =>
    run(async () => {
      if (!spaceId) throw Error("Chọn không gian trước.");
      if (editing)
        await workspaceService.updateField(editing.id, {
          ...input,
          version: editing.version,
        });
      else await workspaceService.createField(spaceId, input);
      await onRefresh();
      setOpen(false);
    });
  const archive = (field: WorkspaceField) =>
    run(async () => {
      await workspaceService.archiveField(field.id);
      await onRefresh();
    });
  return {
    editing,
    open,
    setOpen,
    busy,
    error,
    create,
    edit,
    save,
    archive,
  };
}
