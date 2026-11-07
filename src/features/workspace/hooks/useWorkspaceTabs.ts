"use client";
import { useEffect, useState } from "react";
import { closeTab, emptyTabs, resolveTab } from "../utils/workspaceTabs";
import type { WorkspacePage } from "../types";
export function useWorkspaceTabs(
  page: WorkspacePage | null,
  onOpen: (id?: string) => void,
) {
  const [state, setState] = useState(emptyTabs);
  const id = page?.id,
    title = page?.title,
    icon = page?.icon;
  useEffect(() => {
    if (id)
      setState((previous) =>
        resolveTab(previous, { id, title: title || "", icon: icon || "" }),
      );
  }, [id, title, icon]);
  return {
    state,
    select: onOpen,
    close: (target: string) => {
      const result = closeTab(state, target, id);
      setState(result.state);
      if (target === id) onOpen(result.next);
    },
    step: (delta: number) => {
      const cursor = state.cursor + delta;
      if (cursor < 0 || cursor >= state.trail.length) return;
      setState({ ...state, cursor });
      onOpen(state.trail[cursor]);
    },
  };
}
