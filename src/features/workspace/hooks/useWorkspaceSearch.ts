"use client";
import { useEffect, useState } from "react";
import { workspaceService } from "../api/workspaceService";
export function useWorkspaceSearch(query: string) {
  const [results, setResults] = useState<
      Awaited<ReturnType<typeof workspaceService.search>>
    >([]),
    [error, setError] = useState<string | null>(null),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      void workspaceService
        .search(query, controller.signal)
        .then((items) => {
          setResults(items);
          setError(null);
        })
        .catch((reason) => {
          if (!controller.signal.aborted)
            setError(
              reason instanceof Error ? reason.message : "Chưa tìm được.",
            );
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);
  return { results, loading, error };
}
