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
function handler(session, fetcher, aiEnabled = "true") {
  const loadedModule = { exports: {} };
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
    loadedModule,
    loadedModule.exports,
    fetcher,
    {
      env: {
        NEXTAUTH_URL: base,
        WORKSPACE_SERVICE_URL: "http://workspace-test:8088",
        AI_SERVICE_URL: "http://ai-test:8000",
        WORKSPACE_AI_ENABLED: aiEnabled,
      },
    },
  );
  return loadedModule.exports;
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
test("library BFF forwards filters under the signed-in identity and rejects undeclared library routes", async () => {
  let sent;
  const api = handler(user, async (url, options) => {
    sent = { url, options };
    return new Response(
      JSON.stringify({ items: [], total: 0, next_offset: null }),
    );
  });
  const response = await api.GET(
    request("GET", "library?tab=all&q=notes"),
    context("library"),
  );
  assert.equal(response.status, 200);
  assert.ok(sent.url.endsWith("/library?tab=all&q=notes"));
  assert.equal(
    sent.options.headers.Authorization,
    "Bearer server-session-token",
  );
  assert.equal(
    (
      await api.GET(
        request("GET", "library/options"),
        context("library/options"),
      )
    ).status,
    200,
  );
  assert.equal(
    (await api.GET(request("GET", "library/admin"), context("library/admin")))
      .status,
    404,
  );
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
  const ai = JSON.parse(seen.at(-1).options.body);
  assert.equal(ai.user_id, 901);
  assert.equal(ai.chat_mode, "flash");
  assert.match(ai.message, /Server-owned text/);
});
test("disabled Workspace AI never contacts either upstream", async () => {
  const api = handler(
    user,
    async () => {
      throw Error("Unexpected upstream call");
    },
    "false",
  );
  const route = `pages/${id}/ai`;
  assert.equal(
    (
      await api.POST(
        request("POST", route, { prompt: "Explain" }),
        context(route),
      )
    ).status,
    404,
  );
});
test("enabled Workspace AI respects the 5000-character API contract without fetching binary document state", async () => {
  const calls = [];
  const api = handler(user, async (url, options) => {
    calls.push({ url, options });
    return url.endsWith("/chat")
      ? new Response("data: {}\n\n")
      : new Response(
          JSON.stringify({
            title: "Long page",
            sources: [],
            search_text: "x".repeat(30000),
          }),
        );
  });
  const route = `pages/${id}/ai`;
  assert.equal(
    (
      await api.POST(
        request("POST", route, { prompt: "Explain" }),
        context(route),
      )
    ).status,
    200,
  );
  assert.equal(calls.length, 2);
  assert(JSON.parse(calls[1].options.body).message.length <= 5000);
});
test("notebook copy forwards an explicit destination with only the current user's source content", async () => {
  let saved;
  const api = handler(user, async (url, options) => {
    if (url.includes("/notebook?"))
      return new Response(
        JSON.stringify({
          notes: [
            {
              id: "own",
              title: "Original",
              content: "Verified personal content",
            },
          ],
        }),
      );
    saved = JSON.parse(options.body);
    return new Response(JSON.stringify({ id }), { status: 201 });
  });
  const response = await api.POST(
    request("POST", "legacy-notes", {
      note_id: "own",
      space_id: id,
      title: "Forged",
      content: "Forged",
    }),
    context("legacy-notes"),
  );
  assert.equal(response.status, 201);
  assert.equal(saved.space_id, id);
  assert.equal(saved.content, "Verified personal content");
  assert.equal(saved.title, "Original");
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
