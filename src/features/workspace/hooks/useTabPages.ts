"use client";
import { useEffect, useState } from "react";
import { workspaceService } from "../api/workspaceService";
export function useTabPages(query: string, fieldId: string) {
  const [results, setResults] = useState<
      Awaited<ReturnType<typeof workspaceService.tabPages>>
    >([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setResults([]);
    setError(null);
    const timer = setTimeout(
      () => {
        void workspaceService
          .tabPages(query, fieldId, controller.signal)
          .then(setResults)
          .catch((reason) => {
            if (!controller.signal.aborted) {
              setResults([]);
              setError(
                reason instanceof Error
                  ? reason.message
                  : "Chưa tìm được trang.",
              );
            }
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      },
      query ? 200 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, fieldId]);
  return { results, loading, error };
}
