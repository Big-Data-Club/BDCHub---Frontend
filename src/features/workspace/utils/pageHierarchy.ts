import type { WorkspacePage } from "../types";

type HierarchyPage = Pick<WorkspacePage, "id" | "parent_id">;

/** The page itself and every descendant, including collapsed/deep branches. */
export function pageBranchIds(pageId: string, pages: readonly HierarchyPage[]) {
  const children = new Map<string, string[]>();
  for (const page of pages) {
    if (!page.parent_id) continue;
    const siblings = children.get(page.parent_id) || [];
    siblings.push(page.id);
    children.set(page.parent_id, siblings);
  }
  const branch = new Set<string>();
  const pending = [pageId];
  while (pending.length) {
    const id = pending.pop()!;
    if (branch.has(id)) continue;
    branch.add(id);
    for (const child of children.get(id) || []) pending.push(child);
  }
  return branch;
}

export function pageMoveError(
  pageId: string,
  parentId: string | null,
  pages: readonly HierarchyPage[],
) {
  return parentId && pageBranchIds(pageId, pages).has(parentId)
    ? "Không thể chuyển trang vào chính nó hoặc trang con của nó."
    : null;
}

export function pageAncestors(page: WorkspacePage, pages: WorkspacePage[]) {
  const byId = new Map(pages.map((item) => [item.id, item])),
    seen = new Set([page.id]),
    parents: WorkspacePage[] = [];
  let id = page.parent_id;
  while (id && parents.length < 50) {
    if (seen.has(id)) break;
    seen.add(id);
    const parent = byId.get(id);
    if (
      !parent ||
      parent.space_id !== page.space_id ||
      parent.field_id !== page.field_id
    )
      break;
    parents.unshift(parent);
    id = parent.parent_id;
  }
  return parents;
}
