const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Exercise the actual component handlers with deterministic React hook state.
// This suite needs neither a browser nor a running API/database.
function harness() {
  const slots = [];
  let cursor = 0;
  const moves = [];
  const marker = () => null;
  const overrides = {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = initial;
        return [
          slots[index],
          (value) => {
            slots[index] =
              typeof value === "function" ? value(slots[index]) : value;
          },
        ];
      },
      useRef(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = { current: initial };
        return slots[index];
      },
      useEffect() {},
    },
    "next/link": { default: marker },
    "../hooks/useWorkspaceSearch": {
      useWorkspaceSearch: () => ({ loading: false, results: [] }),
    },
    "./WorkspacePrimitives": {
      WorkspaceButton: marker,
      WorkspaceDialog: marker,
      WorkspaceErrorBanner: marker,
      workspaceInputClass: "",
    },
    "./PageAppearanceFields": { PageAppearanceFields: marker },
    "./dialogs/WorkspaceTrashDialog": { WorkspaceTrashDialog: marker },
    "../api/workspaceService": {
      workspaceService: { updatePage: async (...args) => moves.push(args) },
    },
  };
  function load(file) {
    const filename = path.resolve(
      __dirname,
      "../../src/features/workspace",
      file,
    );
    const loadedModule = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const resolve = (name) => {
      if (name in overrides) return overrides[name];
      if (name.startsWith(".")) {
        return load(
          path.relative(
            path.resolve(__dirname, "../../src/features/workspace"),
            path.resolve(path.dirname(filename), name + ".ts"),
          ),
        );
      }
      return require(name);
    };
    new Function("module", "exports", "require", code)(
      loadedModule,
      loadedModule.exports,
      resolve,
    );
    return loadedModule.exports;
  }
  return {
    load,
    moves,
    render(component, props) {
      cursor = 0;
      return component(props);
    },
  };
}

function nodes(root, predicate) {
  if (!root || typeof root !== "object") return [];
  if (Array.isArray(root))
    return root.flatMap((node) => nodes(node, predicate));
  return [
    ...(predicate(root) ? [root] : []),
    ...nodes(root.props?.children, predicate),
  ];
}
function row(root, id) {
  const matches = nodes(
    root,
    (node) => node.props?.["data-workspace-page-id"] === id,
  );
  assert.equal(matches.length, 1, `page row ${id}`);
  return matches[0].props;
}
function event(payload = "", type = "application/x-bdc-page") {
  const data = new Map([[type, payload]]);
  return {
    prevented: false,
    stopped: false,
    preventDefault() {
      this.prevented = true;
    },
    stopPropagation() {
      this.stopped = true;
    },
    dataTransfer: {
      types: [type],
      getData: (key) => data.get(key) || "",
      setData: (key, value) => data.set(key, value),
      dropEffect: "none",
    },
  };
}
function page(id, parent_id = null) {
  return {
    id,
    parent_id,
    title: id,
    kind: "page",
    space_id: "space",
    field_id: null,
    version: 1,
  };
}
function sidebarProps(pages, moves, role = "owner") {
  return {
    pages,
    bootstrap: { fields: [], invitations: [], shared_pages: [] },
    space: { id: "space", kind: "personal", role },
    field: null,
    onMove: (...args) => moves.push(args),
  };
}
const pages = [page("a"), page("b", "a"), page("c", "b"), page("d")];

test("page moves reject self and descendants while allowing ancestors, siblings and root", () => {
  const { pageMoveError, pageBranchIds } = harness().load(
    "utils/pageHierarchy.ts",
  );
  assert.deepEqual([...pageBranchIds("a", pages)].sort(), ["a", "b", "c"]);
  for (const target of ["a", "b", "c"])
    assert.ok(pageMoveError("a", target, pages));
  for (const [source, target] of [
    ["c", "a"],
    ["b", "d"],
    ["b", null],
    ["c", "b"],
  ]) {
    assert.equal(pageMoveError(source, target, pages), null);
  }
});

test("move validation covers deep branches and terminates on pre-existing cycles", () => {
  const { pageMoveError, pageBranchIds } = harness().load(
    "utils/pageHierarchy.ts",
  );
  const deep = Array.from({ length: 80 }, (_, i) =>
    page(String(i), i ? String(i - 1) : null),
  );
  assert.ok(pageMoveError("0", "79", deep));
  assert.equal(pageMoveError("79", "0", deep), null);
  const cyclic = [page("a", "c"), page("b", "a"), page("c", "b")];
  assert.deepEqual([...pageBranchIds("a", cyclic)].sort(), ["a", "b", "c"]);
  assert.ok(pageMoveError("a", "c", cyclic));
});

test("Sidebar blocks invalid hover/drop without calling onMove and reports why", () => {
  const h = harness();
  const { WorkspaceSidebar } = h.load("components/WorkspaceSidebar.tsx");
  const props = sidebarProps(pages, h.moves);
  let view = h.render(WorkspaceSidebar, props);
  row(view, "a").onDragStart(event());
  for (const target of ["a", "b", "c"]) {
    const hover = event();
    row(view, target).onDragOver(hover);
    assert.equal(hover.prevented, false);
    assert.equal(hover.dataTransfer.dropEffect, "none");
    assert.equal(hover.stopped, true);
    row(view, target).onDrop(event("a"));
    view = h.render(WorkspaceSidebar, props);
    assert.ok(
      nodes(view, (node) =>
        node.props?.message?.includes("Không thể chuyển trang"),
      ).length,
    );
    row(view, "a").onDragStart(event());
  }
  assert.deepEqual(h.moves, []);
});

