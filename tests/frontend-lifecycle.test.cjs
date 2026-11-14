const { test, mock, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { hookHarness } = require("./helpers/hook-harness.cjs");
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
const originalWindow = global.window;
const originalLocalStorage = global.localStorage,
  originalSessionStorage = global.sessionStorage;
afterEach(() => {
  mock.timers.reset();
  global.window = originalWindow;
  global.localStorage = originalLocalStorage;
  global.sessionStorage = originalSessionStorage;
});

test("question bank ignores late responses, debounces input and resets pagination in the filter transition", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const requests = [];
  const api = {
    getBankStats: async () => ({ data: {} }),
    getQuestionBank: (_id, query, signal) => {
      const pending = deferred();
      requests.push({ ...pending, query, signal });
      return pending.promise;
    },
  };
  const h = hookHarness(
    "src/hooks/lms/teacher/useQuestionBank.ts",
    "useQuestionBank",
    [7],
    { "src/services/lms/quizService.ts": { __esModule: true, default: api } },
  );
  assert.equal(requests.length, 1);
  h.value.setQ("old");
  h.render();
  mock.timers.tick(300);
  h.render();
  h.value.setQ("new");
  h.render();
  assert.equal(
    requests.length,
    2,
    "typing does not immediately start another request",
  );
  mock.timers.tick(300);
  h.render();
  requests[2].resolve({
    data: { items: [{ id: 2 }], total: 1, total_pages: 1 },
  });
  await h.flush();
  requests[1].resolve({
    data: { items: [{ id: 1 }], total: 1, total_pages: 1 },
  });
  await h.flush();
  requests[0].reject(new Error("obsolete failure"));
  await h.flush();
  assert.deepEqual(h.value.items, [{ id: 2 }]);
  assert.equal(h.value.error, "");
  assert.equal(h.value.loading, false);
  h.value.setPage(5);
  h.render();
  h.value.setPage((page) => page + 1);
  h.value.setPage((page) => page + 1);
  h.render();
  assert.equal(h.value.page, 7, "batched page updates use the latest state");
  h.value.setDifficulty("HARD");
  h.render();
  assert.equal(requests.at(-1).query.page, 1);
  assert.equal(requests.at(-1).query.difficulty, "HARD");
  assert.equal(
    requests.filter((r) => r.query.page === 5 && r.query.difficulty === "HARD")
      .length,
    0,
  );
  h.unmount();
  assert.equal(requests.at(-1).signal.aborted, true);
  requests.at(-1).resolve({ data: { items: [], total: 0, total_pages: 1 } });
  await new Promise(setImmediate);
});

test("content editor loads only requested sections and keeps state updaters free of I/O under repeated updates", async () => {
  const requests = [];
  const service = {
    listContent: (id, signal) => {
      const pending = deferred();
      requests.push({ ...pending, id, signal });
      return pending.promise;
    },
  };
  const Card = () => null,
    Header = () => null;
  const h = hookHarness(
    "src/components/lms/teacher/views/ContentTab.tsx",
    "ContentTab",
    [
      {
        courseId: 1,
        sections: [{ id: 10 }, { id: 20 }],
        onSectionsChange() {},
        onSectionsRefetch() {},
      },
    ],
    {
      "src/services/lms/lmsService.ts": { __esModule: true, default: service },
      "src/hooks/lms/teacher/useAIIndexPoller.tsx": {
        AIIndexPollerProvider: () => null,
      },
      "@/components/lms/shared": {},
      "src/components/lms/teacher/views/ContentTabHeader.tsx": {
        ContentTabHeader: Header,
      },
      "src/components/lms/teacher/views/SectionItemCard.tsx": {
        SectionItemCard: Card,
      },
      "src/components/lms/teacher/views/ContentTabModals.tsx": {
        ContentTabModals: () => null,
      },
    },
    true,
  );
  function nodes(type) {
    const found = [];
    const visit = (element) => {
      if (Array.isArray(element)) return element.forEach(visit);
      if (React.isValidElement(element)) {
        if (element.type === type) found.push(element);
        visit(element.props.children);
      }
    };
    visit(h.value);
    return found;
  }
  assert.equal(requests.length, 0);
  nodes(Card)[0].props.onToggleExpand();
  h.render();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].id, 10);
  nodes(Card)[0].props.onToggleExpand();
  h.render();
  nodes(Card)[0].props.onToggleExpand();
  h.render();
  assert.equal(requests.length, 1, "pending section request is deduped");
  requests[0].resolve({ data: [] });
  await h.flush();
  assert.equal(nodes(Card)[0].props.isLoadingContents, false);
  nodes(Header)[0].props.onExpandAll();
  h.render();
  assert.equal(requests.length, 2);
  assert.equal(requests[1].id, 20);
  h.unmount();
  requests[1].resolve({ data: [] });
  await new Promise(setImmediate);
});

