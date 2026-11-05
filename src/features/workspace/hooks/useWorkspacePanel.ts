"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { workspaceService } from "../api/workspaceService";
import type { WorkspacePage } from "../types";
export type InspectorTab =
  | "comments"
  | "sharing"
  | "history"
  | "sources"
  | "ai";
export function useWorkspacePanel(page: WorkspacePage, tab: InspectorTab) {
  const [comments, setComments] = useState<
    Awaited<ReturnType<typeof workspaceService.comments>>
  >([]);
  const [sharing, setSharing] = useState<Awaited<
    ReturnType<typeof workspaceService.sharing>
  > | null>(null);
  const [versions, setVersions] = useState<
    Awaited<ReturnType<typeof workspaceService.versions>>
  >([]);
  const [activity, setActivity] = useState<
    Awaited<ReturnType<typeof workspaceService.activity>>
  >([]);
  const [references, setReferences] = useState<Awaited<
    ReturnType<typeof workspaceService.references>
  > | null>(null);
  const [error, setError] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const current = ++generation.current;
    try {
      if (tab === "comments") {
        const [result, members] = await Promise.all([
          workspaceService.comments(page.id),
          workspaceService.sharing(page.id),
        ]);
        if (current === generation.current) {
          setComments(result);
          setSharing(members);
        }
      }
      if (tab === "sharing") {
        const result = await workspaceService.sharing(page.id);
        if (current === generation.current) setSharing(result);
      }
      if (tab === "history") {
        const [v, a] = await Promise.all([
          workspaceService.versions(page.id),
          workspaceService.activity(page.id),
        ]);
        if (current === generation.current) {
          setVersions(v);
          setActivity(a);
        }
      }
      if (tab === "sources") {
        const result = await workspaceService.references(page.id);
        if (current === generation.current) setReferences(result);
      }
      if (current === generation.current) setError(null);
    } catch (reason) {
      if (current === generation.current)
        setError(
          reason instanceof Error ? reason.message : "Chưa tải được thông tin.",
        );
    }
  }, [page.id, tab]);
  useEffect(() => {
    void reload();
    const timer = setInterval(() => void reload(), 10000);
    return () => {
      clearInterval(timer);
    };
  }, [reload]);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await reload();
      return true;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa hoàn thành thao tác.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  };
  return {
    comments,
    sharing,
    versions,
    activity,
    references,
    error,
    busy,
    run,
  };
}
