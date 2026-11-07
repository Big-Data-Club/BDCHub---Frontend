"use client";
import { useEffect, useState, useRef } from "react";
import { WorkspaceProvider } from "../api/WorkspaceProvider";
import type { CollaborationStatus, WorkspaceUser } from "../types";

export function useWorkspaceProvider(
  pageId: string,
  generation: number,
  user: WorkspaceUser,
  refresh: () => void,
) {
  const { id, name, email } = user;
  const [provider, setProvider] = useState<WorkspaceProvider | null>(null);
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const [status, setStatus] = useState<CollaborationStatus>({
    state: "connecting",
    pending: 0,
    access: 0,
  });
  useEffect(() => {
    const instance = new WorkspaceProvider(
      pageId,
      generation,
      { id, name, email },
      () => refreshRef.current(),
    );
    setProvider(instance);
    const unsubscribe = instance.subscribe(setStatus);
    void instance.start();
    return () => {
      unsubscribe();
      void instance.destroy();
    };
  }, [pageId, generation, id, name, email]);
  return { provider, status };
}
