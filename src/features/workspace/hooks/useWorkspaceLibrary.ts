"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { workspaceService } from "../api/workspaceService";
import type { WorkspaceBootstrap } from "../types";
import { useLibraryPreferences } from "./useLibraryPreferences";
import { useLibraryData } from "./useLibraryData";
export function useLibraryBootstrap() {
  const [bootstrap, setBootstrap] = useState<WorkspaceBootstrap | null>(null),
    [error, setError] = useState("");
  const alive = useRef(false),
    generation = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    try {
      const value = await workspaceService.bootstrap();
      if (alive.current && current === generation.current) {
        setBootstrap(value);
        setError("");
      }
    } catch (reason) {
      if (alive.current && current === generation.current)
        setError(
          reason instanceof Error ? reason.message : "Chưa mở được Thư viện.",
        );
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    void refresh();
    window.addEventListener("focus", refresh);
    return () => {
      alive.current = false;
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);
  return { bootstrap, error, refresh };
}
export function useWorkspaceLibrary(userId: string) {
  const view = useLibraryPreferences(userId),
    data = useLibraryData(view.params, view.ready);
  return { ...view, ...data, loading: view.pending || data.loading };
}
export type WorkspaceLibraryModel = ReturnType<typeof useWorkspaceLibrary>;
