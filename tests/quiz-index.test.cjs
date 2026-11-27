const { test } = require("node:test");
const assert = require("node:assert/strict");
const { hookHarness } = require("./helpers/hook-harness.cjs");

function harness(api) {
  return hookHarness(
    "src/hooks/lms/teacher/useQuizIndex.ts",
    "useQuizIndex",
    [42],
    {
      "@/services/lms/quizService": { __esModule: true, default: api },
    },
  );
}
const ready = { status: "ready", total: 1, processed: 1, items: [] };

test("quiz index polls only active jobs and aborts requests on unmount", async (t) => {
  const previous = global.setTimeout,
    oldClear = global.clearTimeout;
  let poll,
    scheduled = 0,
    cleared = false,
    signal,
    calls = 0;
  global.setTimeout = (callback) => {
    poll = callback;
    scheduled++;
    return 123;
  };
  global.clearTimeout = () => {
    cleared = true;
  };
  t.after(() => {
    global.setTimeout = previous;
    global.clearTimeout = oldClear;
  });
  const h = harness({
    getQuizIndex: async (_id, _offset, s) => {
      signal = s;
      return ++calls === 1 ? { ...ready, status: "processing" } : ready;
    },
  });
  await h.flush();
  assert.equal(scheduled, 1);
  assert.equal(h.value.index.status, "processing");
  await poll();
  await h.flush();
  assert.equal(h.value.index.status, "ready");
  assert.equal(scheduled, 1);
  h.unmount();
  assert.equal(signal.aborted, true);
  assert.equal(cleared, true);
});

test("duplicate index submissions are coalesced and late results do not update unmounted state", async () => {
  let complete,
    count = 0;
  const h = harness({
    getQuizIndex: async () => ready,
    queueQuizIndex: () => {
      count++;
      return new Promise((resolve) => {
        complete = resolve;
      });
    },
  });
  await h.flush();
  const first = h.value.queue();
  await h.value.queue();
  assert.equal(count, 1);
  h.unmount();
  complete({ status: "pending" });
  await first;
});

test("a successful node link stays successful if rebuilding the index fails", async () => {
  let links = 0;
  const h = harness({
    getQuizIndex: async () => ready,
    linkQuizNode: async () => {
      links++;
    },
    queueQuizIndex: async () => {
      throw Error("queue down");
    },
  });
  await h.flush();
  assert.equal(
    await h.value.link({
      question_id: 1,
      node_id: 2,
      source_hash: "a".repeat(32),
    }),
    true,
  );
  await h.flush();
  assert.equal(links, 1);
  assert.match(h.value.error, /Đã gắn node/);
  h.unmount();
});
