// Production browser smoke with synthetic session/API fixtures; no live backend writes.
const { createRequire } = require("node:module");
const req = createRequire(
  require("node:path").resolve(__dirname, "../../package.json"),
);
const { chromium, expect } = req("@playwright/test");
const { encode } = req("next-auth/jwt");
const assert = require("node:assert/strict");
(async () => {
  const base = process.env.FRONTEND_SMOKE_URL || "http://127.0.0.1:3219";
  assert(
    ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
    "Use a local test server",
  );
  const secret = process.env.FRONTEND_SMOKE_SECRET;
  assert(
    secret,
    "Set FRONTEND_SMOKE_SECRET to the local server NEXTAUTH_SECRET",
  );
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    headless: true,
  });
  try {
    const context = await browser.newContext();
    const token = await encode({
      secret,
      token: {
        sub: "41",
        name: "Frontend Fixture",
        email: "fixture@example.invalid",
        role: "ROLE_ADMIN",
        accessToken: "synthetic-token",
        accessTokenExpires: Date.now() + 3600000,
      },
      maxAge: 3600,
    });
    await context.addCookies([
      {
        name: "__Secure-bdc.session-token.v2",
        value: token,
        domain: new URL(base).hostname,
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    const page = await context.newPage();
    const errors = [];
    const bankRequests = [];
    let saved;
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/*", async (route) => {
      const request = route.request(),
        url = new URL(request.url()),
        p = url.pathname;
      if (url.origin !== base) return route.abort();
      if (!/^\/(api|apiv1|lmsapiv1|labapiv1|chatapiv1)\//.test(p))
        return route.continue();
      if (p.endsWith("/notifications/stream"))
        return route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body: ": fixture\n\n",
        });
      let body = { success: true, data: [] };
      if (p === "/api/auth/session")
        body = {
          user: {
            id: 41,
            name: "Frontend Fixture",
            email: "fixture@example.invalid",
            role: "ROLE_ADMIN",
          },
          accessToken: "synthetic-token",
          expires: new Date(Date.now() + 3600000).toISOString(),
        };
      else if (p.includes("/api/users/41"))
        body = {
          id: 41,
          name: "Frontend Fixture",
          email: "fixture@example.invalid",
          role: "ROLE_ADMIN",
        };
      else if (p.endsWith("/me/roles"))
        body = { data: { roles: ["TEACHER", "ADMIN"] } };
      else if (p.endsWith("/question-bank/stats"))
        body = {
          data: {
            total: 0,
            dangling_count: 0,
            by_difficulty: {},
            by_source: {},
            by_month: [],
          },
        };
      else if (p.includes("/question-bank")) {
        bankRequests.push(url.searchParams.get("q"));
        body = { data: { items: [], total: 0, total_pages: 1 } };
      } else if (p.endsWith("/labs/9/authoring"))
        body = {
          success: true,
          data: {
            id: 9,
            title: "Fixture Lab",
            lab_type: "CODING",
            status: "DRAFT",
            level: "BEGINNER",
            runtime_config: { docker_image: "ubuntu:22.04" },
          },
        };
      else if (p.endsWith("/labs/9") && request.method() === "PUT") {
        saved = request.postDataJSON();
        body = {
          success: true,
          data: {
            id: 9,
            title: saved.title,
            lab_type: "CODING",
            status: "DRAFT",
          },
        };
      } else if (p.includes("notifications"))
        body = { data: [], items: [], unread_count: 0, total: 0 };
      return route.fulfill({ json: body });
    });
    await page.goto(base + "/lms/teacher/courses/9/question-bank", {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { name: "Thư viện đề thi" }),
    ).toBeVisible({ timeout: 30000 });
    await page
      .getByPlaceholder("Tìm trong câu hỏi...  (nhập để lọc tức thì)")
      .fill("fixture search");
    await expect.poll(() => bankRequests.includes("fixture search")).toBe(true);
    await page.goto(base + "/labs/manage/9", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Editor: Fixture Lab" }),
    ).toBeVisible({ timeout: 30000 });
    const general = () =>
      page
        .locator("form")
        .filter({ has: page.getByText("Lab Title", { exact: true }) });
    await expect(general().locator("input").first()).toHaveValue("Fixture Lab");
    await page
      .getByRole("button", { name: "Sandbox & Runtime", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Supported Coding Languages" }),
    ).toBeVisible();
    await page.getByRole("checkbox", { name: "PYTHON", exact: true }).check();
    await page
      .getByRole("button", { name: "Save Sandbox Configurations", exact: true })
      .click();
    await expect
      .poll(() => saved?.runtime_config?.supported_languages)
      .toEqual(["python"]);
    await page
      .getByRole("button", { name: "General Config", exact: true })
      .click();
    await general().locator("input").first().fill("Fixture Updated");
    const save = page.getByRole("button", {
      name: "Save Configurations",
      exact: true,
    });

    await save.click();
    await expect.poll(() => saved?.title).toBe("Fixture Updated");
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        questionBank: true,
        debouncedSearch: true,
        labGeneral: true,
        labRuntime: true,
        save: !!saved,
        pageErrors: errors,
      }),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
