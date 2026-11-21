const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript");
const file = path.resolve(
    __dirname,
    "../../src/features/workspace/utils/library.ts",
  ),
  moduleCode = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const loaded = { exports: {} };
new Function("module", "exports", moduleCode)(loaded, loaded.exports);
const {
  parseLibraryPreferences,
  reorderLibraryColumn,
  readyFilter,
  libraryTime,
} = loaded.exports;
test("library preferences reject foreign columns and keep page names visible and first", () => {
  const prefs = parseLibraryPreferences(
    {
      columns: ["source", "source", "unknown", "visited"],
      hidden: ["title", "source", "unknown"],
      sort: "unknown",
      filters: [
        { field: "source", op: "eq", value: "secret" },
        { field: "created", op: "contains", value: "bad" },
        { id: "one", field: "creator", op: "eq", value: "901" },
      ],
    },
    "all",
  );
  assert.equal(prefs.columns[0], "title");
  assert.equal(new Set(prefs.columns).size, 7);
  assert.deepEqual(prefs.hidden, ["source"]);
  assert.equal(prefs.sort, "edited");
  assert.equal(prefs.filters.length, 1);
  assert.equal(prefs.filters[0].field, "creator");
  assert.equal(parseLibraryPreferences(null, "recent").sort, "visited");
});
test("column reorder never drops columns or moves the required title column", () => {
  const columns = ["title", "creator", "source", "edited", "visited"];
  assert.deepEqual(reorderLibraryColumn(columns, "creator", "edited"), [
    "title",
    "source",
    "edited",
    "creator",
    "visited",
  ]);
  assert.deepEqual(reorderLibraryColumn(columns, "visited", "creator"), [
    "title",
    "visited",
    "creator",
    "source",
    "edited",
  ]);
  assert.equal(reorderLibraryColumn(columns, "title", "source"), columns);
  assert.equal(reorderLibraryColumn(columns, "source", "title"), columns);
  assert.deepEqual(columns, [
    "title",
    "creator",
    "source",
    "edited",
    "visited",
  ]);
});
test("incomplete filters never become API rules, while valid unary and calendar filters do", () => {
  assert.equal(
    readyFilter({ field: "title", op: "contains", value: "" }),
    false,
  );
  assert.equal(
    readyFilter({ field: "created", op: "on", value: "2026-02-30" }),
    false,
  );
  assert.equal(
    readyFilter({ field: "created", op: "on", value: "0000-01-01" }),
    false,
  );
  assert.equal(
    readyFilter({ field: "creator", op: "contains", value: "Alice" }),
    false,
  );
  assert.equal(readyFilter({ field: "visited", op: "empty" }), true);
  assert.equal(
    readyFilter({ field: "created", op: "on", value: "2026-11-06" }),
    true,
  );
  assert.equal(libraryTime(null, Date.now()), "Chưa mở");
  assert.equal(libraryTime("invalid", Date.now()), "—");
});
