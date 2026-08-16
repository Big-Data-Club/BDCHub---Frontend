---
title: "Playwright Automation & Storybook Testing Guide"
category: "technical-report"
status: "guide"
last_updated: "2026-08-16"
---

# Hướng Dẫn Kiểm Thử Và Debug Toàn Diện Bằng Playwright Automation

**Playwright** không chỉ giới hạn ở Storybook. Đây là bộ công cụ kiểm thử tự động hóa trình duyệt chuyên nghiệp (End-to-End Testing) hàng đầu thế giới, có khả năng tương tác, kiểm thử và gỡ lỗi cho **tất cả mọi thành phần web** trong dự án BDC Hub:
1. **Next.js Web Application (`http://localhost:3000`):** Kiểm thử trang chủ chính thức, kiểm tra responsive trên mobile/tablet, luồng đăng nhập (NextAuth), định tuyến (routing), tương tác nút bấm và các lệnh gọi API thực tế.
2. **Storybook Components (`http://localhost:6006`):** Cô lập linh kiện (isolated components), gỡ lỗi trạng thái chuyển động (Framer Motion), kiểm tra các cấu hình tham số động trực quan.

Tài liệu này cung cấp hướng dẫn chi tiết cách áp dụng Playwright cho cả 2 môi trường trên máy local của bạn.

---

## 🛠️ Bước 1: Chuẩn bị Môi trường Chung

Playwright đã được cấu hình sẵn trong danh sách `devDependencies` của dự án. Thực hiện các lệnh sau để khởi tạo:

1. **Sử dụng môi trường Node.js thích hợp:**
   ```bash
   nvm use 20
   ```
2. **Cài đặt nhân trình duyệt Chromium của Playwright:**
   ```bash
   npx playwright install chromium
   ```

---

## 🚀 PHẦN 1: Áp Dụng Cho Next.js Web Application (Cổng 3000)

Kịch bản này tự động chạy trên trang chủ chính thức của ứng dụng Next.js để kiểm tra tính năng phản hồi (Responsive), tương tác cuộn trang (Smooth Scroll), và bắt lỗi JS từ console trình duyệt.

Tạo tệp `debug_nextjs.js` ở thư mục gốc:

```javascript
const { chromium } = require('@playwright/test');
const path = require('path');

const web_url = 'http://localhost:3000';

async function runWebTest() {
  console.log(`\n--- 🌐 ĐANG KIỂM THỬ NEXT.JS WEB APP ---`);
  console.log(`URL: ${web_url}`);

  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[Browser Console ${msg.type()}]: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser Uncaught Exception]: ${err.message}`));

  try {
    await page.goto(web_url, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: 'artifacts/nextjs_homepage.png', fullPage: true });

    // Scroll simulation
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
  } catch (error) {
    console.error('Lỗi khi chạy test:', error);
  } finally {
    await browser.close();
  }
}

runWebTest();
```

---

## 🎨 PHẦN 2: Áp Dụng Cho Storybook Components (Cổng 6006)

Storybook cho phép cô lập linh kiện để test riêng từng trạng thái props mà không cần tới toàn bộ server backend.

### Chạy Storybook:
```bash
npm run storybook
```

### Test Storybook via Playwright:
```bash
npx playwright test --config=playwright.config.ts
```
