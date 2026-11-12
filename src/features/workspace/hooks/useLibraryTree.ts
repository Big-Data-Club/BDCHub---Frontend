"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { workspaceService } from "../api/workspaceService";
import type { LibraryChildren, LibraryQuery } from "../types/library";
export function useLibraryTree(params: LibraryQuery) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set()),
    [children, setChildren] = useState<Record<string, LibraryChildren>>({});
  const requests = useRef(new Map<string, AbortController>()),
    generation = useRef(0),
    alive = useRef(false);
  const abortAll = useCallback(() => {
    generation.current++;
    for (const request of requests.current.values()) request.abort();
    requests.current.clear();
  }, []);
  const resetTree = useCallback(() => {
    abortAll();
    setChildren({});
    setExpanded(new Set());
  }, [abortAll]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      abortAll();
    };
  }, [abortAll]);
  const loadChildren = async (parent: string, append = false) => {
    if (children[parent]?.loading) return;
    const epoch = generation.current,
      offset = append ? children[parent]?.next_offset || 0 : 0,
      abort = new AbortController();
    requests.current.get(parent)?.abort();
    requests.current.set(parent, abort);
    setChildren((previous) => ({
      ...previous,
      [parent]: {
        items: previous[parent]?.items || [],
        total: previous[parent]?.total || 0,
        next_offset: previous[parent]?.next_offset ?? null,
        loading: true,
        error: "",
      },
    }));
    try {
      const data = await workspaceService.library(
        { ...params, parent, offset },
        abort.signal,
      );
      if (
        !alive.current ||
        abort.signal.aborted ||
        epoch !== generation.current
      )
        return;
      setChildren((previous) => ({
        ...previous,
        [parent]: {
          ...data,
          items: offset
            ? [
                ...new Map(
                  [...previous[parent].items, ...data.items].map((row) => [
                    row.id,
                    row,
                  ]),
                ).values(),
              ]
            : data.items,
          loading: false,
          error: "",
        },
      }));
    } catch (reason) {
      if (
        !alive.current ||
        abort.signal.aborted ||
        epoch !== generation.current
      )
        return;
      setChildren((previous) => ({
        ...previous,
        [parent]: {
          items: [],
          total: 0,
          next_offset: null,
          loading: false,
          error:
            reason instanceof Error
              ? reason.message
              : "Chưa tải được trang con.",
        },
      }));
    } finally {
      if (requests.current.get(parent) === abort)
        requests.current.delete(parent);
    }
  };
  const toggleExpanded = (id: string) => {
    setExpanded((previous) => {
      const result = new Set(previous);
      if (result.has(id)) {
        const close = (parent: string, seen = new Set<string>()) => {
          if (seen.has(parent)) return;
          seen.add(parent);
          result.delete(parent);
          for (const row of children[parent]?.items || []) close(row.id, seen);
        };
        close(id);
      } else result.add(id);
      return result;
    });
    if (!expanded.has(id) && !children[id]) void loadChildren(id);
  };
  return { expanded, children, resetTree, loadChildren, toggleExpanded };
}
