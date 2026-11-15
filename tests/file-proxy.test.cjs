const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");
const { sourceLoader } = require("./helpers/load-source.cjs");

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

function handler(session, onSession = () => {}) {
  return sourceLoader({
    "next-auth": { getServerSession: async () => { onSession(); return session; } },
    "@/app/api/auth/[...nextauth]/authOptions": { authOptions: {} },
  })("src/app/api/files/[...filepath]/route.ts");
}
const params = { params: Promise.resolve({ filepath: ["courses", "bài học.pdf"] }) };

test("PDF iframe resolves the session and preserves byte ranges and private caching", async () => {
  let upstream;
  global.fetch = async (url, options) => {
    upstream = { url, ...options };
    return new Response("pdf", { status: 206, headers: {
      "content-type": "application/pdf", "content-range": "bytes 0-2/10",
      "accept-ranges": "bytes", "cache-control": "public, max-age=31536000",
    } });
  };
  const response = await handler({ accessToken: "test-user-token" }).GET(new Request(
    "http://localhost/files/courses/lesson.pdf",
    { headers: { cookie: "bdc.session-token.v2=synthetic", range: "bytes=0-2", "if-range": '"version1"' } },
  ), params);
  assert.equal(upstream.headers.get("authorization"), "Bearer test-user-token");
  assert.equal(upstream.headers.get("cookie"), null);
  assert.equal(upstream.headers.get("range"), "bytes=0-2");
  assert.equal(upstream.headers.get("if-range"), '"version1"');
  assert.ok(upstream.url.endsWith("/api/v1/files/serve/courses/b%C3%A0i%20h%E1%BB%8Dc.pdf"));
  assert.equal(upstream.cache, "no-store");
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), "bytes 0-2/10");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("vary"), "Cookie, Authorization");
  assert.equal(await response.text(), "pdf");
});

test("explicit Bearer clients preserve HEAD without resolving a session", async () => {
  global.fetch = async (_url, options) => {
    assert.equal(options.method, "HEAD");
    assert.equal(options.headers.get("authorization"), "Bearer explicit-test-token");
    return new Response(null, { headers: { "content-length": "100" } });
  };
  const response = await handler(null, () => assert.fail("must use explicit authorization")).HEAD(
    new Request("http://localhost/api/files/lesson.pdf", { method: "HEAD", headers: { authorization: "Bearer explicit-test-token" } }), params,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-length"), "100");
  assert.equal(response.body, null);
});

test("anonymous and failed-refresh sessions leave file authorization to LMS", async () => {
  for (const session of [null, { accessToken: "stale-test-token", error: "RefreshAccessTokenError" }]) {
    global.fetch = async (_url, options) => {
      assert.equal(options.headers.has("authorization"), false);
      return new Response("not found", { status: 404 });
    };
    const response = await handler(session).GET(new Request("http://localhost/files/private.pdf"), params);
    assert.equal(response.status, 404);
  }
});

test("public files and conditional 304 responses remain supported", async () => {
  global.fetch = async (_url, options) => {
    assert.equal(options.headers.get("authorization"), null);
    assert.equal(options.headers.get("if-none-match"), '"test-etag"');
    return new Response(null, { status: 304, headers: { etag: '"test-etag"' } });
  };
  const response = await handler(null).GET(new Request("http://localhost/files/public.png", {
    headers: { "if-none-match": '"test-etag"' },
  }), params);
  assert.equal(response.status, 304);
  assert.equal(response.body, null);
  assert.equal(response.headers.get("etag"), '"test-etag"');
});

test("rejects traversal before contacting LMS", async () => {
  global.fetch = async () => assert.fail("invalid path must not reach LMS");
  const response = await handler(null).GET(new Request("http://localhost/files/test"), {
    params: Promise.resolve({ filepath: ["..", "private.pdf"] }),
  });
  assert.equal(response.status, 400);
});

test("production rewrites keep file requests in the session-aware BFF", async () => {
  const originalEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    const config = sourceLoader()("next.config.ts").default;
    const rewrites = await config.rewrites();
    assert.equal(rewrites.find((rule) => rule.source === "/files/:path*").destination, "/api/files/:path*");
    const headers = await config.headers();
    const fileHeaders = headers.find((rule) => rule.source === "/files/:path*").headers;
    assert.equal(fileHeaders.find((header) => header.key === "Cache-Control").value, "private, no-store");
  } finally {
    if (originalEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnv;
  }
});
