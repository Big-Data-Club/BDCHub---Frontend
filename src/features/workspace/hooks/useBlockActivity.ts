"use client";
import { useEffect, useState } from "react";
import { workspaceService } from "../api/workspaceService";

export function useBlockActivity(
  pageId?: string,
  blockId?: string,
  signature?: string,
) {
  const [activity, setActivity] = useState<{
    author: string;
    updated_at: string;
  } | null>(null);
  useEffect(() => {
    setActivity(null);
    if (!pageId || !blockId) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void workspaceService
        .blockActivity(pageId, blockId, controller.signal)
        .then(setActivity)
        .catch(() => {});
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [pageId, blockId, signature]);
  return activity;
}
