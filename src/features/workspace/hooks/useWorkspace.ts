"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { workspaceService, WorkspaceError } from "../api/workspaceService";
import type { WorkspaceBootstrap, WorkspacePage } from "../types";

export function useWorkspace() {
  const router = useRouter(),
    query = useSearchParams();
  const pageId = query.get("page"),
    spaceId = query.get("space");
  const [bootstrap, setBootstrap] = useState<WorkspaceBootstrap | null>(null);
  const [pages, setPages] = useState<WorkspacePage[]>([]),
    [page, setPage] = useState<WorkspacePage | null>(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null);
  const generation = useRef(0),
    mounted = useRef(true),
    loaded = useRef(false);
  const navigate = useCallback(
    (id?: string, space?: string) => {
      const next = new URLSearchParams();
      if (id) next.set("page", id);
      if (space) next.set("space", space);
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
        tree: WorkspacePage[] = [];
      if (pageId) {
        active = await workspaceService.page(pageId);
        if (active.space_role)
          tree = await workspaceService.pages(active.space_id);
      } else {
        const space =
          initial.spaces.find((item) => item.id === spaceId) ||
          initial.spaces.find((item) => item.kind === "personal");
        if (space) {
          tree = await workspaceService.pages(space.id);
          const first =
            tree.find((item) => !item.parent_id && item.kind !== "record") ||
            tree[0];
          if (first) active = await workspaceService.page(first.id);
        }
      }
      if (!mounted.current || current !== generation.current) return;
      setPages(tree);
      setPage(active);
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
        setPages([]);
      }
    } finally {
      if (mounted.current && current === generation.current) setLoading(false);
    }
  }, [pageId, spaceId]);
  useEffect(() => {
    mounted.current = true;
    setLoading(!loaded.current);
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    const focus = () => void refresh();
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
      const id = page.id;
      const updated = await workspaceService.updatePage(id, input);
      if (mounted.current) {
        setPage((previous) =>
          previous?.id === id ? { ...previous, ...updated } : previous,
        );
        setPages((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...updated } : item,
          ),
        );
      }
      return updated;
    },
    [page],
  );
  const activeSpace = page
    ? bootstrap?.spaces.find((space) => space.id === page.space_id)
    : bootstrap?.spaces.find((space) => space.id === spaceId) ||
      bootstrap?.spaces.find((space) => space.kind === "personal");
  const createPage = useCallback(
    async (
      title: string,
      kind: "page" | "database",
      parentId?: string | null,
      template?: string,
    ) => {
      if (!activeSpace) throw new Error("Chọn không gian trước.");
      const created = await workspaceService.createPage(activeSpace.id, {
        title,
        kind,
        parent_id: parentId || null,
        ...(template ? { template } : {}),
      });
      await refresh();
      navigate(created.id);
      return created;
    },
    [activeSpace, navigate, refresh],
  );
  return {
    bootstrap,
    pages,
    page,
    activeSpace,
    loading,
    error,
    refresh,
    navigate,
    patch,
    createPage,
    setError,
  };
}
