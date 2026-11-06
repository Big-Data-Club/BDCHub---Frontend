"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { workspaceService } from "../api/workspaceService";
import type { WorkspaceBootstrap } from "../types";
import {
  libraryReturnHref,
  workspaceEditorHref,
} from "../utils/libraryNavigation";

export function useLibraryReturn(bootstrap: WorkspaceBootstrap) {
  const search = useSearchParams(),
    requested = libraryReturnHref(search.get("returnTo")),
    firstField = bootstrap.fields.find((field) => field.page_id),
    defaultHref =
      workspaceEditorHref({
        page: firstField?.page_id || bootstrap.shared_pages[0]?.id,
        space: firstField?.space_id,
        field: firstField?.id,
      }) || "/workspace";
  const [fallback, setFallback] = useState<string | null>(null);
  useEffect(() => {
    if (requested) return;
    const controller = new AbortController();
    // Catalog reads find the latest accessible editor without recording a visit.
    void workspaceService
      .library(
        {
          tab: "recent",
          q: "",
          sort: "visited",
          direction: "desc",
          filters: [],
          match: "all",
          timezone: "UTC",
          limit: 1,
        },
        controller.signal,
      )
      .then((data) => {
        if (!controller.signal.aborted)
          setFallback(
            workspaceEditorHref({ page: data.items[0]?.id }) || defaultHref,
          );
      })
      .catch(() => {
        if (!controller.signal.aborted) setFallback(defaultHref);
      });
    return () => controller.abort();
  }, [requested, defaultHref]);
  const href = requested || fallback;
  return {
    href,
    label: href && href !== "/workspace" ? "Quay lại trang" : "Workspace",
  };
}
