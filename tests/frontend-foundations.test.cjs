const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { sourceLoader } = require("./helpers/load-source.cjs");

const originalFetch = global.fetch,
  originalWindow = global.window;
afterEach(() => {
  global.fetch = originalFetch;
  global.window = originalWindow;
});
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};

test("all HTTP methods reject 401/403/500; failed deletes cannot run success updates", async () => {
  let expired = 0;
  const load = sourceLoader({
    "src/services/auth/authToken.ts": { getAccessToken: async () => "fixture" },
    "src/services/auth/unauthorized.ts": {
      handleUnauthorized: async () => {
        expired++;
      },
    },
  });
  const { ApiClient } = load("src/services/common/api.ts");
  const client = new ApiClient("/api");
  for (const status of [401, 403, 500]) {
    global.fetch = async () => new Response("failed", { status });
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      let success = false;
      await assert.rejects(
        client[method]("/item", {}).then(() => {
          success = true;
        }),
        (error) => error.status === status && error.endpoint === "/item",
      );
      assert.equal(success, false);
    }
  }
  assert.equal(expired, 5);
  global.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await client.delete("/item"), undefined);
});

test("invalid success bodies reject, JSON parses, multipart headers and abort signals are preserved", async () => {
  const load = sourceLoader({
    "src/services/auth/authToken.ts": { getAccessToken: async () => "fixture" },
    "src/services/auth/unauthorized.ts": { handleUnauthorized: async () => {} },
  });
  const { ApiClient } = load("src/services/common/api.ts");
  const client = new ApiClient("/api");
  for (const body of ["<html>gateway</html>", "broken", ""]) {
    global.fetch = async () => new Response(body, { status: 200 });
    await assert.rejects(
      client.get("/json"),
      (error) => error.code === "INVALID_RESPONSE",
    );
  }
  const form = new FormData();
  form.append("file", new Blob(["fixture"]), "test.txt");
  const controller = new AbortController();
  global.fetch = async (_url, init) => {
    assert.equal(init.signal, controller.signal);
    assert.equal(init.body, form);
    assert.equal(init.headers.has("Content-Type"), false);
    assert.equal(init.headers.get("Authorization"), "Bearer fixture");
    return Response.json({ ok: true });
  };
  assert.deepEqual(
    await client.uploadFile("/upload", form, { signal: controller.signal }),
    { ok: true },
  );
  controller.abort();
  await assert.rejects(client.get("/json", { signal: controller.signal }), {
    name: "AbortError",
  });
});

test("session cache dedupes concurrent reads and rejects results belonging to a cleared generation", async () => {
  global.window = {};
  const old = deferred(),
    current = deferred();
  let reads = 0;
  const load = sourceLoader({
    "next-auth/react": {
      getSession: () => (++reads === 1 ? old.promise : current.promise),
    },
  });
  const auth = load("src/services/auth/authToken.ts");
  const a = auth.getAccessToken(),
    b = auth.getAccessToken();
  assert.equal(a, b);
  await new Promise(setImmediate);
  assert.equal(reads, 1);
  auth.clearAccessTokenCache();
  const c = auth.getAccessToken();
  await new Promise(setImmediate);
  old.resolve({ accessToken: "obsolete" });
  assert.equal(await a, null);
  current.resolve({ accessToken: "current" });
  assert.equal(await c, "current");
  assert.equal(await auth.getAccessToken(), "current");
  assert.equal(reads, 2);
});

test("content requests dedupe only while pending; updates/deletes and session changes invalidate reads", async () => {
  let invalidate,
    reads = 0,
    title = "old",
    deleted = false,
    hold;
  const load = sourceLoader({
    "src/services/auth/authToken.ts": {
      subscribeAuthInvalidation: (fn) => {
        invalidate = fn;
      },
    },
    "src/services/lms/lmsApiClient.ts": {
      lmsApiClient: {
        get: async () => {
          reads++;
          if (hold) return hold.promise;
          if (deleted) throw new Error("404");
          return { data: { data: { id: 1, title } } };
        },
        put: async (_url, data) => {
          title = data.title;
          return { data: {} };
        },
        delete: async () => {
          deleted = true;
          return { data: {} };
        },
      },
    },
  });
  const { lmsService } = load("src/services/lms/lmsService.ts");
  hold = deferred();
  const a = lmsService.getContent(1),
    b = lmsService.getContent(1);
  assert.equal(a, b);
  assert.equal(reads, 1);
  hold.resolve({ data: { data: { id: 1, title } } });
  await a;
  hold = null;
  await lmsService.updateContent(1, { title: "new" });
  assert.equal((await lmsService.getContent(1)).data.title, "new");
  await lmsService.deleteContent(1);
  await assert.rejects(lmsService.getContent(1), /404/);
  deleted = false;
  hold = deferred();
  const previous = lmsService.getContent(1);
  invalidate();
  hold.resolve({ data: { data: { id: 1, title: "obsolete" } } });
  await assert.rejects(previous, { name: "AbortError" });
  hold = null;
  assert.equal((await lmsService.getContent(1)).data.title, "new");
});

test("query filter resets page atomically; persisted profiles reject malformed input and strip unexpected fields", () => {
  const load = sourceLoader();
  const { bankQueryReducer, initialBankQuery } = load(
    "src/utils/lms/questionBankQuery.ts",
  );
  assert.deepEqual(
    bankQueryReducer(
      { ...initialBankQuery, page: 5 },
      { type: "filter", filters: { difficulty: "HARD" } },
    ),
    { ...initialBankQuery, difficulty: "HARD", page: 1 },
  );
  const { parseStoredUser } = load("src/utils/auth/userProfileStorage.ts");
  for (const value of ["invalid", "null", "{}", '{"id":1,"name":2}'])
    assert.equal(parseStoredUser(value), null);
  assert.deepEqual(
    parseStoredUser(
      JSON.stringify({
        id: 1,
        name: "Fixture",
        email: "fixture@example.com",
        role: "ROLE_USER",
        token: "must-not-persist",
        roles: [3, "MEMBER"],
      }),
    ),
    {
      id: 1,
      name: "Fixture",
      email: "fixture@example.com",
      role: "ROLE_USER",
      roles: ["MEMBER"],
    },
  );
});

test("shared upload service validates the server envelope without changing multipart fields", async () => {
  let received, result;
  const load = sourceLoader({
    "src/services/common/api.ts": {
      ApiClient: class {
        async uploadFile(endpoint, form) {
          received = { endpoint, form };
          return result;
        }
      },
    },
  });
  const { fileService } = load("src/services/lms/fileService.ts");
  const file = new File(["fixture"], "fixture.txt");
  result = {
    data: {
      file_id: "1",
      file_name: file.name,
      file_url: "/files/1",
      file_path: "/files/1",
      file_type: "text/plain",
      file_size: file.size,
    },
  };
  assert.deepEqual(await fileService.upload(file, "document"), result.data);
  assert.equal(received.form.get("type"), "document");
  assert.equal(received.form.get("file").name, file.name);
  result = { data: { file_path: "/files/1" } };
  await assert.rejects(
    fileService.upload(file, "document"),
    (error) => error.code === "INVALID_RESPONSE",
  );
});
