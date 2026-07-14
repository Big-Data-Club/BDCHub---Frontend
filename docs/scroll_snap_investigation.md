# Điều tra Tính năng Snap Cuộn Tự động (Scroll Snap Investigation)

Tài liệu này ghi nhận quá trình nghiên cứu, triển khai và thử nghiệm tính năng tự động snap cuộn tại trang Dashboard Học viên (`/lms/student`).

---

## 1. Mô tả Hiệu ứng Mong muốn
- **Kịch bản:** Khi học viên cuộn trang xuống phía dưới để bắt đầu xem danh sách học phần và các biểu đồ phân tích (cột sidebar và phần analytics), trang sẽ tự động tính toán và snap (cuộn trượt mượt mà) sao cho mép dưới của phần Header (section chứa tiêu đề "Tổng quan học tập" và hình nền grid chuyển động) khớp sát với mép dưới của thanh điều hướng sticky phía trên (hoặc mép trên của màn hình).
- **Mục tiêu:** Giúp học viên bỏ qua thao tác cuộn thủ công phần header và nhanh chóng tập trung vào vùng nội dung chính của dashboard.

---

## 2. Các hướng tiếp cận đã triển khai

### Cách 1: Sử dụng CSS Scroll Snap (NATIVE CSS)
- **Phương pháp:**
  - Định nghĩa trên thẻ bao ngoài (outer wrapper): `snap-y snap-proximity h-screen overflow-y-auto scroll-smooth`.
  - Định nghĩa trên Header Section và Content Section: `snap-start`.
- **Kết quả:** Không khả thi do:
  - Cấu trúc layout chung (`lms/layout.tsx` và `lms/student/layout.tsx`) sử dụng các thuộc tính chiều cao động, `sticky sidebar`, và `overflow-hidden` để tạo hiệu ứng vùng chứa độc lập.
  - Việc chuyển hướng cuộn của toàn bộ trang vào một div con cục bộ (`h-screen overflow-y-auto`) gây ảnh hưởng tới hoạt động cuộn của Sidebar chính của hệ thống và thanh cuộn chung của trình duyệt.

### Cách 2: Sử dụng JavaScript Scroll Listener & absolute Offset (V1)
- **Phương pháp:**
  - Gắn sự kiện `scroll` vào `window`.
  - Tính toán tọa độ của phần content: `contentRef.current.offsetTop`.
  - Nếu tọa độ cuộn nằm trong vùng chuyển tiếp, thực hiện `window.scrollTo({ top: target, behavior: 'smooth' })`.
- **Kết quả:** Không hoạt động vì:
  - `offsetTop` chỉ tính toán khoảng cách so với thẻ cha gần nhất có `position: relative` (trong trường hợp này là lớp nền relative), khiến khoảng cách trả về sai lệch hoặc bằng `0`.
  - Khi cuộn nhanh bằng trackpad hoặc chuột, giá trị `window.scrollY` lập tức nhảy vọt qua vùng điều kiện kích hoạt, khiến sự kiện không bao giờ được chạy.

### Cách 3: Sử dụng Bounding Client Rect & Debounced Direction Scroll (V2 - Hiện tại)
- **Phương pháp:**
  - Sử dụng `contentRef.current.getBoundingClientRect().top + window.scrollY` để lấy tọa độ tuyệt đối của phần nội dung từ đỉnh trang.
  - Khấu trừ đi 64px chiều cao của thanh Navigation ghim phía trên (`stickyHeaderHeight = 64`).
  - Sử dụng cơ chế lắng nghe hướng cuộn (`scrollingDown`) và thiết lập `debounce 100ms` để kiểm tra khi thao tác cuộn dừng lại bên trong khoảng chuyển tiếp (từ 15px đến sát mép nội dung).
  - Khóa sự kiện cuộn bằng cờ `isSnapping` khi trình duyệt đang thực hiện animation `scrollTo` mượt mà để tránh xung đột gây giật lag.

---

## 3. Lý do hiệu ứng vẫn chưa hoạt động (Phân tích kỹ thuật - Cập nhật)

Hiện tại, hiệu ứng snap cuộn bằng JS (Cách 3) vẫn chưa phản hồi rõ rệt trên trình duyệt do các nguyên nhân chính sau:

