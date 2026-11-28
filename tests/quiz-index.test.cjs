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

test("approvals preserve the current page and rows while index rebuilds, and allow the next approval", async (t) => {
  const previous = global.setTimeout,
    oldClear = global.clearTimeout;
  let poll,
    status = "ready",
    queues = 0;
  global.setTimeout = (callback) => {
    poll = callback;
    return 1;
  };
  global.clearTimeout = () => {};
  t.after(() => {
    global.setTimeout = previous;
    global.clearTimeout = oldClear;
  });
  const items = [101, 102].map((question_id) => ({
    question_id,
    source_hash: "a".repeat(32),
    node_id: null,
    node_name: null,
    suggested_node_id: question_id + 1000,
  }));
  const h = harness({
    getQuizIndex: async () => ({
      ...ready,
      status,
      total: 202,
      items: status === "ready" ? items : [],
    }),
    linkQuizNode: async (_quiz, body) => ({
      node_id: body.node_id,
      name: `Concept ${body.node_id}`,
    }),
    queueQuizIndex: async () => {
      queues++;
      status = "processing";
      return { status };
    },
  });
  t.after(() => h.unmount());
  await h.flush();
  h.value.setOffset(100);
  await h.flush();
  await h.flush();
  assert.equal(h.value.offset, 100);
  assert.equal(
    await h.value.link({
      question_id: 101,
      source_hash: items[0].source_hash,
      node_id: 1101,
    }),
    true,
  );
  await h.flush();
  await h.flush();
  assert.equal(h.value.index.status, "processing");
  assert.equal(h.value.offset, 100);
  assert.equal(h.value.index.items.length, 2);
  assert.equal(h.value.index.items[0].node_id, 1101);
  assert.equal(
    await h.value.link({
      question_id: 102,
      source_hash: items[1].source_hash,
      node_id: 1102,
    }),
    true,
  );
  await h.flush();
  await h.flush();
  assert.deepEqual(
    h.value.index.items.map((item) => item.node_id),
    [1101, 1102],
  );
  status = "failed"; // The build observed another approval changing its source revision.
  await poll();
  await h.flush();
  assert.equal(queues, 3);
  assert.equal(h.value.index.status, "pending");
  status = "ready";
  await poll();
  await h.flush();
  assert.equal(h.value.offset, 100);
  assert.deepEqual(
    h.value.index.items.map((item) => item.node_id),
    [1101, 1102],
  );
});

test("a rejected approval leaves the review row unchanged", async () => {
  const item = { question_id: 1, source_hash: "a".repeat(32), node_id: null };
  let queues = 0;
  const h = harness({
    getQuizIndex: async () => ({ ...ready, items: [item] }),
    linkQuizNode: async () => {
      throw Error("source changed");
    },
    queueQuizIndex: async () => {
      queues++;
    },
  });
  await h.flush();
  assert.equal(
    await h.value.link({
      question_id: 1,
      source_hash: item.source_hash,
      node_id: 2,
    }),
    undefined,
  );
  await h.flush();
  assert.equal(h.value.index.items[0].node_id, null);
  assert.equal(queues, 0);
  assert.match(h.value.error, /Không thực hiện được/);
  h.unmount();
});

test("fresh canonical question data replaces the temporary approval overlay", async () => {
  let result = {
    ...ready,
    items: [{ question_id: 1, source_hash: "a".repeat(32), node_id: null }],
  };
  const h = harness({
    getQuizIndex: async () => result,
    linkQuizNode: async () => ({ node_id: 2, name: "Approved" }),
    queueQuizIndex: async () => ({}),
  });
  await h.flush();
  await h.value.link({
    question_id: 1,
    source_hash: "a".repeat(32),
    node_id: 2,
  });
  await h.flush();
  assert.equal(h.value.index.items[0].node_id, 2);
  result = {
    ...ready,
    items: [
      {
        question_id: 1,
        source_hash: "b".repeat(32),
        node_id: 3,
        node_name: "Canonical",
      },
    ],
  };
  h.value.reload();
  await h.flush();
  await h.flush();
  assert.equal(h.value.index.items[0].node_id, 3);
  h.unmount();
});

test("the review panel stays rendered during rebuilding and existing proposals remain actionable", () => {
  const item = {
    question_id: 1,
    source_hash: "a".repeat(32),
    node_id: null,
    suggested_node_id: 2,
  };
  const state = {
    index: { ...ready, items: [item] },
    busy: false,
    error: "",
    matches: null,
    offset: 0,
    setOffset() {},
    queue() {},
    reload() {},
    search() {},
    link() {},
    suggest() {},
  };
  const h = hookHarness(
    "src/components/lms/teacher/quiz/QuizKnowledgePanel.tsx",
    "QuizKnowledgePanel",
    [{ quizId: 42, nodes: [], onLinked() {} }],
    {
      "@/hooks/lms/teacher/useQuizIndex": { useQuizIndex: () => state },
      "./QuizNodeStatistics": { QuizNodeStatisticsTable: () => null },
      "@/components/markdown/MarkdownRenderer": {
        __esModule: true,
        default: () => null,
      },
    },
  );
  function nodes(tree) {
    return tree && typeof tree === "object"
      ? [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)]
      : [];
  }
  assert.ok(nodes(h.value).find((n) => n.type === "details"));
  state.index = { ...state.index, status: "processing" };
  h.render();
  assert.ok(nodes(h.value).find((n) => n.type === "details"));
  const approve = nodes(h.value).find(
    (n) => n.type === "button" && n.props.children === "Duyệt liên kết",
  );
  assert.equal(approve.props.disabled, false);
  assert.equal(approve.props.type, "button");
  const propose = nodes(h.value).find(
    (n) => n.type === "button" && n.props.children === "Đề xuất node mới",
  );
  assert.equal(propose.props.disabled, true);
  h.unmount();
});