test("Sidebar accepts a valid ancestor target, highlights it and clears drag state", () => {
  const h = harness();
  const { WorkspaceSidebar } = h.load("components/WorkspaceSidebar.tsx");
  const props = sidebarProps(pages, h.moves);
  let view = h.render(WorkspaceSidebar, props);
  const drag = event();
  row(view, "c").onDragStart(drag);
  assert.equal(drag.dataTransfer.getData("application/x-bdc-page"), "c");
  const hover = event();
  row(view, "a").onDragOver(hover);
  assert.equal(hover.prevented, true);
  assert.equal(hover.dataTransfer.dropEffect, "move");
  view = h.render(WorkspaceSidebar, props);
  assert.match(row(view, "a").className, /ring-2/);
  row(view, "a").onDrop(event("c"));
  assert.deepEqual(h.moves, [["c", "a"]]);
  view = h.render(WorkspaceSidebar, props);
  assert.doesNotMatch(row(view, "a").className, /ring-2/);
  const afterDrop = event();
  row(view, "d").onDragOver(afterDrop);
  assert.equal(afterDrop.prevented, false);
});

test("Sidebar revalidates a tree changed during a drag and ignores non-page/missing payloads", () => {
  const h = harness();
  const { WorkspaceSidebar } = h.load("components/WorkspaceSidebar.tsx");
  let props = sidebarProps(pages, h.moves);
  let view = h.render(WorkspaceSidebar, props);
  row(view, "a").onDragStart(event());
  props = { ...props, pages: [...pages.slice(0, 3), page("d", "b")] };
  view = h.render(WorkspaceSidebar, props);
  row(view, "d").onDrop(event("a"));
  row(view, "d").onDrop(event("a", "text/plain"));
  row(view, "d").onDrop(event());
  row(view, "d").onDrop(event("missing"));
  assert.deepEqual(h.moves, []);
});

test("Sidebar prevents unauthorized drags and clears cancelled drag targets", () => {
  const h = harness();
  const { WorkspaceSidebar } = h.load("components/WorkspaceSidebar.tsx");
  const viewer = h.render(
    WorkspaceSidebar,
    sidebarProps(pages, h.moves, "viewer"),
  );
  const start = event();
  assert.equal(row(viewer, "a").draggable, false);
  row(viewer, "a").onDragStart(start);
  assert.equal(start.prevented, true);
  row(viewer, "d").onDrop(event("a"));
  assert.deepEqual(h.moves, []);
  const props = sidebarProps(pages, h.moves);
  let view = h.render(WorkspaceSidebar, props);
  row(view, "b").onDragStart(event());
  row(view, "d").onDragOver(event());
  row(view, "b").onDragEnd();
  view = h.render(WorkspaceSidebar, props);
  assert.doesNotMatch(row(view, "d").className, /ring-2/);
  const hover = event();
  row(view, "d").onDragOver(hover);
  assert.equal(hover.prevented, false);
});

test("Move dialog excludes self/descendants and rechecks a stale selected destination", async () => {
  const h = harness();
  const { WorkspaceDialogs } = h.load("components/WorkspaceDialogs.tsx");
  let props = {
    value: { type: "move", page: pages[0] },
    pages,
    bootstrap: { fields: [] },
    onRefresh: async () => {},
    onClose() {},
  };
  let view = h.render(WorkspaceDialogs, props);
  const select = nodes(
    view,
    (node) => node.props?.["aria-label"] === "Trang cha mới",
  )[0];
  assert.deepEqual(
    nodes(select, (node) => node.type === "option").map(
      (node) => node.props.value,
    ),
    ["", "d"],
  );
  select.props.onChange({ target: { value: "d" } });
  props = { ...props, pages: [...pages.slice(0, 3), page("d", "b")] };
  view = h.render(WorkspaceDialogs, props);
  nodes(view, (node) => node.type === "form")[0].props.onSubmit(event());
  await new Promise((resolve) => setImmediate(resolve));
  view = h.render(WorkspaceDialogs, props);
  assert.deepEqual(h.moves, []);
  assert.ok(
    nodes(view, (node) =>
      node.props?.message?.includes("Không thể chuyển trang"),
    ).length,
  );
});

test("Move dialog permits a valid ancestor and excludes foreign-space/database parents", async () => {
  const h = harness();
  const { WorkspaceDialogs } = h.load("components/WorkspaceDialogs.tsx");
  const props = {
    value: { type: "move", page: pages[2] },
    pages: [
      ...pages,
      { ...page("foreign"), space_id: "other" },
      { ...page("database"), kind: "database" },
    ],
    bootstrap: { fields: [] },
    onRefresh: async () => {},
    onClose() {},
  };
  let view = h.render(WorkspaceDialogs, props);
  const select = nodes(
    view,
    (node) => node.props?.["aria-label"] === "Trang cha mới",
  )[0];
  assert.deepEqual(
    nodes(select, (node) => node.type === "option").map(
      (node) => node.props.value,
    ),
    ["", "a", "b", "d"],
  );
  select.props.onChange({ target: { value: "a" } });
  view = h.render(WorkspaceDialogs, props);
  nodes(view, (node) => node.type === "form")[0].props.onSubmit(event());
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(h.moves, [
    ["c", { version: 1, parent_id: "a", field_id: null }],
  ]);
});
