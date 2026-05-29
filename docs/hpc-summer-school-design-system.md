# HPC Summer School 2026 — UI/UX Design System & Aesthetic Analysis

Tài liệu này phân tích chi tiết toàn bộ hệ thống thiết kế giao diện (UI/UX) của trang đăng ký **HPC Summer School 2026**. Tài liệu đã được cập nhật để phản ánh đầy đủ các cải tiến thực tế về mặt cấu trúc Modular, hiệu ứng kính mờ (Glassmorphism), thiết kế Stepper tích hợp toán học và thành phần thông báo Toast nổi cao cấp.

---

## 1. Bản Sắc Thiết Kế (Design Identity)

Trang đăng ký hướng tới đối tượng sinh viên kỹ thuật xuất sắc, nhà nghiên cứu và giảng viên trong lĩnh vực Tính toán Hiệu năng cao (HPC). Vì vậy, ngôn ngữ thiết kế được lựa chọn là **Tech-Modernist & High-Trust**:
* **Tech-Modernist (Hiện đại Công nghệ)**: Phản ánh tính chất hiện đại của siêu máy tính thông qua các hiệu ứng kính mờ trong suốt, dải màu chuyển động gradient lục-lam và sự đồng bộ hóa hoàn hảo với giao diện nền sao động (Animated Stars background) của hệ thống.
* **High-Trust (Độ tin cậy cao)**: Tạo sự tin cậy tuyệt đối bằng hệ màu trung tính dịu nhẹ (Slate), cấu trúc form nhiều bước (Step-by-step) mạch lạc và các thông tin cam kết bảo mật rõ ràng.

---

## 2. Bố Cục Thấu Quang & Hiệu Ứng Kính Mờ (Glassmorphism)

Để tối đa hóa vẻ đẹp của giao diện, trang web đã loại bỏ hoàn toàn các lớp nền nhân tạo, cho phép **nền sao động (animated stars layout background)** của hệ thống tỏa sáng tự nhiên. Trên nền đó, biểu mẫu chính hoạt động như một tấm kính lọc mờ cao cấp:
* **Chất liệu kính mờ tinh khiết (Frosted Glass):** Thẻ chứa form chính được thiết lập với lớp CSS cao cấp:
  * `backdrop-blur-xl bg-white/70 dark:bg-slate-900/50` kết hợp viền mảnh bán trong suốt `border-slate-200/80 dark:border-slate-800/50`.
  * Sự kết hợp này giúp làm mờ mịn màng các ngôi sao lướt qua phía sau thẻ form, tạo độ tương phản văn bản hoàn hảo mà vẫn giữ được tính kết nối không gian.
* **Hạn chế độ bo góc (Restricted Corner Roundness):**
  * Form chính: `rounded-3xl` (24px) tạo khung vững chãi, tinh tế.
  * Các trường nhập liệu và Toast: được khống chế ở mức **`rounded-xl` (12px)** để mang lại cảm giác sắc sảo, chắc chắn và chuẩn tính chất kỹ thuật cao, tránh việc bo góc quá đà gây cảm giác thiếu nghiêm túc.

---

## 3. Hệ Thống Stepper Tích Hợp Toán Học (Math-Perfect Integrated Stepper)

Bộ chỉ báo tiến trình được nâng cấp lên chuẩn **Integrated Overlay Stepper (Bộ đếm bước tích hợp)** với độ đối xứng hoàn hảo 100% không phụ thuộc vào ngôn ngữ hiển thị (EN/VI):

* **Neo chính xác vào Tâm (`18px`):** Vì các ô tròn số bước có kích thước cố định là `w-9` (36px), tâm của chúng luôn nằm chính xác ở tọa độ `18px` từ hai biên.
* **Tách biệt nhãn chữ tuyệt đối (Absolute Text Isolation):**
  * Để ngăn độ dài chữ khác biệt (ví dụ: *"Privacy & Data Protection"* so với *"Quyền Riêng Tư"*) kéo giãn hoặc làm lệch vị trí ô số, các nhãn chữ được đưa ra khỏi luồng Flex và neo độc lập bằng:
    * `absolute top-11 left-1/2 -translate-x-1/2 w-[120px] sm:w-[150px]`
  * Nhờ đó, cả 3 ô số luôn được xếp đối xứng tuyệt đối qua trục giữa của trang web.
* **Dòng chảy mượt mà:** Trục progress bar chạy xuyên suốt từ `left-[18px]` đến `right-[18px]`, giúp dải màu Gradient thương hiệu (`from-cyan-500 via-cyan-400 to-blue-500`) dừng lại và bắt đầu chính xác tại tâm của ô bước tương ứng (`0%` -> `50%` -> `100%`) một cách hoàn mỹ.

---

## 4. Hệ Thống Toast Nổi Tự Động (Non-blocking Floating Toast)

Thông báo khôi phục nháp cũ đã được chuyển đổi hoàn toàn từ dạng Banner chiếm chỗ sang thành phần **Toast nổi độc lập**, giúp giải phóng không gian thẻ form và ngăn chặn hiện tượng dịch chuyển layout (Layout Shift):

* **Định vị & Bố cục:** Cố định ở góc dưới bên phải `fixed bottom-5 right-5 z-50` với thuộc tính `w-auto whitespace-nowrap` giúp toàn bộ nội dung chữ luôn hiển thị **nằm gọn trên đúng 1 dòng** đẹp mắt.
* **Tương tác chuyển động Premium:**
  * **Slide In (Trượt vào):** Sử dụng `@keyframes toastSlideIn` trượt mượt mà từ rìa phải màn hình vào trong qua hàm gia tốc `cubic-bezier(0.16, 1, 0.3, 1)`.
  * **Slide Out (Trượt ra):** Khi tắt hoặc hết hạn, Toast trượt ngược lại rìa phải thông qua cơ chế quản lý trạng thái `isExiting`.
* **Thanh đếm ngược thời gian trực quan (Life-time Progress Bar):**
  * Một thanh mảnh `3px` chạy dọc sát mép dưới Toast, tự động co hẹp từ `100%` về `0%` tương ứng chuẩn xác với thời lượng tồn tại (`duration`) của thông báo.

---

## 5. Đầu Vào & Điều Hướngsleek (Inputs & Navigation)

* **Trường nhập liệu (Form Fields):** Được đóng gói thành các component tái sử dụng (`FIn`, `FTa`, `FSel`) với chất liệu bán thấu quang `bg-slate-50/50 dark:bg-slate-800/40 backdrop-blur-sm`, tỏa sáng nhẹ nhàng với bóng viền `focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]` khi được chọn.
* **Nút bấm Sleek & Chuyên nghiệp:** Loại bỏ hiệu ứng phóng to phóng đại và bóng sáng gây chói mắt. Các nút bấm chính duy trì kích thước ổn định, chỉ phản hồi nhấn vật lý đàn hồi nhẹ khi click (`active:scale-95`) cùng bóng đổ mờ tối giản (`shadow-cyan-900/10 dark:shadow-cyan-950/20`), đảm bảo trải nghiệm trang trọng nhất.