test("a stored LMS role is read only after the initial render and tolerates blocked storage", () => {
  const { sourceLoader } = require("./helpers/load-source.cjs");
  let role = null;
  let reads = 0;
  let effect;
  const load = sourceLoader({
    react: {
      useState: () => [
        role,
        (next) => {
          role = next;
        },
      ],
      useEffect: (callback) => {
        effect = callback;
      },
    },
    "src/lib/tenant/navigation.ts": { usePathname: () => "/labs/manage/9" },
    "src/lib/lms-navigation.ts": {
      getSelectedLmsRole: () => {
        reads++;
        if (reads > 1) throw new Error("storage blocked");
        return "TEACHER";
      },
    },
  });
  const { useSelectedLmsRole } = load("src/hooks/lms/useSelectedLmsRole.ts");
  assert.equal(useSelectedLmsRole(), null);
  assert.equal(reads, 0);
  effect();
  assert.equal(role, "TEACHER");
  effect();
  assert.equal(role, null);
});

test("a profile response after logout is ignored and a transient failure can retry on focus", async () => {
  global.window = new EventTarget();
  let user = null;
  const state = {
    data: {
      user: {
        id: 1,
        name: "Fixture",
        email: "one@example.com",
        role: "ROLE_USER",
      },
    },
    status: "authenticated",
  };
  const pending = [];
  let invalidations = 0;
  const setUser = (update) => {
    user = typeof update === "function" ? update(user) : update;
  };
  const h = hookHarness(
    "src/hooks/auth/useSessionProfile.ts",
    "useSessionProfile",
    [],
    {
      "next-auth/react": { useSession: () => state },
      "src/store/UserContext.tsx": { useUser: () => ({ setUser }) },
      "src/services/auth/userService.ts": {
        userService: {
          getById: () => {
            const request = deferred();
            pending.push(request);
            return request.promise;
          },
        },
      },
      "src/services/auth/authToken.ts": {
        clearAccessTokenCache() {
          invalidations++;
        },
      },
      "src/services/auth/logout.ts": { logout: async () => {} },
    },
  );
  assert.equal(
    invalidations,
    0,
    "initial hydration preserves in-flight auth requests",
  );
  state.data = null;
  state.status = "unauthenticated";
  h.render();
  assert.equal(invalidations, 1, "logout invalidates authenticated caches");
  pending[0].resolve({
    id: 1,
    name: "Obsolete",
    email: "one@example.com",
    role: "ROLE_ADMIN",
  });
  await h.flush();
  assert.equal(user, null);
  state.data = {
    user: {
      id: 2,
      name: "Current",
      email: "two@example.com",
      role: "ROLE_USER",
    },
  };
  state.status = "authenticated";
  h.render();
  pending[1].reject(new Error("network"));
  await h.flush();
  global.window.dispatchEvent(new Event("focus"));
  assert.equal(pending.length, 3);
  pending[2].resolve({
    id: 2,
    name: "Enriched",
    email: "two@example.com",
    role: "ROLE_USER",
  });
  await h.flush();
  assert.equal(user.name, "Enriched");
  assert.equal(user.id, 2);
  h.unmount();
});

test("blocked browser storage cannot crash the user provider", () => {
  global.localStorage = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
    removeItem() {
      throw new Error("blocked");
    },
  };
  const h = hookHarness(
    "src/store/UserContext.tsx",
    "UserProvider",
    [{ children: null }],
    {
      "@/constants": { USER_STORAGE_KEY: "currentUser" },
      "next-auth/react": {
        useSession: () => ({
          status: "authenticated",
          data: { user: { id: 1 } },
        }),
      },
    },
  );
  assert.equal(h.value.props.value.user, null);
  h.value.props.value.setUser({
    id: 1,
    name: "Fixture",
    email: "fixture@example.com",
    role: "ROLE_USER",
  });
  assert.doesNotThrow(() => h.render());
  assert.equal(h.value.props.value.user.id, 1);
  h.unmount();
});

test("page actions have stable identity and consecutive patches retain both updates", () => {
  global.window = { location: { pathname: "/lms/test" } };
  const stored = new Map();
  global.sessionStorage = {
    getItem: (key) => stored.get(key) || null,
    setItem: (key, value) => stored.set(key, value),
    removeItem: (key) => stored.delete(key),
  };
  const h = hookHarness(
    "src/hooks/common/usePageContext.tsx",
    "PageContextProvider",
    [{ children: null }],
    {},
    true,
  );
  const actions = h.value.props.value;
  actions.setPageContext({ pageType: "lesson", courseId: 1 });
  h.render();
  assert.equal(h.value.props.value, actions);
  actions.patchPageContext({ sectionId: 2 });
  actions.patchPageContext({ contentId: 3 });
  h.render();
  const current = h.value.props.children.props.value;
  assert.equal(current.sectionId, 2);
  assert.equal(current.contentId, 3);
  assert.deepEqual(JSON.parse(stored.get("lms_page_context")), current);
  h.unmount();
});
