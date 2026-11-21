"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { workspaceService } from "../api/workspaceService";
import type { WorkspaceBootstrap } from "../types";
export function useLibraryCreate(bootstrap: WorkspaceBootstrap) {
  const router = useRouter(),
    spaces = bootstrap.spaces.filter((space) =>
      ["owner", "manager", "editor"].includes(space.role),
    );
  const [open, setOpen] = useState(false),
    [title, setTitle] = useState(""),
    [spaceId, setSpaceId] = useState(
      spaces.find((space) => space.kind === "personal")?.id ||
        spaces[0]?.id ||
        "",
    ),
    [fieldId, setFieldId] = useState(""),
    [kind, setKind] = useState<"page" | "database">("page"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const show = () => {
    setTitle("");
    setError("");
    setKind("page");
    setOpen(true);
  };
  const create = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const page = await workspaceService.createPage(spaceId, {
        title: title.trim() || "Trang không tiêu đề",
        kind,
        field_id: fieldId || null,
      });
      setOpen(false);
      router.push(`/workspace?page=${page.id}`);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa tạo được trang.",
      );
    } finally {
      setBusy(false);
    }
  };
  return {
    open,
    show,
    close: () => {
      if (!busy) setOpen(false);
    },
    title,
    setTitle,
    spaceId,
    setSpaceId: (id: string) => {
      setSpaceId(id);
      setFieldId("");
    },
    fieldId,
    setFieldId,
    kind,
    setKind,
    busy,
    error,
    create,
    spaces,
    fields: bootstrap.fields.filter((field) => field.space_id === spaceId),
  };
}
