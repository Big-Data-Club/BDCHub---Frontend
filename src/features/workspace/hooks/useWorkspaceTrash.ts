"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { workspaceService } from "../api/workspaceService";
export interface TrashItem {
  id: string;
  title: string;
  kind: "field" | "page";
  deletedAt: string;
  count: number;
}
export function useWorkspaceTrash(
  spaceId?: string,
  onRefresh?: () => Promise<void>,
) {
  const [items, setItems] = useState<TrashItem[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const mounted = useRef(false),
    generation = useRef(0);
  const load = useCallback(async () => {
    const current = ++generation.current;
    if (!spaceId) {
      setItems([]);
      setLoading(false);
      return;
    }
    const [pages, fields] = await Promise.all([
      workspaceService.pages(spaceId, true),
      workspaceService.fields(spaceId, true),
    ]);
    if (!mounted.current || current !== generation.current) return;
    const fieldsInTrash = new Set(fields.map((field) => field.id)),
      pageIds = new Set(pages.map((page) => page.id));
    const result: TrashItem[] = fields.map((field) => ({
      id: field.id,
      title: field.title,
      kind: "field",
      deletedAt: field.archived_at!,
      count: pages.filter((page) => page.field_id === field.id).length,
    }));
    for (const page of pages) {
      if (
        (page.field_id && fieldsInTrash.has(page.field_id)) ||
        (page.parent_id && pageIds.has(page.parent_id))
      )
        continue;
      const branch = new Set([page.id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const child of pages)
          if (
            child.parent_id &&
            branch.has(child.parent_id) &&
            !branch.has(child.id)
          ) {
            branch.add(child.id);
            changed = true;
          }
      }
      result.push({
        id: page.id,
        title: page.title,
        kind: "page",
        deletedAt: page.archived_at!,
        count: branch.size,
      });
    }
    setItems(result.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt)));
    setLoading(false);
  }, [spaceId]);
  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setError(null);
    void load().catch((reason) => {
      if (mounted.current) {
        setError(reason.message);
        setLoading(false);
      }
    });
    return () => {
      mounted.current = false;
    };
  }, [load]);
  const run = async (item: TrashItem, permanent: boolean) => {
    if (busy) return false;
    setBusy(true);
    setError(null);
    try {
      if (item.kind === "field")
        await (permanent
          ? workspaceService.deleteField(item.id)
          : workspaceService.restoreField(item.id));
      else
        await (permanent
          ? workspaceService.deletePage(item.id)
          : workspaceService.restore(item.id));
      await onRefresh?.();
      await load();
      return true;
    } catch (reason) {
      if (mounted.current)
        setError(
          reason instanceof Error
            ? reason.message
            : "Chưa hoàn thành thao tác.",
        );
      return false;
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  return { items, loading, busy, error, run };
}
