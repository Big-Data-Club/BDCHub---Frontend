---
target: src/app/(learning)/lms/student/courses/[courseId]/page.tsx
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-18T17-04-59Z
slug: app-learning-lms-student-courses-courseid-page-tsx
---
# Critique Report: `/lms/student/courses/[courseId]`

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Tiến độ hoàn thành cập nhật tốt, nhưng thiếu trạng thái auto-complete (hẹn giờ 3s ngầm không có countdown visual). |
| 2 | Match System / Real World | 3/4 | Thuật ngữ Tiếng Việt khá tự nhiên ("Học tập", "Thống kê", "Bắt buộc học"). |
| 3 | User Control and Freedom | 2/4 | URL `/lms/student/courses/[id]` tự động redirect cứng sang `/learn` không cho xem trang thông tin/overview tổng quan. Sidebar thu gọn được nhưng button toggle floating dễ bị đè layout. |
| 4 | Consistency and Standards | 2/4 | Tabbar bị lặp 2 lần (desktop tabbar + mobile tabbar), font size 9px/10px lạm dụng quá đà ở các tab Thống kê/Flashcard/Mastery. |
| 5 | Error Prevention | 2/4 | Nút hoàn thành bài học không có xác nhận quay lại hoặc cảnh báo khi qua bài chưa xem hết. |
| 6 | Recognition Rather Than Recall | 2/4 | Khi chuyển bài học không có thanh chỉ báo bài học kế tiếp là bài gì ngoại trừ nút "Bài tiếp" chung chung. |
| 7 | Flexibility and Efficiency | 3/4 | Đã hỗ trợ phím tắt điều hướng `ArrowLeft` / `ArrowRight`. |
| 8 | Aesthetic and Minimalist Design | 1/4 | **Nặng nề AI Slop**: Header bị nhồi nhét quá nhiều thông tin (Breadcrumb + Title + NavTabBar + Progress Card siêu to khổng lồ chiếm 50% diện tích Header). |
| 9 | Error Recovery | 2/4 | Không có empty state / error boundary đẹp mắt khi load course bị lỗi. |
| 10 | Help and Documentation | 2/4 | Thiếu hướng dẫn nhanh phím tắt điều hướng cho học viên mới. |
| **Total** | | **21/40** | **Acceptable (Cần cải thiện nhiều về Layout & AI Slop)** |

## Design Specificity Verdict

**LLM Assessment**: Trang `/lms/student/courses/[id]` mắc nhiều lỗi "AI Slop" điển hình:
1. **Header Nhồi Nhét Over-Engineering**: Header `layout.tsx` sử dụng backdrop filter, GridBackground, vừa chứa Title, vừa chứa Tabbar, lại vừa chứa một Card Tiến độ học tập (`CourseDetailProgressCard`) cực kỳ lớn ở cột bên phải. Điều này làm cho Header chiếm gần một nửa màn hình First View, ép vùng học tập chính (`ContentViewer`) bị đẩy xuống sâu bên dưới.
2. **Redirect Cứng Làm Mất Trang Overview**: Truy cập `/courses/[courseId]` lập tức `router.replace` tới `/learn`. Học viên không thể xem thông tin khóa học tổng quan trước khi vào bài.
3. **Typography Vỡ Ranh Giới (AI Slop micro-text)**: Rất nhiều component con (`FlashcardTab`, `LessonProgressTab`, `MasteryTab`) dùng font-size siêu nhỏ (`text-[9px]`, `10px`, `11px`), phối màu sai tương phản (`text-slate-955` trên `bg-cyan-500`) gây nhức mắt và vi phạm Accessibility/Design System.
4. **Layout Sidebar Gây Xung Đột Offset**: Floating Toggle Button ở line 160 (`left-[288px] xl:left-[320px]`) là cách dựng layout thiếu tính động, dễ bị vỡ hoặc che nội dung nếu kích thước màn hình thay đổi nhẹ.

**Deterministic Scan**: 
- `14 findings` từ detector (chủ yếu là `font-size` 9px, 10px, 11px sai type ramp DESIGN.md và `gray-on-color` vi phạm contrast).

