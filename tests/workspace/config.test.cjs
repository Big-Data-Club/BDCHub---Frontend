const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript");
test("production keeps the Workspace WebSocket route for direct frontend access", async () => {
  const code = ts.transpileModule(
      fs.readFileSync(path.resolve(__dirname, "../../next.config.ts"), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
    module = { exports: {} };
  new Function("module", "exports", "process", code)(module, module.exports, {
    env: {
      NODE_ENV: "production",
      WORKSPACE_SERVICE_URL: "http://workspace-service:8088",
    },
  });
  const routes = await module.exports.default.rewrites();
  assert.equal(
    routes.find((route) => route.source === "/workspace-ws").destination,
    "http://workspace-service:8088/workspace-ws",
  );
});
