"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  LibraryColumn,
  LibraryFilter,
  LibraryPreferences,
  LibraryQuery,
  LibraryTab,
} from "../types/library";
import {
  defaultLibraryPreferences,
  libraryTabs,
  parseLibraryPreferences,
  readyFilter,
  reorderLibraryColumn,
} from "../utils/library";
export function useLibraryPreferences(userId: string) {
  const router = useRouter(),
    search = useSearchParams(),
    requested = search.get("tab");
  const tab: LibraryTab = libraryTabs.some((item) => item.id === requested)
    ? (requested as LibraryTab)
    : "recent";
  const [preferences, setPreferences] = useState<LibraryPreferences>(() =>
      defaultLibraryPreferences(tab),
    ),
    [loadedKey, setLoadedKey] = useState(""),
    [query, setQuery] = useState("");
  const storageKey = `bdc-workspace-library:${userId}:${tab}:v1`,
    ready = loadedKey === storageKey;
  useEffect(() => {
    let saved: unknown;
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch {}
    setPreferences(parseLibraryPreferences(saved, tab));
    setLoadedKey(storageKey);
  }, [storageKey, tab]);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(storageKey, JSON.stringify(preferences));
      } catch {}
  }, [preferences, ready, storageKey]);
  const draft = JSON.stringify({
    tab,
    q: query.trim(),
    sort: preferences.sort,
    direction: preferences.direction,
    match: preferences.match,
    filters: preferences.filters
      .filter(readyFilter)
      .map(({ field, op, value }) => ({ field, op, value })),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });
  const [applied, setApplied] = useState(draft);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => setApplied(draft), 200);
    return () => clearTimeout(timer);
  }, [draft, ready]);
  const params = useMemo(() => JSON.parse(applied) as LibraryQuery, [applied]),
    pending = !ready || draft !== applied;
  const updateFilter = (id: string, patch: Partial<LibraryFilter>) =>
    setPreferences((previous) => ({
      ...previous,
      filters: previous.filters.map((rule) =>
        rule.id === id ? { ...rule, ...patch } : rule,
      ),
    }));
  const addFilter = (field: LibraryFilter["field"] = "title") =>
    setPreferences((previous) =>
      previous.filters.length >= 12
        ? previous
        : {
            ...previous,
            filters: [
              ...previous.filters,
              {
                id: crypto.randomUUID(),
                field,
                op:
                  field === "title"
                    ? "contains"
                    : ["creator", "editor"].includes(field)
                      ? "eq"
                      : "on",
                value: "",
              },
            ],
          },
    );
  return {
    tab,
    params,
    pending,
    ready: !pending,
    query,
    setQuery,
    preferences,
    setPreferences,
    setTab: (value: LibraryTab) =>
      router.replace(`/workspace/library?tab=${value}`, { scroll: false }),
    updateFilter,
    addFilter,
    removeFilter: (id: string) =>
      setPreferences((previous) => ({
        ...previous,
        filters: previous.filters.filter((rule) => rule.id !== id),
      })),
    resetFilters: () =>
      setPreferences((previous) => ({
        ...previous,
        filters: [],
        match: "all",
      })),
    sort: (column: LibraryColumn) =>
      setPreferences((previous) => ({
        ...previous,
        sort: column,
        direction:
          previous.sort === column && previous.direction === "desc"
            ? "asc"
            : "desc",
      })),
    moveColumn: (from: LibraryColumn, to: LibraryColumn) =>
      setPreferences((previous) => ({
        ...previous,
        columns: reorderLibraryColumn(previous.columns, from, to),
      })),
    toggleColumn: (id: LibraryColumn) => {
      if (id !== "title")
        setPreferences((previous) => ({
          ...previous,
          hidden: previous.hidden.includes(id)
            ? previous.hidden.filter((key) => key !== id)
            : [...previous.hidden, id],
        }));
    },
    clear: () => {
      setQuery("");
      setPreferences((previous) => ({
        ...previous,
        filters: [],
        match: "all",
      }));
    },
  };
}
