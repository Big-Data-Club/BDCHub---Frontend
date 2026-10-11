import type { TestCaseDraft } from "@/types/labs/authoring";
import { parseTestcaseSuite } from "@/schemas/labs/testcaseDraftSchema";
export const validateCaseDrafts = parseTestcaseSuite;
export async function importTestcaseFiles(files: File[]): Promise<TestCaseDraft[]> {
  if (!files.length || files.length > 100 || files.reduce((n, f) => n + f.size, 0) > 1500000) throw new Error("Chọn tối đa 100 file, tổng dung lượng không quá 1.5 MB.");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  if (files.length === 1 && /\.(json|jsonl)$/i.test(files[0].name)) {
    const text = decoder.decode(await files[0].arrayBuffer());
    const raw = /\.jsonl$/i.test(files[0].name) ? text.split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line)) : JSON.parse(text);
    return validateCaseDrafts(Array.isArray(raw) ? raw : raw.test_cases);
  }
  const pairs = new Map<string, { input?: string; expected?: string }>();
  for (const file of files) {
    const match = file.name.match(/^(.*)\.(in|out|input|output)$/i);
    if (!match) throw new Error(`File ${file.name}: dùng cặp cùng tên .in/.out hoặc .input/.output.`);
    const key = match[1]; const side = /^(in|input)$/i.test(match[2]) ? "input" : "expected";
    const pair = pairs.get(key) || {};
    if (pair[side] !== undefined) throw new Error(`File trùng: ${file.name}`);
    pair[side] = decoder.decode(await file.arrayBuffer()); pairs.set(key, pair);
  }
  const cases = [...pairs.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([name, pair]) => {
    if (pair.input === undefined || pair.expected === undefined) throw new Error(`Thiếu input/output của ${name}`);
    return { name, ...pair, is_sample: false, is_hidden: true, weight: 1 };
  });
  return validateCaseDrafts(cases);
}
