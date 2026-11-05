import type { WorkspacePage } from "../types";
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