## Overall Impression
Giao diện có nền tảng chức năng đầy đủ (có phím tắt, sidebar học tập, thống kê, flashcard), nhưng bị ảnh hưởng nặng bởi tư duy thiết kế "tham thông tin" (visual noise). Layout Header bị phình to bất thường, ép nội dung chính xuống dưới, các tab phụ lạm dụng chữ 9px/10px tạo cảm giác rối mắt, kém chuyên nghiệp.

## What's Working
1. **Phím tắt tiện lợi**: Điều hướng bài học bằng mũi tên trái/phải (`ArrowLeft` / `ArrowRight`) hoạt động mượt mà.
2. **Cấu trúc Sidebar bài học**: Hiển thị rõ danh sách bài học, icon phân loại nội dung (`ContentTypeBadge`) và tích xanh đã hoàn thành.

## Priority Issues

- **[P0] Layout Header bị phình to & Đẩy vùng học tập khỏi First View**
  - *Why it matters*: Học viên vào xem bài học nhưng Header chiếm 45% chiều cao màn hình, làm mất tập trung vào bài học chính (`ContentViewer`).
  - *Fix*: Tách `CourseDetailProgressCard` thành một thanh progress thu nhỏ (compact progress bar) hoặc chuyển nó vào tab Thống kê/Sidebar. Giảm padding Header từ `py-6` xuống compact header.
  - *Suggested command*: `$impeccable layout`

- **[P1] Trải nghiệm Redirect Cứng ở Route Root (`/courses/[courseId]`)**
  - *Why it matters*: Người dùng không có một trang tổng quan khóa học (Overview) chuẩn mực mà bị ép chuyển thẳng sang bài học đầu tiên.
  - *Fix*: Tạo trang Overview đẹp mắt hiển thị thông tin giảng viên, mục tiêu khóa học, các phần học và nút "Tiếp tục học" nổi bật.
  - *Suggested command*: `$impeccable shape`

- **[P1] AI Slop Micro-Text & Lỗi Tương Phản Chữ (`text-[9px]`, `gray-on-color`)**
  - *Why it matters*: Chữ 9px/10px cực kỳ khó đọc trên màn hình máy tính và thiết bị di động, vi phạm nghiêm trọng chuẩn WCAG AA.
  - *Fix*: Chuyển toàn bộ `text-[9px]` và `text-[10px]` về chuẩn minimal `text-xs` (12px) hoặc `text-sm` (14px). Sửa lỗi tương phản màu ở `MasteryTab`.
  - *Suggested command*: `$impeccable polish`

- **[P2] Thiếu chỉ báo đếm ngược Hẹn giờ Auto-complete 3 giây**
  - *Why it matters*: Hệ thống tự đánh dấu hoàn thành sau 3s ngầm (`setTimeout 3000ms`) mà không thông báo trực quan, khiến học viên bối rối không biết vì sao bài học tự tích xanh.
  - *Fix*: Thêm một progress ring hoặc toast đếm ngược nhỏ "Tự động hoàn thành trong 3s...".
  - *Suggested command*: `$impeccable animate`

## Persona Red Flags

- **Alex (Power User)**: Header quá to làm mất không gian trải nghiệm bài học. Muốn thu gọn Header hoàn toàn để tập trung vào Code/Video.
- **Jordan (First-Timer)**: Bị ngợp bởi Header chứa quá nhiều thông tin (Progress bar, Tabbar, Title, Breadcrumb) cùng một lúc. Không rõ nút bắt đầu nằm ở đâu.
- **Sam (Accessibility)**: Chữ 9px ở các thẻ Flashcard và Mastery không thể đọc được. Tương phản kém giữa chữ xám và nền cyan.

## Minor Observations
- Floating toggle expand/collapse sidebar bị gán vị trí absolute pixel cố định (`left-[288px]`), nên dễ chệch khi có scrollbar.
- Icon `BarChart3` ở tab Thống kê có kích thước nhỏ (`w-3.5 h-3.5`) chưa cân đối với font chữ tab.

## Questions to Consider
- *Liệu chúng ta có nên làm cho Header sticky dạng Compact khi scroll xuống bài học để tối ưu 100% diện tích xem video/PDF không?*
- *Trang Root khóa học nên là trang Overview chi tiết khóa học hay giữ chế độ nhảy thẳng vào bài học đang dở?*
