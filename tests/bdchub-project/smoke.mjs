// BDCHUB_SMOKE_URL=http://127.0.0.1:3221 node tests/bdchub-project/smoke.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
const base = process.env.BDCHUB_SMOKE_URL || "http://127.0.0.1:3221";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [],
  productRequests = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route(/\/(?:api\/ai|api\/workspace|lmsapiv1|apiv1)\//, (route) => {
  productRequests.push(route.request().url());
  return route.abort();
});
await mkdir("/tmp/bdchub-project", { recursive: true });
async function screenshot(name) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `/tmp/bdchub-project/${name}.png`,
    fullPage: true,
  });
}
try {
  await page.goto(`${base}/projects/bdchub`, {
    waitUntil: "domcontentloaded",
    timeout: 180000,
  });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Kiến thức có kết nối",
  );
  // ThemeToggle renders only after hydration; do not type into SSR-only inputs.
  await expect(page.getByRole("button", { name: "Toggle theme" })).toBeVisible({
    timeout: 60000,
  });
  const demo = page.locator("#experience");
  await expect(
    demo.getByRole("heading", { name: "Khóa học của tôi" }),
  ).toBeVisible();
  await expect(demo.getByRole("table")).toBeVisible();
  await demo.getByLabel("Tìm khóa học").fill("Không có khóa nào");
  await expect(
    demo.getByText("Không tìm thấy khóa học phù hợp."),
  ).toBeVisible();
  await demo.getByLabel("Tìm khóa học").fill("");
  await demo
    .getByRole("button", { name: "Quản lý nội dung", exact: true })
    .click();
  await demo.getByLabel("Tên bài học mới").fill("Ứng dụng RL trong lập lịch");
  await demo.getByRole("button", { name: "Thêm bài học", exact: true }).click();
  await expect(
    demo.getByRole("button", { name: /Ứng dụng RL trong lập lịch/ }),
  ).toBeVisible();
  await demo
    .getByRole("button", { name: "Xuất bản khóa học", exact: true })
    .click();
  await expect(demo.getByRole("status")).toContainText("Đã xuất bản");
  await screenshot("course-management");
  await demo
    .getByRole("button", { name: "Xem trang học tập", exact: true })
    .click();
  await expect(
    demo.getByRole("heading", { name: "Tác tử và môi trường", exact: true }),
  ).toBeVisible();
  await demo
    .getByRole("button", { name: "Đánh dấu hoàn thành", exact: true })
    .click();
  await expect(
    demo.getByRole("button", { name: "Đã hoàn thành", exact: true }),
  ).toBeDisabled();
  await demo
    .getByRole("button", { name: "Bài tiếp theo Phần thưởng và chính sách" })
    .click();
  await expect(
    demo.getByRole("heading", {
      name: "Phần thưởng và chính sách",
      exact: true,
    }),
  ).toBeVisible();
  await demo
    .getByRole("button", { name: "Kiểm tra kiến thức nền tảng" })
    .click();
  await demo
    .getByRole("radio", { name: "Tối đa hóa phần thưởng tích lũy" })
    .check();
  await demo.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(demo.getByRole("status")).toContainText("Chính xác!");
  await demo.getByRole("button", { name: "AI Cowork", exact: true }).click();
  await demo
    .getByRole("button", {
      name: "Cho tôi một ví dụ về TD Learning",
      exact: true,
    })
    .click();
  await expect(demo.getByRole("log")).toContainText("2,17");
  await expect(
    demo.getByRole("log").getByRole("button", { name: "Nguồn tham chiếu (1)" }),
  ).toBeVisible();
  await screenshot("learning");
  await demo
    .getByRole("button", { name: "Knowledge graph", exact: true })
    .click();
  await expect(demo.locator("canvas").first()).toBeVisible({ timeout: 30000 });
  await expect(
    demo.getByRole("button", { name: "Link tất cả", exact: true }),
  ).toHaveCount(0);
  await demo.getByRole("button", { name: "TD Learning", exact: true }).focus();
  await page.keyboard.press("Enter");
  await demo
    .getByRole("button", { name: "Hỏi AI về TD Learning", exact: true })
    .click();
  await demo
    .getByRole("button", {
      name: "Reward và Return khác nhau thế nào?",
      exact: true,
    })
    .click();
  const standaloneChat = demo.locator('[role="log"]:visible');
  await expect(standaloneChat).toContainText("reward");
  await screenshot("chat");
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await demo
      .getByRole("button", { name: "Trang học tập", exact: true })
      .click();
    await expect(
      demo.getByRole("heading", {
        name: "Kiểm tra kiến thức nền tảng",
        exact: true,
      }),
    ).toBeVisible();
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `No page overflow at ${width}px`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await screenshot("mobile-learning");
  await demo.getByRole("button", { name: "Làm lại", exact: true }).click();
  await expect(
    demo.getByRole("button", { name: /Ứng dụng RL trong lập lịch/ }),
  ).toHaveCount(0);
  await expect(
    demo.getByRole("heading", { name: "Khóa học của tôi", exact: true }),
  ).toBeVisible();
  await page.goto(`${base}/projects/dutylog`, {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByText("Demo tương tác · Dữ liệu mẫu", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Có mạng", exact: true }),
  ).toHaveCount(0);
  assert.deepEqual(
    productRequests,
    [],
    "Showcase cannot call live LMS/AI/Workspace APIs",
  );
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(
    "BDC Hub showcase passed: real course table, curriculum changes, student sidebar, completion, quiz, AI citations, real canvas graph, reset and responsive layout; no live product API calls.",
  );
} catch (error) {
  console.error("Browser errors:", errors);
  console.error(await page.locator("#experience").ariaSnapshot());
  await page.screenshot({
    path: "/tmp/bdchub-project/failure.png",
    fullPage: true,
  });
  throw error;
} finally {
  await browser.close();
}
