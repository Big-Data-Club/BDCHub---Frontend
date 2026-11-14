const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");

// Run the real TypeScript modules with isolated dependencies; no build or backend needed.
function sourceLoader(overrides = {}) {
  const modules = new Map();
  function load(relative) {
    const filename = path.resolve(root, relative);
    const key = path.relative(root, filename).replaceAll(path.sep, "/");
    if (Object.hasOwn(overrides, key)) return overrides[key];
    if (modules.has(filename)) return modules.get(filename);
    const exports = {};
    modules.set(filename, exports);
    const resolve = createRequire(filename);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const requireSource = (name) => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (!name.startsWith(".") && !name.startsWith("@/")) return resolve(name);
      const absolute = name.startsWith("@/")
        ? path.join(root, "src", name.slice(2))
        : path.resolve(path.dirname(filename), name);
      const source = [
        absolute,
        absolute + ".ts",
        absolute + ".tsx",
        path.join(absolute, "index.ts"),
      ].find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
      return source && /\.tsx?$/.test(source)
        ? load(path.relative(root, source))
        : resolve(name);
    };
    new Function("require", "exports", code)(requireSource, exports);
    return exports;
  }
  return load;
}
module.exports = { sourceLoader };
