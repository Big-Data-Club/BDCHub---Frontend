// Run against a local Next dev or production server: DUTYLOG_SMOKE_URL=http://127.0.0.1:3219 node tests/dutylog-project/smoke.mjs
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const base = process.env.DUTYLOG_SMOKE_URL || 'http://127.0.0.1:3219';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use a local test server.');
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
const screenshots = process.env.DUTYLOG_SCREENSHOTS || '/tmp/dutylog-project';
await mkdir(screenshots, { recursive: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const demoRequests = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => {
  try { if (request.frame().parentFrame() && /fetch|xhr/.test(request.resourceType())) demoRequests.push(request.url()); } catch { /* Frame can detach on reload. */ }
});
page.on('dialog', dialog => dialog.accept());
await page.addInitScript(() => localStorage.setItem('bdc-theme', 'light'));
try {
  const response = await page.goto(`${base}/projects/dutylog`, { waitUntil: 'networkidle', timeout: 120000 });
  assert.equal(response.status(), 200);
  await expect(page.getByRole('button', { name: 'Ứng dụng mẫu', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.frameLocator('iframe[src="/dutylog-demo/index.html"]').getByText('Chào An', { exact: true })).toBeVisible();
  const headingBox = await page.locator('#hero-title').boundingBox();
  assert(headingBox.y < 220, 'Hero information starts near the top on desktop');
  await page.getByRole('button', { name: 'Thiết kế Figma', exact: true }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.route('https://embed.figma.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html><body>Figma embed fixture</body></html>' }));
  await page.getByRole('button', { name: 'Tải bản thiết kế', exact: true }).click();
  const designFrame = page.getByTitle('Thiết kế DutyLog trên Figma', { exact: true });
  await expect(designFrame).toHaveAttribute('src', 'https://embed.figma.com/design/O3B7Q98CbofIDLz55nvcVH/DutyLog?node-id=0-1&embed-host=share');
  await expect(designFrame).toHaveAttribute('allowfullscreen', '');
  await page.getByRole('button', { name: 'Ứng dụng mẫu', exact: true }).click();
  await expect(designFrame).toHaveCount(0);
  const phone = page.frameLocator('iframe[src="/dutylog-demo/index.html"]');
  await expect(phone.getByText('Chào An', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Quét thẻ', exact: true })).toBeEnabled();
  await expect(page.getByText('Đang mở DutyLog…', { exact: true })).toHaveCount(0);
  await expect(phone.getByText('3/20 người có mặt', { exact: false })).toBeVisible();
  await page.screenshot({ path: `${screenshots}/desktop.png`, fullPage: true });

  await page.getByRole('button', { name: 'Quét thẻ', exact: true }).click();
  await phone.getByRole('button', { name: 'Quét thẻ mẫu DEMO001', exact: true }).click();
  await expect(phone.getByText('Điểm danh hợp lệ', { exact: true })).toBeVisible();
  await phone.getByText('Xem chi tiết người dùng ›', { exact: true }).click();
  await expect(phone.getByText('✉ khanhlinh@example.com', { exact: true })).toBeVisible();
  assert(await phone.getByText('MSSV / MÃ SỐ', { exact: true }).evaluate(el => {
    const tile = el.parentElement.parentElement;
    return tile.getBoundingClientRect().width >= tile.parentElement.getBoundingClientRect().width * .9;
  }), 'Profile tiles use full width inside a narrow phone');
  const code = phone.getByText('DEMO001', { exact: true });
  assert(await code.evaluate(el => el.scrollWidth <= el.clientWidth + 1), 'Student code is not ellipsized');
  await phone.getByText('Big Data Club', { exact: true }).scrollIntoViewIfNeeded();
  await expect(phone.getByLabel('Đóng modal', { exact: true })).toBeVisible();
  await phone.getByText('Đóng', { exact: true }).click();
  await page.getByRole('button', { name: 'Tổng quan', exact: true }).click();
  await expect(phone.getByText('4/20 người có mặt', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Phòng', exact: true }).click();
  await expect(phone.getByText('Sức chứa 20 · Hiện có 4 người', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Quét thẻ', exact: true }).click();
  await phone.getByText('Rời phòng', { exact: true }).click();
  await phone.getByRole('button', { name: 'Quét thẻ mẫu DEMO001', exact: true }).click();
  await expect(phone.getByText('Check-out thành công', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Có mạng', exact: true }).click();
  await phone.getByPlaceholder('Nhập MSSV...').fill('DEMO001');
  await phone.getByText('Xác nhận', { exact: true }).click();
  await expect(phone.getByText('Mất kết nối demo. Chưa ghi nhận thay đổi. Hãy bật lại kết nối và thử lại.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mất mạng', exact: true }).click();
  await page.getByRole('button', { name: 'Tổng quan', exact: true }).click();
  await expect(phone.getByText('3/20 người có mặt', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'Phòng', exact: true }).click();
  await phone.getByText('Không gian học tập', { exact: true }).click();
  await expect(phone.getByText('Bạn chưa có ca trực đang hoạt động', { exact: true })).toBeVisible();
  await expect(phone.getByText(/Big Data Club · 605 C6/)).toBeVisible();
  await page.getByRole('button', { name: 'Đặt lại demo', exact: true }).click();
  await expect(phone.getByText('3/20 người có mặt', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Mã QR', exact: true }).click();
  await expect(phone.getByText('Mã QR cá nhân', { exact: true })).toBeVisible();
  await expect(phone.locator('svg')).not.toHaveCount(0);
  await page.getByRole('button', { name: 'Tổng quan', exact: true }).click();
  await phone.getByText('Kết thúc ca', { exact: true }).click();
  await expect(phone.getByText('Bạn chưa có ca trực đang hoạt động', { exact: true })).toBeVisible();
  await phone.getByRole('tab', { name: 'Cá nhân', exact: true }).click();
  await phone.getByText('Giao diện quản lý phòng hiện tại', { exact: true }).click();
  await phone.getByText('Bắt đầu ca trực', { exact: true }).click();
  await page.getByRole('button', { name: 'Tổng quan', exact: true }).click();
  await expect(phone.getByText('ĐANG TRỰC', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Đặt lại demo', exact: true }).click();

  for (const width of [320, 375, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}px`);
    await page.getByRole('button', { name: 'Quét thẻ', exact: true }).click();
    await expect(page.getByText('Ghi nhận rõ ràng.', { exact: true })).toHaveCount(0);
    await phone.getByPlaceholder('Nhập MSSV...').fill('DEMO001');
    const confirm = phone.getByText('Xác nhận', { exact: true });
    assert(await confirm.evaluate(el => el.getBoundingClientRect().right <= innerWidth && el.getBoundingClientRect().left >= 0), `Confirmation stays in the phone at ${width}px`);
    await page.getByRole('button', { name: 'Mã QR', exact: true }).click();
    await expect(phone.getByText('Mã QR cá nhân', { exact: true })).toBeVisible();
    assert(await phone.locator('svg').evaluateAll(nodes => nodes.every(el => el.getBoundingClientRect().right <= innerWidth && el.getBoundingClientRect().left >= 0)), `QR fits the phone at ${width}px`);
    assert(await phone.getByText('Mã QR cá nhân', { exact: true }).evaluate(el => {
      for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        const color = getComputedStyle(parent).backgroundColor;
        if (color !== 'rgba(0, 0, 0, 0)') return color === 'rgb(255, 255, 255)';
      }
      return false;
    }), 'QR uses the shared light header');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${screenshots}/mobile.png`, fullPage: true });
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.screenshot({ path: `${screenshots}/mobile-dark.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: `${screenshots}/desktop-dark.png`, fullPage: true });
  await expect(page.getByRole('link', { name: 'Xem Figma', exact: false })).toHaveAttribute('href', /figma\.com\/design\/O3B7Q98CbofIDLz55nvcVH/);
  await expect(page.getByRole('link', { name: 'Behance case study', exact: false })).toHaveAttribute('href', 'https://www.behance.net/gallery/258617873/DutyLog-Qun-ly-Dang-ky-ca-trc-UIUX-Design/modules/1512920191');
  assert.deepEqual(demoRequests, [], 'Phone demo must not call APIs.');
  assert.deepEqual(errors, [], 'No uncaught browser errors.');
  console.log('DutyLog smoke passed: deferred Figma embed (external content mocked), Behance link, scan in/out, occupancy, offline failure, room switching, QR, shift close/start/reset, responsive layouts, themes and no demo API calls.');
} finally { await browser.close(); }
