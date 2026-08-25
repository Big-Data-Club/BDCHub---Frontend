---
target: src/app/(landing)/page.tsx
total_score: 18
max_score: 28
na_heuristics: 5,7,9
p0_count: 0
p1_count: 2
timestamp: 2026-08-25T05-39-24Z
slug: src-app-landing-page-tsx
---
# AI-Slop & Design Critique: BDC Hub Landing Page

## Executive Summary & Visual Audit Findings

Đánh giá toàn diện trang Landing Page (`src/app/(landing)/page.tsx`) theo các tiêu chuẩn thiết kế UI/UX hiện đại và bộ nhận diện anti-pattern **AI Slop**.

---

### Design Health Score (Usability & Aesthetics)

| # | Heuristic | Score | Key Issue / Observation |
|---|-----------|-------|-------------------------|
| 1 | Visibility of System Status | 3/4 | Navigation & hover feedback rõ ràng, nhưng thiếu chỉ báo tương tác trên một số thẻ dữ liệu tĩnh |
| 2 | Match System / Real World | 3/4 | Ngôn ngữ học thuật chuẩn xác (HPC, LLM, Cluster), thuật ngữ gần gũi với sinh viên CNTT Bách Khoa |
| 3 | User Control and Freedom | 3/4 | Điều hướng cuộn trôi chảy với `ScrollReset` & `ScrollToTop` |
| 4 | Consistency and Standards | 2/4 | **Lạm dụng thẻ TerminalCard & CyberBadge quá mức**, gây cảm giác lặp lại trên toàn trang |
| 5 | Error Prevention | n/a | Landing page thông tin, không có form nhập liệu phức tạp |
| 6 | Recognition Rather Than Recall | 3/4 | Bố cục section chuẩn mực, phân tách 5 "Chapters" rõ ràng |
| 7 | Flexibility and Efficiency | n/a | Trang Persuade/Informative, không yêu cầu phím tắt hay accelerator |
| 8 | Aesthetic and Minimalist Design | 1/4 | **Lạm dụng Glow Ambient, Neon Cyan/Blue gradients & Badge lặp lại**, visual noise cao |
| 9 | Error Recovery | n/a | Không áp dụng cho Landing Page đọc |
| 10 | Help and Documentation | 3/4 | Thông tin liên hệ, link HPC Lab & thông báo HPC Notice hiển thị minh bạch |
| **Total** | | **18/28** | **Acceptable (64.2% - Cần tinh chỉnh ranh giới thiết kế)** |

---

### Mức Độ "AI-Slop" Analysis (Đánh Giá Chuyên Sâu)

#### 1. Lạm dụng CyberBadge (Badge Spam)
- **Tình trạng:** Hầu hết mọi thẻ, tiêu đề section hay item đều gắn `CyberBadge` với sắc thái ngẫu nhiên (Blue, Cyan, Emerald, Amber, Violet).
- **Vấn đề AI-Slop:** AI generator có xu hướng thêm 1 badge ở trên mọi tiêu đề `h3`/`h2` để "làm đẹp trống không gian". Điều này khiến badge mất đi tính năng phân loại (classification/status) và trở thành visual clutter (rác thị giác).

#### 2. Đồng bộ hóa "TerminalCard" & Khung container bo tròn (Round Container Fatigue)
- **Tình trạng:** Từ `HeroVisualCore`, `AboutValueGrid`, `ActivityCard` cho tới `Projects`, tất cả đều được bọc trong `TerminalCard` với `rounded-2xl`, `backdrop-blur-md`, và shadow/border xanh nhạt.
- **Vấn đề AI-Slop:** Mọi component đều nhốt trong card khiến bố cục bị đóng khung (boxed layout), thiếu sự phá cách về nhịp điệu không gian (spatial rhythm) và tương phản bề mặt (flat vs elevated contrast).

#### 3. Hiệu ứng Glow Ambient & Gradient Cyan/Blue quá đà
- **Tình trạng:** Background của trang ngập tràn `radial-gradient` từ `blue-500/5`, `cyan-950/15`, kết hợp hover shadow `shadow-[0_8px_30px_rgba(34,211,238,0.12)]`.
- **Vấn đề AI-Slop:** Đây là "chữ ký" điển hình của các template AI Dark Mode (Vite/NextJS default AI outputs). Việc dùng neon glow tràn lan không tạo thêm điểm nhấn (visual focal point) mà làm mờ mắt người dùng.

#### 4. Micro-animations & Motion chưa tối ưu
- **Tình trạng:** Tất cả thẻ đều có chung pattern `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` với staggered delay nhẹ.
- **Vấn đề AI-Slop:** Motion mang tính công thức, thiếu các tương tác có mục đích (directional micro-interactions, layout morphing, hoặc sticky progress cues).

---

### Priority Issues (Danh sách ưu tiên xử lý)

#### [P1] Tinh giảm & Tái định nghĩa CyberBadge
- **Why it matters:** Badge xuất hiện quá dày đặc làm giảm giá trị của thông tin quan trọng.
- **Fix:** Chỉ giữ badge cho thông số trạng thái thật (VD: `OPERATIONAL`, `Publication Year`, `Lab Status`). Loại bỏ badge khỏi các card thông tin chung hoặc chuyển thành dạng typographic tag đơn giản.
- **Suggested command:** `$impeccable distill`

#### [P1] Phá vỡ cấu trúc Card gò bó (Unbox Layout Rhythm)
- **Why it matters:** Giao diện bị "bội thực container bo tròn `rounded-2xl`".
- **Fix:** Kết hợp giữa các section dạng `Border-bleed`, `Minimal Grid` không viền, và chỉ dùng `TerminalCard` cho dữ liệu thực sự là code/telemetry/terminal.
- **Suggested command:** `$impeccable layout`

#### [P2] Mềm hóa Ambient Glow & Đa dạng sắc thái Color Palette
- **Why it matters:** Tông màu Dark Cyan / Deep Blue gradient hiện tại tạo cảm giác AI template đại trà.
- **Fix:** Sử dụng bảng màu Slate/Zinc sâu lắng hơn, dùng màu nhấn (accent color) có tiết chế hơn (chỉ dùng cyan/blue cho primary CTAs và active nodes).
- **Suggested command:** `$impeccable colorize`

#### [P2] Nâng cấp Micro-Interactions & Visual Hierarchy
- **Why it matters:** Motion đều đặn giống nhau tạo cảm giác lặp lại nhàm chán.
- **Fix:** Thêm hiệu ứng hover riêng cho code snippet, parallax nhẹ cho các khối hình ảnh, và cải thiện typography hierarchy.
- **Suggested command:** `$impeccable animate`

---

### Persona Red Flags

- **Jordan (First-Timer / Tân sinh viên):** Bị choợp bởi quá nhiều hiệu ứng phát sáng (glow) và badge màu sắc, khó tập trung vào nội dung chính "CLB làm gì và đăng ký thế nào".
- **Alex (Power User / Senior Tech Lead):** Nhìn thấy ngay cấu trúc template card kinh điển của AI code-gen, giảm bớt ấn tượng về tính nguyên bản và độ chuyên nghiệp của CLB Dữ Liệu Lớn.

---

### Trend Status
First run for `src-app-landing-page-tsx`, baseline score: **18/28**.
