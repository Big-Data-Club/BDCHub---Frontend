---
target: src/app/(learning)/lms/teacher/courses/create/page.tsx
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-19T10-25-14Z
slug: c-app-learning-lms-teacher-courses-create-page-tsx
---
# Critique Report: `/lms/teacher/courses/create`

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Toast/banner thông báo đơn giản, thiếu tiến trình trực quan từng bước |
| 2 | Match System / Real World | 3 | Thuật ngữ chuẩn LMS ("Bản nháp", "Org Only"), nhưng nhãn AI workflow chưa rõ |
| 3 | User Control and Freedom | 2 | Nút Hủy chỉ gọi `router.back()`, thiếu cảnh báo mất dữ liệu khi form đã điền |
| 4 | Consistency and Standards | 3 | Tuân thủ component library (`LmsPageHeader`, `CourseCard`), nhưng badge số thứ tự lệch màu dark mode |
| 5 | Error Prevention | 2 | Chưa có validation inline real-time (chỉ check khiSubmit), thiếu auto-save/draft |
| 6 | Recognition Rather Than Recall | 3 | Thẻ Live Preview trực quan giúp xem trước khóa học, nhưng preview thiếu một số field như org name |
| 7 | Flexibility and Efficiency | 2 | Thiếu phím tắt (Cmd+S / Ctrl+S) và tạo nhanh danh mục |
| 8 | Aesthetic and Minimalist Design | 3 | Bố cục split layout 7:5 gọn gàng, nhưng khung Live Preview bị fixed height `h-[380px]` gây bóp méo |
| 9 | Error Recovery | 2 | Lỗi submit hiển thị banner chung ở top thay vì scroll / focus vào field bị lỗi |
| 10 | Help and Documentation | 3 | Thẻ Tip trợ giúp tốt ("Lưu ý khi khởi tạo"), nhưng các trường form nâng cao thiếu helper text |
| **Total** | | **26/40** | **Acceptable (Cần cải thiện UX & Error handling)** |

---

## Design Specificity Verdict

**LLM Assessment:**  
Giao diện tạo khóa học (`/lms/teacher/courses/create`) áp dụng đúng ngôn ngữ thiết kế "Tech-Academic Terminal" với cấu trúc Split Layout (Form bên trái 7-col, Sticky Live Preview bên phải 5-col) và thanh header chuẩn `LmsPageHeader`. Tuy nhiên, tính đặc thù chuyên sâu cho giảng viên (Teacher UX) vẫn còn mang tính chất một biểu mẫu CRUD tiêu chuẩn:
- Thiếu các gợi ý thông minh hoặc các mẫu (Templates) tạo khóa học nhanh dành cho giảng viên BDC/HCMUT.
- Live Preview bị ép chiều cao cố định `h-[380px]`, khiến thẻ khóa học `CourseCard` bị tràn hoặc méo viền padding.
- Không có chức năng lưu nháp tự động (Autosave) hoặc khôi phục dữ liệu form khi giảng viên lỡ vô tình bấm Hủy/Back.

**Deterministic Scan (Automated Detector):**  
Phát hiện **3 cảnh báo code/màu sắc** trong file target:
1. `line 196`: `text-slate-600` trên nền `dark:bg-blue-950/40` (Tương phản chữ tối trên nền tối ở badge số `01`).
2. `line 231`: `text-slate-600` trên nền `dark:bg-purple-950/40` (Tương phản chữ tối trên nền tối ở badge số `02`).
3. `line 363`: Size chữ tùy biến `text-[10px]` ở badge Live Preview không thuộc bảng quy chuẩn Typography của DESIGN.md (`text-xs` là tối thiểu).

---

## Overall Impression

Giao diện trực quan, sáng sủa và đúng tinh thần BDCourse. Nút chuyển đổi Tab giữa **Tạo thủ công** và **Tạo bằng AI (Sơ đồ)** rất tiềm năng. Tuy vậy, trải nghiệm nhập liệu cho giảng viên còn thiếu cảm giác an toàn (chưa có lưu nháp tự động, chưa báo mất dữ liệu khi rời trang) và chưa tối ưu hóa quy trình nhập liệu nhanh.

---

## What's Working

