# BDC Hub - Design & Architecture References Hub

> **Single Source of Truth** cho toàn bộ hệ thống tài liệu thiết kế (UI/UX), kiến trúc giao diện, thông số kỹ thuật component, quy tắc thiết kế (design system tokens), và báo cáo kỹ thuật trong dự án BDCHub Frontend.

---

## 📐 Nguyên Tắc Quản Lý Documentation

1. **Thứ tự ưu tiên (Source of Truth Hierarchy):**  
   $$\text{Design System Guidelines} \longrightarrow \text{Documentation} \longrightarrow \text{Current Implementation}$$  
   *Tài liệu thiết kế quy định chuẩn mực giao diện mong muốn. Nếu implementation thực tế chưa tuân thủ chuẩn, không tự ý hạ chuẩn tài liệu mà giữ tài liệu làm mục tiêu và ghi rõ tình trạng implementation.*

2. **Cấu trúc & Naming Convention:**  
   * Tất cả tài liệu nằm trong thư mục `docs/references/` theo từng nhóm chuyên biệt.
   * Tên file và thư mục tuân thủ định dạng `kebab-case`.

---

## 🗂️ Thư Mục & Danh Mục Tài Liệu

### 1. 🎨 Design Systems (`design-systems/`)
Quy chuẩn tokens, bảng màu, typography, spacing, dark/light mode và component guidelines dùng chung cho toàn bộ dự án và các phân hệ.

| Tài liệu | Mô tả & Phạm vi | Đối tượng áp dụng | Trạng thái |
|---|---|---|---|
| [BDC Design Rhythm v3.0](file:///home/thanh/BDCHub---Frontend/docs/references/design-systems/bdc-design-rhythm-v3.md) | **Tài liệu chuẩn cốt lõi v3.0** cho BDC Hub (Enterprise AI · Academic Intelligence). Quy định hệ màu Blue-Navy (`#050B18`), paired tokens, typography, component rules. | Toàn bộ Frontend | **Master Spec** |
| [LMS Student Design System](file:///home/thanh/BDCHub---Frontend/docs/references/design-systems/lms-design-system.md) | Chuẩn giao diện phân hệ Học viên (LMS Student): Role selection, grid paper background (`.bg-grid-paper`), dark-first tokens. | `(learning)/lms/student` | Active Spec |
| [LMS Teacher Design System](file:///home/thanh/BDCHub---Frontend/docs/references/design-systems/lms-teacher-design-system.md) | Chuẩn giao diện phân hệ Giảng viên ("Academic Control Center"): Dense analytics grid, course workspace tabs, action badges. | `(learning)/lms/teacher` | Active Spec |
| [HPC Summer School Design System](file:///home/thanh/BDCHub---Frontend/docs/references/design-systems/hpc-summer-school-design-system.md) | Chuẩn thiết kế Tech-Modernist cho trang đăng ký HCMUT HPC School 2026: Glassmorphism, Integrated Stepper, Toast nổi. | `(standalone)/hpc-summer-school` | Active Spec |

---

### 2. 🧩 Module Specifications (`module-specs/`)
Tài liệu chi tiết về cấu trúc layout, cơ chế hoạt ảnh và ngôn ngữ hình ảnh cho các module cụ thể.

| Tài liệu | Mô tả & Phạm vi | File liên quan |
|---|---|---|
| [Hero & Stats Redesign Spec](file:///home/thanh/BDCHub---Frontend/docs/references/module-specs/hero-redesign-spec.md) | Thiết kế 2-Column Split-Screen Hero & Floating Glassmorphic Stats Cards trên Landing Page. | `src/components/home/hero/` |
| [Cosmic Background System](file:///home/thanh/BDCHub---Frontend/docs/references/module-specs/cosmic-background-system.md) | Kiến trúc background sao động Web Worker ("Zero Main-Thread Impact") dùng `OffscreenCanvas`. | `src/components/layout/Background.tsx` |
| [LMS Comic/Retro Effects](file:///home/thanh/BDCHub---Frontend/docs/references/module-specs/lms-comic-effects.md) | Quy định các hiệu ứng tương tác tactile: Hard Shadow Shift, Accent Line Draw, Halftone texture. | `components/lms/shared/` & Storybook |

---

### 3. 🌐 External References (`external/`)
Các thiết kế mẫu, cảm hứng thẩm mỹ hoặc theme tham chiếu ngoài hệ thống.

| Tài liệu | Mô tả | Ứng dụng |
|---|---|---|
| [Signal-Ledger Design](file:///home/thanh/BDCHub---Frontend/docs/references/external/signal-ledger-design.md) | Phân tích thiết kế Signal Ledger Dashboard (Accent `#4B4BA0`, Glass framing, WebGL wave field). | Tham chiếu background & layout rhythm |

---

### 4. 🛠️ Technical Reports & Guides (`technical-reports/`)
Báo cáo kỹ thuật hậu kiểm (Post-mortems), kết quả điều nghiên R&D, và hướng dẫn kiểm thử.

| Tài liệu | Mô tả | Phân loại |
|---|---|---|
| [Hero Stats Animation Fix](file:///home/thanh/BDCHub---Frontend/docs/references/technical-reports/hero-stats-animation-issue.md) | Báo cáo khắc phục lỗi animation xuất hiện đột ngột của thẻ Hero Stats bằng Triple-Layer CSS Animation. | Post-Mortem |
| [LMS Learn Page Layout Container Alignment](file:///home/thanh/BDCHub---Frontend/docs/references/technical-reports/lms-student-layout-issue.md) | Khắc phục lỗi căn lề và lệch trục khoảng trắng trên màn hình lớn cho trang học LMS Student Course Learn. | Bug Investigation |
| [LMS Scroll Snap R&D Investigation](file:///home/thanh/BDCHub---Frontend/docs/references/technical-reports/lms-scroll-snap-investigation.md) | Nghiên cứu thử nghiệm và giải pháp JavaScript Scroll listener cho tính năng tự động snap cuộn. | R&D Investigation |
| [Playwright & Storybook Testing Guide](file:///home/thanh/BDCHub---Frontend/docs/references/technical-reports/playwright-testing-guide.md) | Hướng dẫn kiểm thử E2E Playwright trên Next.js App (cổng 3000) và Storybook (cổng 6006). | Testing Guide |

---

## 🔗 Liên Kết Nhanh Cho Developers

* **BDC Design System:** [bdc-design-rhythm-v3.md](file:///home/thanh/BDCHub---Frontend/docs/references/design-systems/bdc-design-rhythm-v3.md)
* **LMS Product Spec:** [PRODUCT.md](file:///home/thanh/BDCHub---Frontend/src/app/(learning)/lms/PRODUCT.md)
* **Developer Skill:** [SKILL.md](file:///home/thanh/BDCHub---Frontend/.agents/skills/bdc-frontend/SKILL.md)
