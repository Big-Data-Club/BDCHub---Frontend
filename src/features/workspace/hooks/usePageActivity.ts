"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { workspaceService } from "../api/workspaceService";
import type { PageAnalytics, WorkspaceActivity } from "../types";
export function usePageActivity(pageId: string, days: number) {
  const privacy = useRef({ version: 0, busy: false });
  const [analytics, setAnalytics] = useState<PageAnalytics | null>(null),
    [activity, setActivity] = useState<WorkspaceActivity[]>([]),
    [error, setError] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setError(null);
    setAnalytics(null);
    setActivity([]);
    let generation = 0;
    const load = () => {
      const current = ++generation;
      const privacyVersion = privacy.current.version;
      void Promise.all([
        workspaceService.analytics(pageId, days, controller.signal),
        workspaceService.activity(pageId),
      ])
        .then(([summary, events]) => {
          if (!cancelled && current === generation) {
            setError(null);
            if (
              privacyVersion === privacy.current.version &&
              !privacy.current.busy
            )
              setAnalytics(summary);
            setActivity(events);
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
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    const timer = setInterval(onVisible, 15000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      controller.abort();
    };
  }, [pageId, days]);
  const setPreference = useCallback(
    async (show: boolean) => {
      const previous = analytics;
      privacy.current = { version: privacy.current.version + 1, busy: true };
      setAnalytics((value) => (value ? { ...value, show_name: show } : value));
      setBusy(true);
      setError(null);
      try {
        await workspaceService.viewPreference(pageId, show);
        setAnalytics(await workspaceService.analytics(pageId, days));
      } catch (reason) {
        setAnalytics(previous);
        setError(
          reason instanceof Error ? reason.message : "Chưa lưu được lựa chọn.",
        );
      } finally {
        privacy.current = { version: privacy.current.version + 1, busy: false };
        setBusy(false);
      }
    },
    [pageId, days, analytics],
  );
  return { analytics, activity, error, busy, setPreference };
}
