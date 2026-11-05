const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript"),
  katex = require("katex");
require("katex/contrib/mhchem");
function load(file) {
  const filename = path.resolve(
      __dirname,
      "../../src/features/workspace",
      file,
    ),
    module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  new Function("module", "exports", code)(module, module.exports);
  return module.exports;
}
const { formulaExamples } = load("data/formulas.ts"),
  { mathExportProjection, duplicateBlock } = load("utils/editorContent.ts"),
  { visibleRecords, moveDate } = load("utils/databaseViews.ts");
test("all 65 authored formulas render safely with the exact workspace KaTeX settings", () => {
  assert.equal(formulaExamples.length, 65);
  assert.equal(new Set(formulaExamples.map((item) => item.id)).size, 65);
  for (const example of formulaExamples)
    assert.ok(
      katex.renderToString(example.source, {
        displayMode: true,
        trust: false,
        strict: "error",
        throwOnError: true,
      }),
      example.id,
    );
  assert.equal(
    formulaExamples.filter((item) => item.category === "basics").length,
    15,
  );
});
test("Markdown export preserves inline/block equations and page destinations", () => {
  const projection = mathExportProjection([
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Result " },
        { type: "math", content: "a^2" },
      ],
    },
    { type: "mathBlock", content: [{ type: "text", text: "\\frac{a}{b}" }] },
    { type: "pageLink", props: { pageId: "page-id", title: "Destination" } },
  ]);
  assert.equal(
    projection.restore("BDCMATH0TOKEN\n\nBDCMATH1TOKEN"),
    "$a^2$\n\n$$\n\\frac{a}{b}\n$$",
  );
  assert.equal(projection.blocks[2].content[0].href, "/workspace?page=page-id");
});
test("block duplication allocates independent nested block IDs without mutating the source", () => {
  const original = {
      id: "one",
      type: "paragraph",
      content: [{ text: "Keep me" }],
      children: [{ id: "two", content: [] }],
    },
    copy = duplicateBlock(original);
  assert.notEqual(copy.id, original.id);
  assert.notEqual(copy.children[0].id, original.children[0].id);
  assert.equal(copy.content[0].text, "Keep me");
  assert.equal(original.id, "one");
});
test("database filtering and numeric ordering use canonical record properties", () => {
  const records = [
    { id: "a", title: "First", properties: { hours: 20, status: "todo" } },
    { id: "b", title: "Second", properties: { hours: 3, status: "done" } },
  ];
  assert.deepEqual(
    visibleRecords(records, [], { sort_by: "hours" }, "").map(
      (item) => item.id,
    ),
    ["b", "a"],
  );
  assert.deepEqual(
    visibleRecords(
      records,
      [],
      { filters: [{ field: "hours", op: "gte", value: 10 }] },
      "",
    ).map((item) => item.id),
    ["a"],
  );
  assert.deepEqual(
    records.map((item) => item.id),
    ["a", "b"],
  );
});
test("calendar movement preserves the entire multi-day span across month boundaries", () => {
  assert.deepEqual(
    moveDate({ start: "2026-11-29", end: "2026-12-02" }, "2026-12-30"),
    { start: "2026-12-30", end: "2027-01-02" },
  );
});

test("date filters compare calendar dates and never treat an empty value as zero", () => {
  const records = [
    {
      id: "a",
      title: "A",
      properties: { date: { start: "2026-11-05" }, hours: null },
    },
    {
      id: "b",
      title: "B",
      properties: { date: { start: "2026-12-01" }, hours: 0 },
    },
  ];
  assert.deepEqual(
    visibleRecords(
      records,
      [],
      { filters: [{ field: "date", op: "gte", value: "2026-12-01" }] },
      "",
    ).map((item) => item.id),
    ["b"],
  );
  assert.deepEqual(
    visibleRecords(
      records,
      [],
      { filters: [{ field: "hours", op: "lte", value: 0 }] },
      "",
    ).map((item) => item.id),
    ["b"],
  );
});

test("field breadcrumbs exclude other fields and stop at cycles", () => {
  const { pageAncestors } = load("utils/pageHierarchy.ts");
  const root = { id: "a", space_id: "s", field_id: "f", parent_id: null },
    child = { id: "b", space_id: "s", field_id: "f", parent_id: "a" },
    leaf = { id: "c", space_id: "s", field_id: "f", parent_id: "b" };
  assert.deepEqual(
    pageAncestors(leaf, [root, child, leaf]).map((p) => p.id),
    ["a", "b"],
  );
  assert.deepEqual(
    pageAncestors({ ...leaf, field_id: "g" }, [root, child]),
    [],
  );
  assert.ok(
    pageAncestors({ ...root, parent_id: "b" }, [
      root,
      { ...child, parent_id: "a" },
    ]).length <= 2,
  );
});
test("web cards export valid destinations and omit executable URL schemes", () => {
  const value = mathExportProjection([
    { type: "webLink", props: { url: "https://example.com/paper" } },
    { type: "webLink", props: { url: "javascript:alert(1)" } },
  ]);
  assert.equal(value.blocks[0].content[0].href, "https://example.com/paper");
  assert.deepEqual(value.blocks[1].content, []);
});
