// Start Next locally, then: LANDING_SMOKE_URL=http://127.0.0.1:3219 node tests/home-landing/smoke.mjs
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const base = process.env.LANDING_SMOKE_URL || "http://127.0.0.1:3219";
assert(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Use a local server.",
);
const data = JSON.parse(
  await readFile(
    new URL("../../src/data/clubData.json", import.meta.url),
    "utf8",
  ),
);
const screenshots = process.env.LANDING_SCREENSHOTS || "/tmp/bdc-home-landing";
await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : {}),
});
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (error) => errors.push(error.message));
await page.addInitScript(() => localStorage.setItem("bdc-theme", "light"));

try {
  const response = await page.goto(base, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  assert.equal(response.status(), 200);
  await expect(page.locator("h1")).toHaveText("Big Data Club.");
  const landing = page.locator('div[lang="vi"]');
  const sky = page.locator("[data-starfield]");
  const light = page.locator("[data-spotlight]");
  await expect(sky).toHaveAttribute("data-active", "true");
  for (const activity of data.activities) {
    await expect(
      page.locator("#activities h3").filter({ hasText: activity.title }),
    ).toHaveCount(1);
  }
  assert.equal(
    await page.locator("#projects article").count(),
    data.projects.filter(({ id }) => id !== "dutylog").length,
  );
  assert.equal(
    await page.locator("#publications article").count(),
    data.publications.length,
  );
  for (const key of [
    "Big Data",
    "High Performance Computing",
    "Artificial Intelligence",
    "Quantum Computing",
    "Cloud Computing",
  ]) {
    await expect(landing.getByText(key, { exact: true })).toBeVisible();
  }
  const jsonLd = JSON.parse(
    await page.locator('script[type="application/ld+json"]').textContent(),
  );
  assert.equal(jsonLd.parentOrganization.url, "https://hpcc.hcmut.edu.vn/");
  assert.equal(
    await page
      .locator("nav")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    await landing.evaluate((el) => getComputedStyle(el).backgroundColor),
    "Homepage header shares the page surface",
  );
  await page.screenshot({ path: `${screenshots}/desktop-light.png` });

  // One synchronous burst of events must result in a single DOM write, not 30 renders/frames.
  await page.evaluate(() => {
    const light = document.querySelector("[data-spotlight]");
    window.spotWrites = 0;
    const observer = new MutationObserver((records) => {
      window.spotWrites += records.length;
    });
    observer.observe(light, {
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });
    window.stopSpotWrites = () => observer.disconnect();
    const root = document.querySelector('div[lang="vi"]');
    for (let i = 0; i < 30; i++)
      root.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 200 + i,
          clientY: 300,
          pointerType: "mouse",
        }),
      );
  });
  const marks = light.locator("[data-trail-point]");
  await expect.poll(() => marks.first().getAttribute("style")).not.toBeNull();
  assert.equal(await page.evaluate(() => window.spotWrites), 1);
  const firstPosition = await marks.first().getAttribute("style");
  await page.waitForTimeout(90);
  await page.evaluate(() =>
    document
      .querySelector('div[lang="vi"]')
      .dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 450,
          clientY: 300,
          pointerType: "mouse",
        }),
      ),
  );
  await expect.poll(() => page.evaluate(() => window.spotWrites)).toBe(2);
  assert.equal(
    await marks.first().getAttribute("style"),
    firstPosition,
    "Existing trail marks stay where the pointer passed",
  );
  assert.equal(await marks.count(), 12, "The trail pool is bounded");
  const fading = Number(
    await marks
      .first()
      .locator("i")
      .evaluate((el) => getComputedStyle(el).opacity),
  );
  assert(fading > 0 && fading < 0.65, "Stationary marks fade gradually");
  await page.evaluate(() =>
    document
      .querySelector('div[lang="vi"]')
      .dispatchEvent(new PointerEvent("pointerleave")),
  );
  assert(
    Number(
      await marks
        .first()
        .locator("i")
        .evaluate((el) => getComputedStyle(el).opacity),
    ) > 0,
    "Leaving does not abruptly erase the trail",
  );
  await page.waitForTimeout(750);
  assert.equal(
    await page.evaluate(() => window.spotWrites),
    2,
    "No pointer writes while idle",
  );
  assert.equal(
    await marks
      .first()
      .locator("i")
      .evaluate((el) => getComputedStyle(el).opacity),
    "0",
  );
  await page.evaluate(() => window.stopSpotWrites());

  await page.locator("#hero").scrollIntoViewIfNeeded();
  await expect(sky).toHaveAttribute("data-active", "true");
  assert.equal(
    await sky
      .locator("i")
      .first()
      .evaluate((el) => getComputedStyle(el).animationPlayState),
    "running",
  );
  await page.screenshot({ path: `${screenshots}/hero-effects.png` });
  await page.locator("#publications").scrollIntoViewIfNeeded();
  await expect(sky).toHaveAttribute("data-active", "false");
  assert.equal(
    await sky
      .locator("i")
      .first()
      .evaluate((el) => getComputedStyle(el).animationPlayState),
    "paused",
  );

  const citation = page.locator("#publications details").first();
  await citation.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(citation).toHaveAttribute("open", "");
  await expect(citation.locator("p")).toContainText("MOMA:");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  await expect(light).toBeHidden();
  await expect(sky).toHaveAttribute("data-active", "false");
  await page.locator("#hero").scrollIntoViewIfNeeded();
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.screenshot({ path: `${screenshots}/desktop-dark.png` });

  for (const width of [360, 390, 768, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `No horizontal overflow at ${width}px`,
    );
  }
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(base, { waitUntil: "networkidle" });
  await expect(mobilePage.locator("[data-spotlight]")).toBeHidden();
  const areas = mobilePage.getByLabel("Các lĩnh vực hoạt động");
  const areasBox = await areas.boundingBox();
  assert(
    areasBox.y + areasBox.height < 844,
    "All research areas are visible on mobile entry",
  );
  await mobilePage.screenshot({ path: `${screenshots}/mobile.png` });
  await mobile.close();

  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 900 },
  });
  const staticPage = await noJs.newPage();
  await staticPage.goto(base);
  await expect(staticPage.locator("h1")).toBeVisible();
  await expect(staticPage.locator("#publications article")).toHaveCount(
    data.publications.length,
  );
  await expect(staticPage.locator('[data-reveal="pending"]')).toHaveCount(0);
  await noJs.close();

  assert.deepEqual(errors, []);
  console.log(
    "PASS: server content, all projects/activities/papers, HPC affiliation, stationary pointer trail/fade/idle, star pause, reduced motion, keyboard citations, light/dark and mobile layouts.",
  );
} finally {
  await browser.close();
}
