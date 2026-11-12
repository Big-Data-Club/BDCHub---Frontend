import type { WorkspacePage } from "../types";
export type WorkspaceTab = Pick<WorkspacePage, "id" | "title" | "icon">;
export interface WorkspaceTabState {
  tabs: WorkspaceTab[];
  trail: string[];
  cursor: number;
}
export const emptyTabs: WorkspaceTabState = { tabs: [], trail: [], cursor: -1 };
export function resolveTab(
  state: WorkspaceTabState,
  page: WorkspaceTab,
): WorkspaceTabState {
  const exists = state.tabs.some((tab) => tab.id === page.id),
    tabs = exists
      ? state.tabs.map((tab) => (tab.id === page.id ? page : tab))
      : [...state.tabs, page].slice(-12);
  const same = state.trail[state.cursor] === page.id,
    trail = same
      ? state.trail
      : [...state.trail.slice(0, state.cursor + 1), page.id].slice(-60);
  return { tabs, trail, cursor: same ? state.cursor : trail.length - 1 };
}
export function closeTab(
  state: WorkspaceTabState,
  id: string,
  activeId?: string,
) {
  const index = state.tabs.findIndex((tab) => tab.id === id),
    tabs = state.tabs.filter((tab) => tab.id !== id),
    next =
      activeId === id
        ? tabs[Math.min(Math.max(0, index - 1), tabs.length - 1)]?.id
        : activeId;
  const trail = state.trail.filter((item) => item !== id);
  return {
    state: { tabs, trail, cursor: next ? trail.lastIndexOf(next) : -1 },
    next,
  };
}