1. **Vùng trigger quá hẹp kết hợp debounce:**
   - Điều kiện `currentScrollY > 15 && currentScrollY < targetScrollY - 10` tạo vùng kích hoạt chỉ ~225px (tùy chiều cao header).
   - Kết hợp với `debounce 100ms`, khi người dùng scroll nhanh bằng trackpad hoặc scroll wheel, giá trị `scrollY` luôn nhảy vượt qua vùng trigger trước khi debounce kịp kích hoạt callback.

2. **`getBoundingClientRect().top + scrollY` không ổn định:**
   - Giá trị `getBoundingClientRect().top` thay đổi liên tục theo mỗi pixel scroll, khiến `targetScrollY` "di chuyển" theo → điều kiện kích hoạt không ổn định và có thể tự hủy trong quá trình debounce.

3. **`overflow-hidden` trên student layout KHÔNG chặn window scroll:**
   - Thuộc tính `overflow-hidden` trên div wrapper (`student/layout.tsx` line 46) chỉ chặn nội dung tràn theo phương ngang (glow effects), **không** biến div đó thành scroll container (vì không có `overflow-y: auto/scroll`).
   - Scroll thực tế vẫn xảy ra ở `document`/`window` level → `window.scrollY` hoạt động bình thường.
   - Kết luận: Giả thuyết ban đầu về `window.scrollY = 0` là **không chính xác** trong trường hợp này.

---

## 4. Giải pháp: IntersectionObserver + Programmatic Scroll (Cách 4 - Đã áp dụng)

### Phương pháp:
- Đặt một **sentinel element** (`div` ẩn, 1px height) tại ranh giới giữa `StudentDashboardHeader` và vùng nội dung chính.
- Sử dụng `IntersectionObserver` với `rootMargin: -64px 0px 0px 0px` (khấu trừ chiều cao sticky nav) để phát hiện khi sentinel đi qua ranh giới viewport.
- Theo dõi hướng cuộn bằng `requestAnimationFrame` (so sánh `scrollY` liên tục).
- Khi sentinel **rời khỏi** viewport (scroll xuống) → snap tới mép content.
- Khi sentinel **quay lại** viewport (scroll lên) → snap về đầu trang.
- Cơ chế **cooldown 700ms** ngăn re-trigger trong khi animation đang chạy.

### Ưu điểm so với Cách 3:
- **Không phụ thuộc vào scroll event timing** → hoạt động với cả trackpad scroll nhanh.
- **IntersectionObserver là passive** → không gây layout thrashing hay jank.
- **Không cần tính toán position thủ công liên tục** → ổn định hơn.
- **Browser-native optimization** → hiệu suất cao.

### Files liên quan:
- `src/hooks/useScrollSnap.ts` — Custom hook chứa toàn bộ logic.
- `src/app/(learning)/lms/student/page.tsx` — Sử dụng hook với `sentinelRef` và `contentRef`.

### Kết quả: ✅ Hoạt động ổn định.

---

## 5. Cải tiến UX: Chỉ Snap theo Hướng Cuộn Xuống (V4.1)

### Vấn đề phát hiện sau khi triển khai Cách 4:

1. **Snap ngược khi scroll lên:** Sau khi đã snap xuống (header đã ẩn hoàn toàn), nếu người dùng cố scroll lên thì hook vẫn phát hiện header đang partially visible và tự động snap ngược xuống — gây cảm giác bị "kẹt" không thể quay lại header.

2. **Snap ngược lên khi scroll nhẹ từ đầu trang:** Ở trạng thái ban đầu (chưa cuộn), nếu scroll nhẹ xuống dưới, điều kiện `visibleBelowNav > totalHeight * 0.5` đánh giá header vẫn hiển thị > 50% → snap ngược lên top, gây khó chịu.

### Giải pháp:

- **Theo dõi hướng cuộn** (`scrollDirectionRef`): So sánh `scrollTop` hiện tại với giá trị trước đó, chỉ cập nhật khi delta > 2px (lọc noise).
- **Chỉ snap khi cuộn XUỐNG:** `checkAndSnap()` bỏ qua hoàn toàn nếu `scrollDirectionRef !== "down"`.
- **Loại bỏ snap-to-top:** Không còn behavior snap ngược về đầu trang — khi cuộn lên, người dùng có toàn quyền điều khiển thủ công.
- **Ngưỡng kích hoạt 40%:** Chỉ snap khi header đã bị ẩn ≥ 40% (`visibleBelowNav > totalHeight * 0.6` → return), tránh trigger khi scroll nhẹ.

### Kết quả: ✅ Snap chỉ xảy ra một chiều (xuống), UX tự nhiên hơn.
