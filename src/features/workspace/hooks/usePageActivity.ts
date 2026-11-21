"use client";
import { useEffect, useState } from "react";
import { workspaceService } from "../api/workspaceService";
import type { PageAnalytics, WorkspaceActivity } from "../types";
export function usePageActivity(pageId: string, days: number) {
  const [analytics, setAnalytics] = useState<PageAnalytics | null>(null),
    [activity, setActivity] = useState<WorkspaceActivity[]>([]),
    [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false,
      generation = 0;
    const controller = new AbortController();
    setAnalytics(null);
    setActivity([]);
    setError(null);
    const load = () => {
      const current = ++generation;
      void Promise.all([
        workspaceService.analytics(pageId, days, controller.signal),
        workspaceService.activity(pageId),
      ])
        .then(([summary, events]) => {
          if (!cancelled && current === generation) {
            setAnalytics(summary);
            setActivity(events);
            setError(null);
          }
        })
        .catch((reason) => {
          if (!cancelled && current === generation)
            setError(
              reason instanceof Error
                ? reason.message
                : "Chưa tải được hoạt động.",
            );
        });
    };
    load();
    const visible = () => {
      if (document.visibilityState === "visible") load();
    };
    const timer = setInterval(visible, 15000);
    document.addEventListener("visibilitychange", visible);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [pageId, days]);
  return { analytics, activity, error };
}