1. **Header & Navigation Cohesion**: Sử dụng thành công `LmsPageHeader` và `BreadcrumbNav` giúp định vị trang mượt mà trong toàn bộ hệ thống LMS.
2. **Sticky Live Preview**: Ý tưởng đưa `CourseCard` làm preview trực tiếp khi gõ tên/danh mục giúp giảng viên dễ hình dung hình ảnh khóa học của mình hiển thị với học viên ra sao.
3. **Phân chia Section rõ ràng**: Khối thông tin 01 (Thông tin cơ bản) và 02 (Chi tiết & Phân quyền) giúp giảm tải thị giác so với một form dài đơn điệu.

---

## Priority Issues

### [P1] Nút Hủy nguy hiểm & Thiếu lưu nháp (Autosave/Unsaved Changes Guard)
- **Why it matters**: Giảng viên dành 10-15 phút soạn nội dung mô tả chi tiết, nếu lỡ tay bấm "Hủy" hoặc nhấn nút Back trình duyệt sẽ mất sạch dữ liệu mà không có cảnh báo nào.
- **Fix**: Thêm hook cảnh báo rời trang khi form dirty (`beforeunload` / `useBeforeUnload`), tự động lưu form data vào `localStorage` draft.
- **Suggested command**: `$impeccable harden`

### [P1] Tương phản chữ dark mode ở Badge số thứ tự (Detector violation)
- **Why it matters**: Badge số `01` và `02` dùng `text-slate-600` trên nền `dark:bg-blue-950/40`, khiến chữ bị chìm hoàn toàn trong chế độ tối, vi phạm tiêu chuẩn WCAG AA.
- **Fix**: Sửa thành `dark:text-cyan-400` / `dark:text-purple-300` thống nhất với viền và icon.
- **Suggested command**: `$impeccable colorize`

### [P2] Live Preview Container bị ép cứng chiều cao `h-[380px]`
- **Why it matters**: Thuộc tính `h-[380px]` cố định khiến thẻ `CourseCard` bên trong bị cắt xén shadow hoặc tràn layout khi tên khóa học dài nhiều dòng.
- **Fix**: Thay `h-[380px]` bằng `min-h-[360px] h-auto w-full` để container co giãn tự nhiên theo nội dung preview.
- **Suggested command**: `$impeccable layout`

### [P2] Thiếu Validation Inline và Focus thông minh khi Submit lỗi
- **Why it matters**: Khi giảng viên bấm Submit mà quên nhập Tên khóa học, thông báo lỗi hiện ở banner trên cùng nhưng khung Input bên dưới không tự động scroll hay focus vào, gây mất thời gian tìm kiếm lỗi.
- **Fix**: Tự động focus vào field lỗi đầu tiên và hiển thị validation state ngay khi `onBlur`.
- **Suggested command**: `$impeccable clarify`

---

## Persona Red Flags

- **Alex (Power User / Giảng viên bận rộn)**: Không có phím tắt `Ctrl+S` / `Cmd+Enter` để tạo nhanh khóa học. Mọi thao tác bắt buộc dùng chuột kéo xuống cuối trang để bấm nút Primary.
- **Jordan (Giảng viên mới)**: Trường "Tổ chức sở hữu" (Org) hiển thị nhãn kỹ thuật `(bdc)`, không giải thích rõ tại sao phải chọn Org hoặc chọn sai thì có ảnh hưởng tới quyền xem của sinh viên hay không.
- **Sam (Accessibility User)**: Cảnh báo lỗi `submitNotice` ở trên cùng chưa có `role="alert"` hoặc `aria-live="polite"`, khiến người dùng dùng Screen Reader không nhận biết được lý do submit thất bại.

---

## Minor Observations

- Badge `Live Preview` dùng `text-[10px]` không chuẩn design system. Nên dùng `text-xs scale-90 origin-left` hoặc token `text-xs`.
- Form field "Danh mục" là text input tự do, nên có thêm gợi ý Datalist/Autocomplete (VD: "Lập trình", "Data Science", "AI/ML") để tránh dữ liệu bị phân tán.

---

## Questions to Consider

- Giảng viên có cần tính năng "Import thông tin từ giáo trình / PDF" ngay tại bước tạo cơ bản này không?
- Chúng ta có nên cho phép lưu dưới dạng "Draft" riêng thay vì bắt buộc phải điền đủ thông tin tối thiểu ngay lập tức?
