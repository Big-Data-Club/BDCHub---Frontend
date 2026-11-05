import type { NotebookAnnotation } from "@/types/ai/notebook";

/** UTF-16 offsets match browser Text/Range offsets; quotes survive small lesson edits. */
export function resolveAnchor(
  text: string,
  annotation: NotebookAnnotation,
): [number, number] | null {
  if (
    text.slice(annotation.start, annotation.end) === annotation.quote &&
    (!annotation.prefix ||
      text.slice(
        Math.max(0, annotation.start - annotation.prefix.length),
        annotation.start,
      ) === annotation.prefix) &&
    (!annotation.suffix ||
      text.slice(annotation.end, annotation.end + annotation.suffix.length) ===
        annotation.suffix)
  )
    return [annotation.start, annotation.end];
  const matches: { start: number; score: number }[] = [];
  let from = 0;
  while (matches.length < 1000) {
    const start = text.indexOf(annotation.quote, from);
    if (start < 0) break;
    const end = start + annotation.quote.length;
    const prefix =
      !!annotation.prefix &&
      text.slice(Math.max(0, start - annotation.prefix.length), start) ===
        annotation.prefix;
    const suffix =
      !!annotation.suffix &&
      text.slice(end, end + annotation.suffix.length) === annotation.suffix;
    matches.push({ start, score: Number(prefix) + Number(suffix) });
    from = start + 1;
  }
  if (!matches.length) return null;
  matches.sort((a, b) => b.score - a.score);
  if (matches.length > 1 && matches[0].score === matches[1].score) return null;
  return [matches[0].start, matches[0].start + annotation.quote.length];
}

export function lessonText(root: HTMLElement) {
  const nodes: { node: Text; start: number }[] = [];
  let text = "";
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest(
        "button,input,textarea,script,style,[aria-hidden=true],[data-annotation-layer]",
      )
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    nodes.push({ node, start: text.length });
    text += node.data;
  }
  return { text, nodes };
}
export function textOffset(
  nodes: ReturnType<typeof lessonText>["nodes"],
  container: Node,
  offset: number,
) {
  const caret = document.createRange();
  caret.setStart(container, offset);
  caret.collapse(true);
  let result = 0;
  for (const item of nodes) {
    if (item.node === container)
      return item.start + Math.min(offset, item.node.length);
    const end = document.createRange();
    end.setStart(item.node, item.node.length);
    end.collapse(true);
    if (end.compareBoundaryPoints(Range.START_TO_START, caret) > 0) break;
    result = item.start + item.node.length;
  }
  return result;
}
export function textRange(
  nodes: ReturnType<typeof lessonText>["nodes"],
  start: number,
  end: number,
): Range | null {
  const first = nodes.find(
    (item) => start >= item.start && start < item.start + item.node.length,
  );
  const last = nodes.find(
    (item) => end > item.start && end <= item.start + item.node.length,
  );
  if (!first || !last) return null;
  const range = document.createRange();
  range.setStart(first.node, start - first.start);
  range.setEnd(last.node, end - last.start);
  return range;
}
