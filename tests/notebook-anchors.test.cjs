const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../src/features/notebook/anchors.ts"), "utf8");
const scope = {};
new Function("exports", ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText)(scope);
const { resolveAnchor } = scope;
test("restores exact UTF-16 highlight and relocates a quote after lesson edits", () => {
  assert.deepEqual(resolveAnchor("AI 🌱 ghi chú", { start: 3, end: 5, quote: "🌱", prefix: "AI ", suffix: " ghi chú" }), [3, 5]);
  assert.deepEqual(resolveAnchor("Mở đầu. Học AI cùng nhau.", { start: 0, end: 6, quote: "Học AI", prefix: "", suffix: " cùng nhau." }), [8, 14]);
});
test("uses nearby text to distinguish repeats; never invents an anchor for missing/ambiguous quotes", () => {
  assert.deepEqual(resolveAnchor("A: dữ liệu; B: dữ liệu.", { start: 0, end: 7, quote: "dữ liệu", prefix: "B: ", suffix: "." }), [15, 22]);
  assert.deepEqual(resolveAnchor("A: dữ liệu; B: dữ liệu.", { start: 3, end: 10, quote: "dữ liệu", prefix: "B: ", suffix: "." }), [15, 22]);
  assert.equal(resolveAnchor("dữ liệu, dữ liệu", { start: 50, end: 57, quote: "dữ liệu", prefix: "", suffix: "" }), null);
  assert.equal(resolveAnchor("Bài học mới", { start: 0, end: 3, quote: "Nội dung cũ", prefix: "", suffix: "" }), null);
});
