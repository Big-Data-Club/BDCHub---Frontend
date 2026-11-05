const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { NextRequest } = require("next/server");

function load(relative, resolve = require) {
  const source = fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;
  const result = {};
  new Function("require", "exports", js)(resolve, result);
  return result;
}
const paths = load("src/lib/tenant/paths.ts");

test("logo uploads use image storage and reject invalid files before uploading", async () => {
  let requests = 0;
  let fileUrl = "/files/logo.png";
  const { organizationService } = load("src/services/admin/organizationService.ts", id => {
    if (id === "../lms/lmsApiClient") return { lmsApiClient: { post: async (url, form) => {
      requests++;
      assert.equal(url, "/files/upload");
      assert.equal(form.get("type"), "image");
      assert.equal(form.get("file").name, "logo.png");
      return { data: { data: { file_url: fileUrl } } };
    } } };
    if (id === "../common/api") return { apiClient: {} };
    return require(id);
  });
  const file = new File([new Uint8Array([1])], "logo.png", { type: "image/png" });
  assert.equal(await organizationService.uploadLogo(file), "/files/logo.png");
  for (const invalid of [
    new File(["<svg/>"], "x.svg", { type: "image/svg+xml" }),
    new File([], "empty.png", { type: "image/png" }),
    new File([new Uint8Array(2 * 1024 * 1024 + 1)], "big.png", { type: "image/png" }),
  ]) await assert.rejects(organizationService.uploadLogo(invalid));
  assert.equal(requests, 1);
  fileUrl = "https://unexpected.test/logo.png";
  await assert.rejects(organizationService.uploadLogo(file), /đường dẫn/);
});

test("organization creation sends the logo field expected by Auth", async () => {
  let sent;
  const { organizationService } = load("src/services/admin/organizationService.ts", id => {
    if (id === "../lms/lmsApiClient") return { lmsApiClient: {} };
    if (id === "../common/api") return { apiClient: { post: async (url, body) => { sent = { url, body }; } } };
    return require(id);
  });
  await organizationService.create({ name: "CCE", slug: "trungtamdientoan", logo_url: "/uploads/cce.png" });
  assert.equal(sent.body.logoUrl, "/uploads/cce.png");
  assert.equal(sent.body.logo_url, undefined);
});

test("tenant URLs keep nested paths, queries and hashes without prefixing API/assets", () => {
  for (const service of ["lms", "chat", "knowledge-farm", "labs"]) {
    assert.deepEqual(paths.parseTenantPath(`/trungtamdientoan/${service}/detail`), { slug: "trungtamdientoan", path: `/${service}/detail` });
    assert.equal(paths.tenantPath(`/${service}/detail?q=1#lesson`, "trungtamdientoan"), `/trungtamdientoan/${service}/detail?q=1#lesson`);
  }
  for (const url of ["/api/auth/session", "/apiv1/api/users", "/uploads/logo.png", "/files/a.pdf", "/_next/a.js", "https://example.com/lms", "//example.com/lms", "#about", "/other-org/lms"]) {
    assert.equal(paths.tenantPath(url, "trungtamdientoan"), url);
  }
  assert.equal(paths.tenantPath("/", "trungtamdientoan"), "/trungtamdientoan");
  assert.equal(paths.tenantPath("/trungtamdientoan/lms", "trungtamdientoan"), "/trungtamdientoan/lms");
  assert.equal(paths.parseTenantPath("/lms/student"), null);
});

test("login returns to the same tenant and rejects external or cross-tenant URLs", () => {
  assert.equal(paths.safeTenantReturnPath("/trungtamdientoan/chat?channel=1", "trungtamdientoan"), "/trungtamdientoan/chat?channel=1");
  assert.equal(paths.safeTenantReturnPath("/labs/42", "trungtamdientoan"), "/trungtamdientoan/labs/42");
  for (const value of ["https://evil.test/lms", "//evil.test/lms", "/\\evil.test/lms", "/other-org/lms", "/api/auth/signout", "/login", "/trungtamdientoan/../other-org/lms"]) {
    assert.equal(paths.safeTenantReturnPath(value, "trungtamdientoan"), "/trungtamdientoan/lms");
  }
});

test("middleware enforces membership before rewrites and preserves canonical role checks", async () => {
  let token = null;
  let member = true;
  let active = true;
  let backendStatus = 200;
  let fetchCalls = 0;
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    fetchCalls++;
    if (url.endsWith("/my")) {
      assert.equal(options.headers.Authorization, "Bearer test-access");
      return Response.json(member ? [{ slug: "trungtamdientoan" }] : [], { status: backendStatus });
    }
    return Response.json({ slug: "trungtamdientoan", is_active: active }, { status: backendStatus });
  };
  const { middleware } = load("src/middleware.ts", id => {
    if (id === "next-auth/jwt") return { getToken: async () => token };
    if (id === "@/lib/tenant/paths") return paths;
    return require(id);
  });
  const request = (pathname, headers) => new NextRequest(`https://bdc.test${pathname}`, { headers });
  try {
    const guest = await middleware(request("/trungtamdientoan/chat?channel=1"));
    assert.equal(guest.status, 307);
    const login = new URL(guest.headers.get("location"));
    assert.equal(login.pathname, "/trungtamdientoan/login");
    assert.equal(login.searchParams.get("callbackUrl"), "/trungtamdientoan/chat?channel=1");
    assert.equal(fetchCalls, 0);
    token = { accessToken: "test-access", role: "ROLE_USER" };
    for (const service of ["lms", "chat", "knowledge-farm", "labs"]) {
      const allowed = await middleware(request(`/trungtamdientoan/${service}`));
      assert.equal(allowed.headers.get("x-middleware-rewrite"), `https://bdc.test/${service}`);
      assert.equal(allowed.headers.get("x-middleware-request-x-bdc-tenant"), "trungtamdientoan");
    }
    const admin = await middleware(request("/trungtamdientoan/settings"));
    assert.equal(new URL(admin.headers.get("location")).pathname, "/trungtamdientoan/lms");
    member = false;
    assert.equal((await middleware(request("/trungtamdientoan/lms"))).status, 403);
    member = true;
    active = false;
    assert.equal((await middleware(request("/trungtamdientoan/chat"))).status, 404);
    active = true;
    backendStatus = 401;
    const expired = await middleware(request("/trungtamdientoan/labs"));
    assert.equal(new URL(expired.headers.get("location")).searchParams.get("reason"), "session-expired");
    backendStatus = 503;
    assert.equal((await middleware(request("/trungtamdientoan/labs"))).status, 503);
    const normal = await middleware(request("/lms", { "x-bdc-tenant": "spoofed" }));
    assert.equal(normal.headers.get("x-middleware-rewrite"), null);
    assert.equal(normal.headers.get("x-middleware-request-x-bdc-tenant"), null);
  } finally { global.fetch = originalFetch; }
});
