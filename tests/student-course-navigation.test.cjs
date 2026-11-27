const { test } = require("node:test");
const assert = require("node:assert/strict");
const { hookHarness } = require("./helpers/hook-harness.cjs");

const base = "/lms/student/courses/27";
function harness(initialPath, { holdContent = false } = {}) {
  let pathname = initialPath,
    release,
    contentRequests = 0;
  const navigations = [];
  const router = {
    push: (href) => navigations.push(["push", href]),
    replace: (href) => navigations.push(["replace", href]),
    back: () => navigations.push(["back"]),
  };
  const content = { id: 1771, section_id: 7, type: "QUIZ", title: "Quiz" };
  const context = { setPageContext() {}, clearPageContext() {} };
  const Nav = () => null,
    Progress = () => null,
    Ui = () => null;
  const h = hookHarness(
    "src/components/lms/student/StudentCourseProviders.tsx",
    "StudentCourseProviders",
    [{ children: null }],
    {
      "@/lib/tenant/navigation": {
        useParams: () => ({ courseId: "27" }),
        useRouter: () => router,
        usePathname: () => pathname,
        useSearchParams: () => new URLSearchParams(),
      },
      "@/services/lms/lmsService": {
        __esModule: true,
        default: {
          getCourse: async () => ({ data: { id: 27, title: "Course" } }),
          listSections: async () => ({ data: [{ id: 7, title: "Section" }] }),
          getCoTeachers: async () => [],
          listContent: async () => {
            contentRequests++;
            return holdContent
              ? new Promise((resolve) => {
                  release = () => resolve({ data: [content] });
                })
              : { data: [content] };
          },
        },
      },
      "@/services/lms/progressService": {
        __esModule: true,
        default: {
          getMyCourseProgress: async () => null,
          getMyCourseProgressDetail: async () => [],
        },
      },
      "@/hooks/common/usePageContext": { useSetPageContext: () => context },
      "@/components/lms/shared": { PageLoader: () => null },
      "./StudentCourseContext": {
        StudentCourseNavigationContext: { Provider: Nav },
        StudentCourseProgressContext: { Provider: Progress },
        StudentCourseUiContext: { Provider: Ui },
      },
    },
  );
  return {
    h,
    navigations,
    content,
    release: () => release(),
    navigate: (path) => {
      pathname = path;
      h.render();
    },
    get value() {
      return h.value.type === Nav ? h.value.props.value : null;
    },
    get contentRequests() {
      return contentRequests;
    },
  };
}

test("reloading quiz result/history/take or stats does not navigate to the first lesson", async () => {
  for (const path of [
    "/quiz/109/result/648",
    "/quiz/109/history",
    "/quiz/109/take",
    "/stats",
  ]) {
    const app = harness(base + path);
    await app.h.flush();
    await app.h.flush();
    assert.deepEqual(app.navigations, [], path);
    assert.equal(app.value.activeContent, null);
    app.h.unmount();
  }
});

test("entering learn after a result selects the first lesson without reloading its section", async () => {
  const app = harness(base + "/quiz/109/result/648");
  await app.h.flush();
  await app.h.flush();
  app.navigate(base + "/learn");
  await app.h.flush();
  await app.h.flush();
  assert.equal(app.value.activeContent.id, 1771);
  assert.deepEqual(app.navigations, [
    ["replace", base + "/learn?contentId=1771"],
  ]);
  assert.equal(app.contentRequests, 1);
  app.h.unmount();
});

test("a delayed automatic lesson load cannot override navigation to a quiz result", async () => {
  const app = harness(base + "/learn", { holdContent: true });
  await app.h.flush();
  app.navigate(base + "/quiz/109/result/648");
  app.release();
  await app.h.flush();
  await app.h.flush();
  assert.deepEqual(app.navigations, []);
  app.h.unmount();
});

test("explicitly selecting a sidebar lesson still navigates from a result", async () => {
  const app = harness(base + "/quiz/109/result/648");
  await app.h.flush();
  await app.h.flush();
  app.navigations.length = 0;
  app.value.setActiveContent(app.content);
  app.h.render();
  assert.deepEqual(app.navigations, [["push", base + "/learn?contentId=1771"]]);
  app.h.unmount();
});
