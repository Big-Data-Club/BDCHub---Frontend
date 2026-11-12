export function contentText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(contentText).join("");
  if (!value || typeof value !== "object") return "";
  const item = value as Record<string, unknown>;
  return typeof item.text === "string" ? item.text : contentText(item.content);
}
export function duplicateBlock<T>(value: T): T {
  const visit = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(visit);
    if (!item || typeof item !== "object") return item;
    const result = Object.fromEntries(
      Object.entries(item).map(([key, child]) => [
        key,
        key === "id" && typeof child === "string"
          ? crypto.randomUUID()
          : visit(child),
      ]),
    );
    return result;
  };
  return visit(value) as T;
}
export function downloadWorkspaceFile(
  name: string,
  content: string,
  type: string,
) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name.replace(/[\\/:*?"<>|]/g, "_");
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function mathExportProjection<T>(blocks: T[]) {
  const replacements = new Map<string, string>();
  let index = 0;
  const token = (source: string, block: boolean) => {
    const id = `BDCMATH${index++}TOKEN`;
    replacements.set(id, block ? `$$\n${source}\n$$` : `$${source}$`);
    return { type: "text", text: id, styles: {} };
  };
  function project(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(project);
    if (!value || typeof value !== "object") return value;
    const item = value as Record<string, unknown>;
    if (item.type === "math") return token(contentText(item.content), false);
    if (item.type === "mathBlock")
      return {
        ...item,
        type: "paragraph",
        props: {},
        content: [token(contentText(item.content), true)],
        children: project(item.children),
      };
    if (item.type === "webLink") {
      const props = item.props as { url: string };
      let url = "";
      try {
        const parsed = new URL(props.url);
        if (["https:", "http:"].includes(parsed.protocol)) url = parsed.href;
      } catch {}
      return {
        type: "paragraph",
        props: {},
        content: url
          ? [
              {
                type: "link",
                href: url,
                content: [{ type: "text", text: url, styles: {} }],
              },
            ]
          : [],
        children: project(item.children),
      };
    }
    if (item.type === "pageLink") {
      const props = item.props as { pageId: string; title: string };
      return {
        type: "paragraph",
        props: {},
        content: [
          {
            type: "link",
            href: `/workspace?page=${props.pageId}`,
            content: [
              { type: "text", text: props.title || "Trang", styles: {} },
            ],
          },
        ],
        children: [],
      };
    }
    return Object.fromEntries(
      Object.entries(item).map(([key, child]) => [key, project(child)]),
    );
  }
  return {
    blocks: project(blocks) as T[],
    restore: (markdown: string) =>
      [...replacements].reduce(
        (text, [id, source]) => text.split(id).join(source),
        markdown,
      ),
  };
}
