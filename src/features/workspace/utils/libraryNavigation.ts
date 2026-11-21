const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
interface EditorLocation {
  page?: string | null;
  space?: string | null;
  field?: string | null;
}
export function workspaceEditorHref(location: EditorLocation) {
  const query = new URLSearchParams();
  for (const key of ["page", "space", "field"] as const) {
    const value = location[key];
    if (value && uuid.test(value)) query.set(key, value);
  }
  if (!query.has("page") && !query.has("field")) return null;
  return `/workspace?${query}`;
}
export function libraryReturnHref(value: string | null) {
  if (!value?.startsWith("/workspace?") || value.includes("#")) return null;
  const query = new URLSearchParams(value.slice("/workspace?".length));
  return workspaceEditorHref({
    page: query.get("page"),
    space: query.get("space"),
    field: query.get("field"),
  });
}
export function workspaceLibraryHref(location: EditorLocation) {
  const returnTo = workspaceEditorHref(location);
  return returnTo
    ? `/workspace/library?${new URLSearchParams({ returnTo })}`
    : "/workspace/library";
}
