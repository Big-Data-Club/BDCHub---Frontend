const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript");
const { NextRequest, NextResponse } = require("next/server");
const filename = path.resolve(
    __dirname,
    "../../src/app/api/workspace/[[...path]]/route.ts",
  ),
  code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const base = "http://localhost:3100",
  id = "11111111-1111-4111-8111-111111111111";
const user = {
  user: { id: 901, role: "ROLE_MEMBER", name: "Alice" },
  accessToken: "server-session-token",
};
function handler(session, fetcher) {
  const module = { exports: {} };
  const load = (name) => {
    if (name === "next-auth") return { getServerSession: async () => session };
    if (name === "next/server") return { NextResponse };
    if (name.includes("authOptions")) return { authOptions: {} };
    if (name.includes("linkedTasks.server"))
      return { readableTasks: async () => [] };
    throw Error(name);
  };
  new Function("require", "module", "exports", "fetch", "process", code)(
    load,
    module,
    module.exports,
    fetcher,
    {
      env: {
        NEXTAUTH_URL: base,
        WORKSPACE_SERVICE_URL: "http://workspace-test:8088",
        AI_SERVICE_URL: "http://ai-test:8000",
      },
    },
  );
  return module.exports;
}
function request(method, route, body, origin = base) {
  return new NextRequest(`${base}/api/workspace/${route}`, {
    method,
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const context = (route) => ({
  params: Promise.resolve({ path: route.split("/") }),
});
test("Workspace BFF requires a valid session and rejects cross-site writes and unknown routes", async () => {
  const noFetch = () => {
    throw Error("must not fetch");
  };
  for (const session of [
    null,
    {},
    { ...user, error: "RefreshAccessTokenError" },
  ])
    assert.equal(
      (
        await handler(session, noFetch).GET(
          request("GET", "bootstrap"),
          context("bootstrap"),
        )
      ).status,
      401,
    );
  const api = handler(user, noFetch);
  assert.equal(
    (
      await api.POST(
        request("POST", "spaces", {}, "https://foreign.test"),
        context("spaces"),
      )
    ).status,
    403,
  );
  assert.equal(
    (await api.GET(request("GET", "admin"), context("admin"))).status,
    404,
  );
});
test("BFF uses its signed-in identity, bounds bodies, and preserves upstream validation", async () => {
  let sent;
  const api = handler(user, async (url, options) => {
    sent = { url, options };
    return new Response(JSON.stringify({ error: "Conflict" }), { status: 409 });
  });
  const response = await api.PATCH(
    request("PATCH", `pages/${id}`, { version: 1, title: "My page" }),
    context(`pages/${id}`),
  );
  assert.equal(response.status, 409);
  assert.equal(
    sent.options.headers.Authorization,
    "Bearer server-session-token",
  );
  assert.equal(sent.options.redirect, "error");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(
    (
      await api.POST(
        request("POST", "spaces", { title: "x".repeat(2100000) }),
        context("spaces"),
      )
    ).status,
    413,
  );
});
test("AI never receives the document when page access is denied", async () => {
  let calls = 0;
  const api = handler(user, async () => {
    calls++;
    return new Response("{}", { status: 404 });
  });
  assert.equal(
    (
      await api.POST(
        request("POST", `pages/${id}/ai`, { prompt: "Explain" }),
        context(`pages/${id}/ai`),
      )
    ).status,
    404,
  );
  assert.equal(calls, 1);
});
test("AI receives only checked page context and uses the existing tool-free flash mode", async () => {
  const seen = [];
  const api = handler(user, async (url, options) => {
    seen.push({ url, options });
    if (url.endsWith("/ai/agents/chat"))
      return new Response(
        'data: {"type":"text_delta","data":{"delta":"OK"}}\n\n',
      );
    if (url.endsWith("/document")) return new Response("{}");
    return new Response(
      JSON.stringify({
        title: "Authorized",
        search_text: "Server-owned text",
        sources: [],
      }),
    );
  });
  const route = `pages/${id}/ai`,
    response = await api.POST(
      request("POST", route, { prompt: "Explain", user_id: 903 }),
      context(route),
    );
  assert.equal(response.status, 200);
  const ai = JSON.parse(seen[2].options.body);
  assert.equal(ai.user_id, 901);
  assert.equal(ai.chat_mode, "flash");
  assert.match(ai.message, /Server-owned text/);
});
test("legacy notebook conversion accepts only an entry fetched for the current session user", async () => {
  const seen = [];
  const api = handler(user, async (url, options) => {
    seen.push({ url, options });
    return new Response(
      JSON.stringify({
        notes: [{ id: "own", title: "My note", content: "Private" }],
      }),
    );
  });
  assert.equal(
    (
      await api.POST(
        request("POST", "legacy-notes", {
          note_id: "foreign",
          content: "Injected",
        }),
        context("legacy-notes"),
      )
    ).status,
    404,
  );
  assert.match(seen[0].url, /user_id=901$/);
  assert.equal(seen.length, 1);
});

test("file proxy preserves encoded Unicode filenames without putting Unicode into HTTP headers", async () => {
  let sent;
  const api = handler(user, async (url, options) => {
    sent = { url, options };
    return new Response("{}", { status: 201 });
  });
  const route = `pages/${id}/files`,
    filename = encodeURIComponent("ảnh nghiên cứu.png");
  const req = new NextRequest(`${base}/api/workspace/${route}`, {
    method: "POST",
    headers: {
      Origin: base,
      "Content-Type": "application/octet-stream",
      "X-File-Name": filename,
    },
    body: Buffer.from("image"),
  });
  assert.equal((await api.POST(req, context(route))).status, 201);
  assert.equal(sent.options.headers["X-File-Name"], filename);
});
