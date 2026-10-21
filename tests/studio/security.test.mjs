import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const next = { NextResponse: { json: (data, init) => new Response(JSON.stringify(data), init) } };
function load(path, mocks = {}, options = {}) {
  const source = readFileSync(new URL(`../../src/${path}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: name => name in mocks ? mocks[name] : nodeRequire(name),
    Buffer, URL, Headers, Response, AbortSignal, console, process: { env: { AI_SERVICE_SECRET: "internal-test-secret", NEXT_PUBLIC_YOUTUBE_UPLOAD_ENABLED: "true", ...options.env } }, fetch: options.fetch });
  return exports;
}
function request(body = {}, headers = {}, url = "https://learn.example/api/test") {
  return { headers: new Headers(headers), json: async () => body, method: "POST", nextUrl: new URL(url) };
}
function bridge(manager, google = {}) {
  return load("app/api/internal/studio-youtube/route.ts", { "next/server": next, googleapis: { google },
    "@/services/lms/youtubeTokenManager": { __esModule: true, default: manager } });
}

test("worker bridge rejects a missing secret before touching the shared connection", async () => {
  const api = bridge({ hasValidTokens: () => { throw new Error("must not access credentials"); } });
  assert.equal((await api.POST(request({ action: "token" }))).status, 401);
});

test("shared channel discovery never returns tokens", async () => {
  const api = bridge({ hasValidTokens: async () => true, getStatus: async () => ({ channel_id: "shared", channel_name: "BDC", access_token: "never-return" }) });
  const response = await api.POST(request({ action: "status" }, { "X-AI-Secret": "internal-test-secret" }));
  const result = await response.json();
  assert.equal(result.channel_id, "shared");
  assert.equal(result.destination, "shared_system_channel");
  assert.equal(result.access_token, undefined);
});

test("channel changed since consent blocks upload credentials", async () => {
  const api = bridge({ hasValidTokens: async () => true, getStatus: async () => ({ channel_id: "new" }),
    getAuthenticatedClient: async () => ({ getAccessToken: () => { throw new Error("must not mint upload token"); } }) }, { youtube: () => ({}) });
  const response = await api.POST(request({ action: "token", channel_id: "old" }, { "X-AI-Secret": "internal-test-secret" }));
  assert.equal(response.status, 409);
});

test("live OAuth principal must match the shared channel", async () => {
  const api = bridge({ hasValidTokens: async () => true, getStatus: async () => ({ channel_id: "shared" }),
    getAuthenticatedClient: async () => ({ getAccessToken: () => { throw new Error("must not mint token"); } }) },
  { youtube: () => ({ channels: { list: async () => ({ data: { items: [{ id: "wrong-channel" }] } }) } }) });
  const response = await api.POST(request({ action: "token", channel_id: "shared" }, { "X-AI-Secret": "internal-test-secret" }));
  assert.equal(response.status, 409);
});

test("browser Studio proxy cannot retrieve encrypted channel credentials", async () => {
  const api = load("app/api/ai/studio/[...path]/route.ts", { "next/server": next,
    "next-auth": { getServerSession: async () => ({ user: { id: 10 } }) },
    "@/app/api/auth/[...nextauth]/authOptions": { authOptions: {} }, "@/lib/request-origin": { isSameOriginRequest: () => true } },
  { fetch: () => { throw new Error("must not proxy secret connection route"); } });
  const response = await api.GET(request(), { params: Promise.resolve({ path: ["youtube", "connection"] }) });
  assert.equal(response.status, 404);
});

test("OAuth administration requires an admin session", async () => {
  const origins = load("lib/request-origin.ts");
  const api = load("lib/youtube-auth.ts", { "next/server": next, "next-auth": { getServerSession: async () => ({ user: { id: 10, role: "TEACHER" } }) },
    "@/app/api/auth/[...nextauth]/authOptions": { authOptions: {} }, "@/lib/request-origin": origins });
  assert.equal((await api.requireYoutubeRole(request())).status, 403);
  assert.equal(await api.requireYoutubeRole(request(), ["ADMIN", "TEACHER"]), null);
});

test("public reverse-proxy origin works while foreign-origin writes are rejected", () => {
  const { isSameOriginRequest } = load("lib/request-origin.ts");
  assert.equal(isSameOriginRequest(request({}, { origin: "https://learn.example", "x-forwarded-host": "learn.example" }, "http://frontend:3001/api/test")), true);
  assert.equal(isSameOriginRequest(request({}, { origin: "https://attacker.example" })), false);
});

test("refresh persists the original refresh token when Google omits it", async () => {
  const saved = [];
  const old = { tokens: { access_token: "old-access", refresh_token: "keep-refresh", expiry_date: 1 }, channel_id: "shared", channel_name: "BDC" };
  const client = { setCredentials() {}, refreshAccessToken: async () => ({ credentials: { access_token: "new-access", expiry_date: Date.now() + 3600000 } }) };
  const google = { auth: { OAuth2: function () { return client; } } };
  const manager = load("services/lms/youtubeTokenManager.ts", { googleapis: { google } }, { fetch: async (_url, init) => {
    if (init.method === "PUT") { saved.push(JSON.parse(init.body)); return new Response("{}"); }
    return new Response(JSON.stringify(old));
  } }).default;
  await manager.getAuthenticatedClient();
  assert.equal(saved[0].tokens.refresh_token, "keep-refresh");
  assert.equal(saved[0].tokens.access_token, "new-access");
});
