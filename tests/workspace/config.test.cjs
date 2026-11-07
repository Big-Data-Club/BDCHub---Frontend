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
    loadedModule = { exports: {} };
  new Function("module", "exports", "process", code)(
    loadedModule,
    loadedModule.exports,
    {
      env: {
        NODE_ENV: "production",
        WORKSPACE_SERVICE_URL: "http://workspace-service:8088",
      },
    },
  );
  const routes = await loadedModule.exports.default.rewrites();
  assert.equal(
    routes.find((route) => route.source === "/workspace-ws").destination,
    "http://workspace-service:8088/workspace-ws",
  );
});

test("development keeps Next's chunk graph so editor CSS cannot replace a vendor script", () => {
  const code = ts.transpileModule(
    fs.readFileSync(path.resolve(__dirname, "../../next.config.ts"), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const loadedModule = { exports: {} };
  new Function("module", "exports", code)(loadedModule, loadedModule.exports);
  const nextConfig = loadedModule.exports.default;
  const original = {
    chunks: "async",
    cacheGroups: { framework: { name: "framework" } },
  };
  const development = { optimization: { splitChunks: original } };
  assert.equal(
    nextConfig.webpack(development, { isServer: false, dev: true }).optimization
      .splitChunks,
    original,
  );
  const production = { optimization: { splitChunks: original } };
  assert.equal(
    nextConfig.webpack(production, { isServer: false, dev: false }).optimization
      .splitChunks.cacheGroups.vendor.name,
    "vendor",
  );
});
