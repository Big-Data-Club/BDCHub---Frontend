"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { workspaceService } from "../api/workspaceService";
import type {
  LibraryPage,
  LibraryPeople,
  LibraryQuery,
} from "../types/library";
import { useLibraryTree } from "./useLibraryTree";
export function useLibraryData(params: LibraryQuery, ready: boolean) {
  const [items, setItems] = useState<LibraryPage[]>([]),
    [total, setTotal] = useState(0),
    [nextOffset, setNextOffset] = useState<number | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [people, setPeople] = useState<LibraryPeople>({
      creators: [],
      editors: [],
    }),
    [peopleError, setPeopleError] = useState(""),
    [busyFavorites, setBusyFavorites] = useState<Set<string>>(new Set());
  const generation = useRef(0),
    controller = useRef<AbortController | null>(null),
    alive = useRef(false);
  const tree = useLibraryTree(params),
    { resetTree } = tree;
  const load = useCallback(
    async (offset = 0) => {
      if (!ready) return;
      const current = ++generation.current;
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      setLoading(true);
      setError("");
      if (!offset) resetTree();
      try {
        const data = await workspaceService.library(
          { ...params, offset },
          abort.signal,
        );
        if (!alive.current || current !== generation.current) return;
        setItems((previous) =>
          offset
            ? [
                ...new Map(
                  [...previous, ...data.items].map((row) => [row.id, row]),
                ).values(),
              ]
            : data.items,
        );
        setTotal(data.total);
        setNextOffset(data.next_offset);
      } catch (reason) {
        if (
          !alive.current ||
          abort.signal.aborted ||
          current !== generation.current
        )
          return;
        setError(
          reason instanceof Error ? reason.message : "Chưa tải được các trang.",
        );
        if (!offset) {
          setItems([]);
          setTotal(0);
          setNextOffset(null);
        }
      } finally {
        if (alive.current && current === generation.current) setLoading(false);
      }
    },
    [params, ready, resetTree],
  );
  const refreshPeople = useCallback(async () => {
    try {
      const data = await workspaceService.libraryPeople();
      if (alive.current) {
        setPeople(data);
        setPeopleError("");
      }
    } catch {
      if (alive.current) setPeopleError("Chưa tải được danh sách người.");
    }
  }, []);
  const invalidate = useCallback(() => {
    generation.current++;
    controller.current?.abort();
  }, []);
  useEffect(() => {
    alive.current = true;
    void refreshPeople();
    return () => {
      alive.current = false;
      invalidate();
    };
  }, [refreshPeople, invalidate]);
  useEffect(() => {
    if (!ready) return;
    void load();
    const refresh = () => {
      void load();
      void refreshPeople();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("bdc:library-refresh", refresh);
    return () => {
      invalidate();
      window.removeEventListener("focus", refresh);
      window.removeEventListener("bdc:library-refresh", refresh);
    };
  }, [load, ready, refreshPeople, invalidate]);
  const toggleFavorite = async (row: LibraryPage) => {
    setBusyFavorites((previous) => new Set(previous).add(row.id));
    try {
      await workspaceService.favorite(row.id, !row.favorite);
      if (alive.current) window.dispatchEvent(new Event("bdc:library-refresh"));
    } catch (reason) {
      if (alive.current)
        setError(
          reason instanceof Error ? reason.message : "Chưa đổi được yêu thích.",
        );
    } finally {
      if (alive.current)
        setBusyFavorites((previous) => {
          const next = new Set(previous);
          next.delete(row.id);
          return next;
        });
    }
  };
  return {
    items,
    total,
    nextOffset,
    loading,
    error,
    people,
    peopleError,
    refreshPeople,
    busyFavorites,
    toggleFavorite,
    refresh: () => load(),
    loadMore: () => nextOffset !== null && load(nextOffset),
    ...tree,
  };
}
