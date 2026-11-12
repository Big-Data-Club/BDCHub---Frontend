const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript");
const code = ts.transpileModule(
  fs.readFileSync(
    path.resolve(
      __dirname,
      "../../src/features/workspace/api/linkedTasks.server.ts",
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
function helper(fetcher) {
  const loadedModule = { exports: {} };
  new Function("module", "exports", "fetch", "process", code)(
    loadedModule,
    loadedModule.exports,
    fetcher,
    { env: { BACKEND_URL: "http://auth-test:8080" } },
  );
  return loadedModule.exports.readableTasks;
}
const tasks = [
  {
    id: 1,
    title: "Created",
    columnId: "todo",
    createdBy: { id: 901 },
    description: "Private details",
  },
  {
    id: 2,
    title: "Assigned",
    columnId: "done",
    assignees: [{ id: 901, email: "member@example.invalid" }],
  },
  { id: 3, title: "Other team", columnId: "todo", createdBy: { id: 902 } },
];
test("BDC task links require original creator/assignee rights and discard unrelated personal data", async () => {
  let request;
  const read = helper(async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify(tasks));
  });
  const result = await read({
    user: { id: 901, role: "ROLE_MEMBER" },
    accessToken: "signed-session",
  });
  assert.deepEqual(
    result.map((item) => item.id),
    [1, 2],
  );
  assert.equal(JSON.stringify(result).includes("Private details"), false);
  assert.equal(JSON.stringify(result).includes("@"), false);
  assert.equal(request.options.headers.Authorization, "Bearer signed-session");
});
test("task administrators retain canonical visibility; an unavailable task service does not fabricate tasks", async () => {
  const read = helper(async () => new Response(JSON.stringify(tasks)));
  assert.equal(
    (await read({ user: { id: 901, role: "ROLE_ADMIN" } })).length,
    3,
  );
  await assert.rejects(
    helper(async () => new Response("{}", { status: 503 }))({
      user: { id: 901, role: "ROLE_MEMBER" },
    }),
  );
});
