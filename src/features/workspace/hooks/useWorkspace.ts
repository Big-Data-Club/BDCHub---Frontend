"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { workspaceService, WorkspaceError } from "../api/workspaceService";
import type {
  WorkspaceBootstrap,
  WorkspacePage,
  WorkspaceField,
} from "../types";
export function useWorkspace() {
  const router = useRouter(),
    query = useSearchParams(),
    pageId = query.get("page"),
    spaceId = query.get("space"),
    fieldId = query.get("field");
  const [bootstrap, setBootstrap] = useState<WorkspaceBootstrap | null>(null),
    [allPages, setAllPages] = useState<WorkspacePage[]>([]),
    [page, setPage] = useState<WorkspacePage | null>(null),
    [field, setField] = useState<WorkspaceField | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null);
  const mounted = useRef(true),
    generation = useRef(0),
    loaded = useRef(false);
  const navigate = useCallback(
    (id?: string, space?: string, field?: string) => {
      const next = new URLSearchParams();
      if (id) next.set("page", id);
      if (space) next.set("space", space);
      if (field) next.set("field", field);
      router.push(`/workspace${next.size ? `?${next}` : ""}`);
    },
    [router],
  );
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    try {
      const initial = await workspaceService.bootstrap();
      if (!mounted.current || current !== generation.current) return;
      setBootstrap(initial);
      let active: WorkspacePage | null = null,
        activeField: WorkspaceField | null = null,
        tree: WorkspacePage[] = [];
      if (pageId) {
        active = await workspaceService.page(pageId);
        if (active.space_role) {
          tree = await workspaceService.pages(active.space_id);
          activeField =
            initial.fields.find((item) => item.id === active!.field_id) || null;
        }
      } else {
        const requested = fieldId
          ? initial.fields.find((item) => item.id === fieldId)
          : null;
        if (fieldId && !requested)
          throw new WorkspaceError(
            "Lĩnh vực không tồn tại hoặc bạn chưa có quyền truy cập.",
            404,
          );
        const space =
          initial.spaces.find(
            (item) => item.id === (requested?.space_id || spaceId),
          ) || initial.spaces.find((item) => item.kind === "personal");
        if (space) tree = await workspaceService.pages(space.id);
        if (requested) {
          activeField = requested;
          const first = tree.find(
            (item) =>
              item.field_id === requested.id &&
              !item.parent_id &&
              item.kind !== "record",
          );
          if (first) active = await workspaceService.page(first.id);
        }
      }
      if (!mounted.current || current !== generation.current) return;
      setAllPages(tree);
      setPage(active);
      setField(activeField);
      setError(null);
      loaded.current = true;
      window.dispatchEvent(new Event("bdc:workspace-refresh"));
    } catch (reason) {
      if (!mounted.current || current !== generation.current) return;
      setError(
        reason instanceof Error ? reason.message : "Chưa mở được Workspace.",
      );
      if (
        reason instanceof WorkspaceError &&
        [401, 403, 404].includes(reason.status)
      ) {
        setPage(null);
        setField(null);
        setAllPages([]);
      }
    } finally {
      if (mounted.current && current === generation.current) setLoading(false);
    }
  }, [pageId, spaceId, fieldId]);
  useEffect(() => {
    mounted.current = true;
    setLoading(!loaded.current);
    void refresh();
    const timer = setInterval(() => void refresh(), 15000),
      focus = () => void refresh();
    window.addEventListener("focus", focus);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [refresh]);
  const patch = useCallback(
    async (input: Parameters<typeof workspaceService.updatePage>[1]) => {
      if (!page) return;
      const updated = await workspaceService.updatePage(page.id, input);
      if (mounted.current) {
        setPage((previous) =>
          previous?.id === updated.id ? { ...previous, ...updated } : previous,
        );
        setAllPages((items) =>
          items.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          ),
        );
      }
      return updated;
    },
    [page],
  );
  const activeSpace = page
    ? bootstrap?.spaces.find((item) => item.id === page.space_id)
    : bootstrap?.spaces.find(
        (item) => item.id === (field?.space_id || spaceId),
      ) || bootstrap?.spaces.find((item) => item.kind === "personal");
  const createPage = useCallback(
    async (
      title: string,
      kind: "page" | "database",
      parentId?: string | null,
      template?: string,
    ) => {
      if (!activeSpace) throw Error("Chọn không gian trước.");
      const created = await workspaceService.createPage(activeSpace.id, {
        title,
        kind,
        parent_id: parentId || null,
        ...(!parentId ? { field_id: field?.id || null } : {}),
        ...(template ? { template } : {}),
      });
      await refresh();
      navigate(created.id);
      return created;
    },
    [activeSpace, field, navigate, refresh],
  );
  const pages = allPages.filter(
    (item) => item.field_id === (field?.id || null),
  );
  return {
    bootstrap,
    allPages,
    pages,
    page,
    field,
    activeSpace,
    loading,
    error,
    refresh,
    navigate,
    patch,
    createPage,
    setError,
    isLanding: !pageId && !fieldId,
  };
}
