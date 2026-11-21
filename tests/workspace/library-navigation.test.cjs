const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript");
const code = ts.transpileModule(
  fs.readFileSync(
    path.resolve(
      __dirname,
      "../../src/features/workspace/utils/libraryNavigation.ts",
    ),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const loaded = { exports: {} };
new Function("module", "exports", code)(loaded, loaded.exports);
const { workspaceEditorHref, workspaceLibraryHref, libraryReturnHref } =
  loaded.exports;
const page = "b439d9a7-cc8e-4df3-bc34-167ad078d252",
  space = "ebcc9286-5c4f-42d6-9abc-a57b61ea4bf1",
  field = "7ea93909-184e-46b1-a12b-d4e9f3094016";
test("library carries the current editor, space and field as a reloadable return destination", () => {
  const editor = workspaceEditorHref({ page, space, field }),
    link = new URL(
      workspaceLibraryHref({ page, space, field }),
      "https://workspace.test",
    );
  assert.equal(link.pathname, "/workspace/library");
  assert.equal(libraryReturnHref(link.searchParams.get("returnTo")), editor);
  assert.equal(new URL(editor, link.origin).searchParams.get("page"), page);
  assert.equal(workspaceEditorHref({ field }), `/workspace?field=${field}`);
});
test("library return destinations reject external URLs, unrelated routes and missing editors", () => {
  for (const value of [
    null,
    "/workspace",
    `/workspace?space=${space}`,
    `https://evil.test/workspace?page=${page}`,
    `//evil.test/workspace?page=${page}`,
    `/workspace/library?page=${page}`,
    "/workspace?page=invalid",
    `/workspace?page=${page}#hidden`,
  ])
    assert.equal(libraryReturnHref(value), null);
  assert.equal(
    libraryReturnHref(`/workspace?page=${page}&redirect=https://evil.test`),
    `/workspace?page=${page}`,
  );
  assert.equal(workspaceLibraryHref({ space }), "/workspace/library");
});
