import type { HighlightColor } from "@/types/ai/notebook";
import { highlightColors } from "./colors";
const owners = new Map<string, { color: HighlightColor; range: Range }[]>();
let stylesheet: HTMLStyleElement | null = null;
export function registerHighlights(
  owner: string,
  entries: { color: HighlightColor; range: Range }[] | null,
): boolean {
  const api =
    typeof CSS === "undefined"
      ? undefined
      : (CSS as typeof CSS & { highlights?: Map<string, unknown> }).highlights;
  const HighlightClass = (
    window as Window & { Highlight?: new (...ranges: Range[]) => unknown }
  ).Highlight;
  if (!api || !HighlightClass) return false;
  if (entries) owners.set(owner, entries);
  else owners.delete(owner);
  // Register native Highlight API rules at runtime: the project's CSS compiler
  // predates ::highlight(). Only fixed, application-owned names/colors enter CSS.
  if (owners.size && !stylesheet) {
    stylesheet = document.createElement("style");
    stylesheet.dataset.notebookHighlights = "true";
    stylesheet.textContent = highlightColors
      .map(
        (color) =>
          `::highlight(bdc-notebook-${color.value}) { background-color: ${color.background}; }`,
      )
      .join("\n");
    document.head.appendChild(stylesheet);
  } else if (!owners.size && stylesheet) {
    stylesheet.remove();
    stylesheet = null;
  }
  for (const color of highlightColors) {
    const ranges = [...owners.values()]
      .flat()
      .filter((item) => item.color === color.value)
      .map((item) => item.range);
    if (ranges.length)
      api.set(`bdc-notebook-${color.value}`, new HighlightClass(...ranges));
    else api.delete(`bdc-notebook-${color.value}`);
  }
  return true;
}
