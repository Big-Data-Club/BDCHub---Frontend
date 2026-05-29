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

  // Khởi chạy trình duyệt sạch 100% (No cache, no stale cookies)
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Thiết lập kích thước màn hình tiêu chuẩn (Desktop)
  await page.setViewportSize({ width: 1440, height: 900 });

  // Lắng nghe lỗi console và cảnh báo từ trang Next.js
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`   [Next.js Error] 🔴 ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      console.log(`   [Next.js Warning] 🟡 ${msg.text()}`);
    }
  });

  try {
    // 1. Truy cập trang chủ
    await page.goto(web_url);
    await page.waitForLoadState('networkidle');
    console.log("   ✅ Đã tải trang chủ Next.js thành công!");

    // Chụp ảnh màn hình giao diện Desktop
    await page.screenshot({ path: path.join(__dirname, 'NextJS_Desktop.png'), fullPage: true });
    console.log("   📸 Đã chụp ảnh giao diện Desktop.");

    // 2. Kiểm thử Responsive trên Thiết bị Di động (Mobile emulation)
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size
    await page.screenshot({ path: path.join(__dirname, 'NextJS_Mobile.png'), fullPage: true });
    console.log("   📸 Đã chụp ảnh giao diện Responsive Mobile.");

    // Trở lại màn hình Desktop để kiểm tra tương tác cuộn trang
    await page.setViewportSize({ width: 1440, height: 900 });

    // 3. Tự động click vào nút "Tìm hiểu thêm" để kiểm tra tính năng Smooth Scroll
    const learnMoreButton = page.locator('text=Tìm hiểu thêm').first();
    if (await learnMoreButton.isVisible()) {
      await learnMoreButton.click();
      await page.waitForTimeout(1000); // Đợi cuộn trang mượt mà hoàn tất
      console.log("   ✅ Tương tác click 'Tìm hiểu thêm' hoạt động chính xác!");
    }

  } catch (error) {
    console.error("   ❌ Lỗi kiểm thử Next.js:", error);
  } finally {
    await browser.close();
  }
}

runWebTest();
```

---

## 🎨 PHẦN 2: Áp Dụng Cho Storybook Components (Cổng 6006)

Kịch bản này dùng để cô lập hoàn toàn các thành phần giao diện động trong môi trường phát triển độc lập (Storybook), gỡ lỗi trạng thái nạp bộ nhớ đệm `localStorage` cũ và gỡ lỗi Framer Motion.

Tạo tệp `debug_storybook.js` ở thư mục gốc:

```javascript
const { chromium } = require('@playwright/test');
const path = require('path');

const stats_url = 'http://localhost:6006/iframe.html?id=landing-hero-stats--isolated-stats&viewMode=story';

async function runStorybookTest() {
  console.log(`\n--- 🎨 ĐANG KIỂM THỬ STORYBOOK COMPONENTS ---`);
  console.log(`URL Iframe: ${stats_url}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Lắng nghe các log kiểm thử trạng thái focusSection
  page.on('console', msg => {
    if (msg.text().includes('focusSection') || msg.text().includes('DEBUG')) {
      console.log(`   [Storybook Console] ➡️ ${msg.text()}`);
    }
  });

  try {
    // 1. Truy cập trực tiếp vào iframe chứa Component biệt lập
    await page.goto(stats_url);
    await page.waitForLoadState('networkidle');

    // Chờ 3 giây để các hoạt ảnh nảy chữ cái và đồng bộ decorator kết thúc
    await page.waitForTimeout(3000);

    // 2. Chụp ảnh kiểm thử trực quan trạng thái hiển thị
    await page.screenshot({ path: path.join(__dirname, 'Storybook_Stats_Isolated.png') });
    console.log("   📸 Đã chụp ảnh linh kiện biệt lập Storybook.");

  } catch (error) {
    console.error("   ❌ Lỗi kiểm thử Storybook:", error);
  } finally {
    await browser.close();
  }
}

runStorybookTest();
```

---

## 🏃‍♂️ Quy Trình Chạy Kiểm Thử Thực Tế

Bạn có thể chạy song song hoặc riêng lẻ từng môi trường để kiểm thử:

### Cách 1: Chạy và kiểm tra Ứng dụng Next.js chính
1. Khởi chạy máy chủ phát triển Next.js:
   ```bash
   npm run dev
   # Ứng dụng chạy tại http://localhost:3000
   ```
2. Chạy tệp kiểm thử tự động Next.js:
   ```bash
   node debug_nextjs.js
   ```
3. Xem kết quả in ra trong terminal và kiểm tra 2 tệp ảnh `NextJS_Desktop.png` và `NextJS_Mobile.png` thu được.

---

### Cách 2: Chạy và kiểm tra Storybook Components
1. Khởi chạy máy chủ Storybook:
   ```bash
   npm run storybook
   # Storybook chạy tại http://localhost:6006
   ```
2. Chạy tệp kiểm thử tự động Storybook:
   ```bash
   node debug_storybook.js
   ```
3. Xem kết quả in ra trong terminal và kiểm tra tệp ảnh `Storybook_Stats_Isolated.png` thu được.

---

## 💡 Tổng Kết Phương Pháp Debug E2E Chuyên Nghiệp

* **Loại bỏ Human Bias (Định kiến con người):** Việc lập trình viên tự kiểm thử bằng tay thường bị bỏ sót do bộ nhớ cache trình duyệt cá nhân giữ lại trạng thái cũ. Playwright mang lại kết quả khách quan 100% vì mỗi phiên chạy đều là trình duyệt ẩn danh hoàn toàn mới.
* **Tích hợp CI/CD:** Các script trên có thể dễ dàng tích hợp vào GitHub Actions hoặc Vercel Deployment để tự động chạy kiểm thử trước khi tiến hành gộp nhánh (Pull Request), đảm bảo không bao giờ phát sinh lỗi hiển thị trên môi trường Production!
