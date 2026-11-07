"use client";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { workspaceService } from "../api/workspaceService";
import type {
  DatabaseField,
  DatabaseView,
  DatabaseViewConfig,
  PropertyValue,
  ViewType,
  WorkspaceDatabase,
  WorkspacePage,
} from "../types";
export function useWorkspaceDatabase(id: string) {
  const [data, setData] = useState<WorkspaceDatabase | null>(null),
    [error, setError] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState(""),
    [configs, setConfigs] = useState<Record<string, DatabaseViewConfig>>({});
  const mounted = useRef(true),
    configVersions = useRef<Record<string, number>>({}),
    generation = useRef(0),
    loadedCount = useRef(200);
  const reload = useCallback(async () => {
    const current = ++generation.current;
    try {
      const result = await workspaceService.database(id);
      while (
        result.next_cursor &&
        result.records.length < loadedCount.current
      ) {
        const next = await workspaceService.database(id, result.next_cursor);
        result.records.push(...next.records);
        result.next_cursor = next.next_cursor;
      }
      if (mounted.current && current === generation.current) {
        setData(result);
        setError(null);
      }
    } catch (reason) {
      if (mounted.current && current === generation.current)
        setError(
          reason instanceof Error ? reason.message : "Chưa tải được bảng.",
        );
    }
  }, [id]);
  useEffect(() => {
    mounted.current = true;
    setData(null);
    setConfigs({});
    configVersions.current = {};
    setSelectedId("");
    void reload();
    const timer = setInterval(() => void reload(), 8000);
    const refresh = () => void reload();
    window.addEventListener("bdc:workspace-refresh", refresh);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      window.removeEventListener("bdc:workspace-refresh", refresh);
    };
  }, [reload]);
  const currentView =
    data?.views.find((view) => view.id === selectedId) || data?.views[0];
  const config = useMemo(
    () => (currentView ? configs[currentView.id] || currentView.config : {}),
    [currentView, configs],
  );
  const setConfig = useCallback(
    (value: DatabaseViewConfig) => {
      if (currentView) {
        configVersions.current[currentView.id] ??= currentView.version;
        setConfigs((previous) => ({ ...previous, [currentView.id]: value }));
      }
    },
    [currentView],
  );
  const createRecord = useCallback(
    async (title: string, values: Record<string, PropertyValue> = {}) => {
      const record = await workspaceService.createRecord(id, title, values);
      await reload();
      return record;
    },
    [id, reload],
  );
  const updateRecord = useCallback(
    async (
      record: WorkspacePage,
      values: Record<string, PropertyValue>,
      version = record.version,
      title?: string,
    ) => {
      try {
        const saved = await workspaceService.updateRecord(
          record.id,
          version,
          values,
          title,
        );
        setData((previous) =>
          previous
            ? {
                ...previous,
                records: previous.records.map((item) =>
                  item.id === saved.id ? { ...item, ...saved } : item,
                ),
              }
            : previous,
        );
        void reload();
        return saved;
      } catch (reason) {
        void reload();
        throw reason;
      }
    },
    [reload],
  );
  const saveSchema = useCallback(
    async (fields: DatabaseField[], version: number) => {
      if (!data) return;
      await workspaceService.schema(id, fields, version);
      await reload();
    },
    [id, data, reload],
  );
  const createView = useCallback(
    async (name: string, type: ViewType, personal: boolean) => {
      const view = await workspaceService.createView(
        id,
        name,
        type,
        config,
        personal,
      );
      await reload();
      setSelectedId(view.id);
      return view;
    },
    [id, config, reload],
  );
  const saveConfig = useCallback(
    async (view: DatabaseView) => {
      const saved = await workspaceService.saveView(id, {
        ...view,
        config,
        version: configVersions.current[view.id] ?? view.version,
      });
      delete configVersions.current[view.id];
      setConfigs((previous) => {
        const next = { ...previous };
        delete next[view.id];
        return next;
      });
      await reload();
      return saved;
    },
    [id, config, reload],
  );
  const loadMore = useCallback(async () => {
    if (!data?.next_cursor) return;
    setBusy(true);
    try {
      const next = await workspaceService.database(id, data.next_cursor);
      setData((previous) => {
        if (!previous) return next;
        const records = [
          ...previous.records,
          ...next.records.filter(
            (record) => !previous.records.some((item) => item.id === record.id),
          ),
        ];
        loadedCount.current = records.length;
        return { ...next, records };
      });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa tải được thêm mục.",
      );
    } finally {
      setBusy(false);
    }
  }, [id, data?.next_cursor]);
  return {
    data,
    error,
    busy,
    reload,
    currentView,
    selectedId,
    selectView: setSelectedId,
    config,
    setConfig,
    createRecord,
    updateRecord,
    saveSchema,
    createView,
    saveConfig,
    resetConfig: () => {
      if (!currentView) return;
      delete configVersions.current[currentView.id];
      setConfigs((previous) => {
        const next = { ...previous };
        delete next[currentView.id];
        return next;
      });
    },
    loadMore,
  };
}
