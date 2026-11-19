"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { workspaceService, WorkspaceError } from "../api/workspaceService";
import type {
  WorkspaceBootstrap,
  WorkspacePage,
  WorkspaceField,
} from "../types";
export function useWorkspace() {
  const query = useSearchParams(),
    pageId = query.get("page"),
    spaceId = query.get("space"),
    fieldId = query.get("field");
  const locationKey = JSON.stringify([pageId, spaceId, fieldId]);
  const [bootstrap, setBootstrap] = useState<WorkspaceBootstrap | null>(null),
    [allPages, setAllPages] = useState<WorkspacePage[]>([]),
    [page, setPage] = useState<WorkspacePage | null>(null),
    [field, setField] = useState<WorkspaceField | null>(null),
    [settledLocation, setSettledLocation] = useState<string | null>(null),
    [error, setError] = useState<string | null>(null);
  const mounted = useRef(true),
    generation = useRef(0),
    settledLocationRef = useRef<string | null>(null);
  const navigate = useCallback(
    (id?: string, space?: string, field?: string) => {
      if (!mounted.current || window.location.pathname !== "/workspace") return;
      if (
        id &&
        !space &&
        !field &&
        new URLSearchParams(window.location.search).get("page") === id
      )
        return;
      const next = new URLSearchParams();
      if (id) next.set("page", id);
      if (space) next.set("space", space);
      if (field) next.set("field", field);
      const href = `/workspace${next.size ? `?${next}` : ""}`;
      if (href !== window.location.pathname + window.location.search) {
        // Next synchronizes useSearchParams with history. The Workspace layout
        // stays mounted while the client fetches the requested page.
        window.history.pushState(null, "", href);
      }
    },
    [],
  );
  const refresh = useCallback(async () => {
    function matchesLocation() {
      const next = new URLSearchParams(window.location.search);
      return (
        window.location.pathname === "/workspace" &&
        next.get("page") === pageId &&
        next.get("space") === spaceId &&
        next.get("field") === fieldId
      );
    }
    if (!mounted.current || !matchesLocation()) return;
    const current = ++generation.current;
    const isCurrent = () =>
      mounted.current && current === generation.current && matchesLocation();
    try {
      const [initial, requestedPage] = await Promise.all([
        workspaceService.bootstrap(),
        pageId ? workspaceService.page(pageId) : null,
      ]);
      if (!isCurrent()) return;
      let active = requestedPage,
        activeField: WorkspaceField | null = null,
        tree: WorkspacePage[] = [];
      if (active) {
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
      if (!isCurrent()) return;
      setBootstrap(initial);
      setAllPages(tree);
      setPage(active);
      setField(activeField);
      setError(null);
      window.dispatchEvent(new Event("bdc:workspace-refresh"));
    } catch (reason) {
      if (!isCurrent()) return;
      setError(
        reason instanceof Error ? reason.message : "Chưa mở được Workspace.",
      );
      if (
        settledLocationRef.current !== locationKey ||
        (reason instanceof WorkspaceError &&
          [401, 403, 404].includes(reason.status))
      ) {
        setPage(null);
        setField(null);
        setAllPages([]);
      }
    } finally {
      if (isCurrent()) {
        settledLocationRef.current = locationKey;
        setSettledLocation(locationKey);
      }
    }
  }, [pageId, spaceId, fieldId, locationKey]);
  useEffect(() => {
    mounted.current = true;
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
    loading: settledLocation === null,
    navigating: settledLocation !== locationKey,
    error,
    refresh,
    navigate,
    patch,
    createPage,
    setError,
    isLanding: !pageId && !fieldId,
  };
}
