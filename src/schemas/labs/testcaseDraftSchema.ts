import type { TestCaseDraft } from "@/types/labs/authoring";
const bytes = (value: string) => new TextEncoder().encode(value).length;
// A bounded DTO parser; the server independently validates every saved case.
export function parseTestcaseSuite(raw: unknown): TestCaseDraft[] {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 50) throw new Error("Bộ test cần 1–50 testcase.");
  return raw.map((value: unknown, index) => {
    if (!value || typeof value !== "object") throw new Error(`Test ${index + 1} phải là object.`);
    const item = value as Record<string, unknown>;
    if (typeof item.input !== "string" || typeof item.expected !== "string") throw new Error(`Test ${index + 1}: input và expected phải là chuỗi.`);
    if (bytes(item.input) > 16384 || bytes(item.expected) > 8192) throw new Error(`Test ${index + 1} vượt input 16 KiB / output 8 KiB.`);
    const name = item.name ?? `Test ${index + 1}`;
    const weight = item.weight ?? 1;
    const explanation = item.explanation ?? "";
    if (typeof name !== "string" || name.length > 255 || typeof weight !== "number" || !Number.isInteger(weight) || weight < 1 || weight > 1000 || typeof explanation !== "string" || explanation.length > 2000) throw new Error(`Test ${index + 1}: tên, trọng số hoặc giải thích không hợp lệ.`);
    for (const flag of ["is_sample", "is_hidden"]) if (item[flag] !== undefined && typeof item[flag] !== "boolean") throw new Error(`Test ${index + 1}: ${flag} phải là boolean.`);
    return { name, input: item.input, expected: item.expected, explanation, is_sample: item.is_sample === true, is_hidden: item.is_sample === true ? false : item.is_hidden !== false, weight, order_index: index };
  });
}
