"use client";
import { useEffect } from "react";
import { workspaceService } from "../api/workspaceService";
export function usePageVisit(pageId?: string) {
  useEffect(() => {
    if (!pageId) return;
    let recorded = false;
    const record = () => {
      if (recorded || document.visibilityState !== "visible") return;
      recorded = true;
      void workspaceService.recordView(pageId).catch(() => {
        recorded = false;
      });
    };
    record();
    document.addEventListener("visibilitychange", record);
    return () => document.removeEventListener("visibilitychange", record);
  }, [pageId]);
}
