import type { AIReference } from "@/types";

/** Preserve original reference numbers when hiding retrieved-but-uncited sources. */
export function selectCitedReferences(text: string, references: AIReference[]): AIReference[] {
  const prose = text.replace(/```[\s\S]*?```|`[^`]*`/g, "");
  const cited = new Set(Array.from(prose.matchAll(/\[(?:ref\s*)?(\d+)\]/gi), match => Number(match[1])));
  return references.flatMap((reference, index) =>
    cited.has(index + 1) ? [{ ...reference, citation_number: index + 1 }] : []);
}
