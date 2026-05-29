# BDC Landing Page — Deep Audit & Refactor Plan v2

> Phân tích toàn bộ mã nguồn landing page, đối chiếu **DESIGN_RYMTH.md v3.0**, **bdc-frontend skill**, **interaction-design skill**, **animate-text skill**, **ui-ux-pro-max skill**, và **frontend-design skill**.

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Audit chi tiết](#2-audit-chi-tiết)
3. [Nhận xét về DESIGN_RYMTH.md](#3-nhận-xét-về-design_rymthmd)
4. [Kế hoạch Refactor 5 giai đoạn](#4-kế-hoạch-refactor-5-giai-đoạn)
5. [Verification Plan](#5-verification-plan)

---

## 1. Tổng quan kiến trúc

### File map hiện tại

```
src/app/(landing)/
├── layout.tsx          → LandingLayout (Background + Navbar + Footer)
├── page.tsx            → "use client" — compose Hero, About, Activities, Projects

src/components/home/
├── Hero.tsx            → Stats cards, CTA buttons, scroll indicator
├── About.tsx           → CLB intro + 4 value cards
├── Activities.tsx      → 7 activity cards from clubData.json
├── Projects.tsx        → Project list + Publications list
├── Members.tsx         → Team grid (currently commented out)

src/components/layout/
├── Background.tsx      → Canvas star-field (422 lines, ~15KB)
├── Navbar.tsx          → Fixed nav with scroll effect
├── Footer.tsx          → Simple footer with socials
├── ThemeToggle.tsx     → Dark/light toggle
├── Logo.tsx            → BDC logo

src/hooks/animation/
├── useScrollAnimation.ts → IntersectionObserver one-shot reveal

src/data/
├── clubData.json       → All landing page content (21KB)
```

### Dependency stack (animation-related)

| Package | Version | Dùng ở landing? |
|---|---|---|
| `framer-motion` | ^12.23.24 | ❌ Không — chỉ dùng ở settings + LMS |
| `tailwindcss-animate` | ^1.0.7 | ❌ Không import trong landing |
| CSS keyframes (globals.css) | — | ⚠️ Khai báo nhiều nhưng landing không dùng |

---

## 2. Audit chi tiết

### 2.1 Tuân thủ DESIGN_RYMTH.md

#### ✅ Điểm đạt

| Tiêu chí | Hiện trạng |
|---|---|
| Navy palette dark mode | `#0F1E35`, `#0A1628` — đúng spec |
| Card border dark | `border-blue-500/10` — đúng |
| Card border hover | `border-blue-500/25` — đúng |
| Primary button | `bg-blue-600 hover:bg-blue-700` — đúng |
| Badge/Tag pattern | Matching spec §5.4 |
| ThemeToggle | Đúng spec §8, có `active:scale-95` |
| Body text pair | `text-slate-600 dark:text-slate-300` — đúng |

#### ❌ Vi phạm nghiêm trọng

| # | Vấn đề | File | Spec vi phạm |
|---|---|---|---|
| **V1** | **`backdrop-blur-sm` trên tất cả content cards** (About ×2, Activities ×1, Projects ×1, Hero stats) | All home components | §9 Anti-Pattern: "backdrop-blur trên sidebar/navbar → dùng solid bg". Cards cũng nên solid |
| **V2** | **Semi-transparent card bg** (`bg-white/80`, `dark:bg-[#0F1E35]/70`) thay vì solid | All home components | §5.1 Standard Card: `bg-white dark:bg-[#0F1E35]` — **không có opacity** |
| **V3** | **Navbar dùng `backdrop-blur-md`** khi scrolled | Navbar.tsx:38 | §9: "backdrop-blur trên Sidebar/Navbar → dùng solid bg" |
| **V4** | **Footer dùng `backdrop-blur-md`** | Footer.tsx:18 | §9: Tương tự Navbar |
| **V5** | **Hero H1 không dùng gradient text** trong dark mode | Hero.tsx:15 | §4: "Hero H1 dùng gradient text trong dark mode" — `from-blue-400 to-cyan-400` |
| **V6** | **`defaultTheme="light"`** trong MainProvider | MainProvider.tsx:43 | §8: spec nói `defaultTheme="dark"` |
| **V7** | **Section headers copy-paste**, không dùng shared component | About, Activities, Projects | §5.5: Nên dùng Pipeline-style Section Header component |

#### ⚠️ Vi phạm nhẹ

| # | Vấn đề | File | Ghi chú |
|---|---|---|---|
| W1 | H2 dùng `text-3xl` thay vì `text-2xl` | All sections | §4: H2 = `text-2xl font-bold` — nhưng landing có thể cần lớn hơn (xem §3) |
| W2 | Hero title `text-5xl sm:text-6xl` | Hero.tsx:15 | §4: H1 = `text-3xl md:text-4xl` — quá nhỏ cho Hero, spec cần update |
| W3 | Hover lift inconsistent: `-translate-y-0.5`, `-translate-y-1`, `-translate-y-1.5` | Multiple files | Cần chuẩn hóa |
| W4 | Projects dùng `rounded-xl` thay vì `rounded-2xl` | Projects.tsx:31 | §9: "rounded-2xl cho card" |

---

### 2.2 Animation & Performance

| # | Vấn đề | Severity | Chi tiết |
|---|---|---|---|
| **A1** | **Background.tsx O(n²) constellation** — chạy mỗi frame | 🔴 High | ~800 stars trên FHD → ~160K distance checks/frame |
| **A2** | **`useScrollAnimation` quá đơn giản** — chỉ fade-in, không stagger | 🟡 Medium | Tất cả sections xuất hiện cùng lúc nếu viewport lớn |
| **A3** | **Framer Motion installed nhưng không dùng** ở landing | 🟡 Medium | Bundle size concern |
| **A4** | **globals.css: 10+ dead keyframes** | 🟡 Medium | `animate-float`, `animate-cosmic-drift`, `animate-shimmer` v.v. không dùng ở landing |
| **A5** | **Thiếu `prefers-reduced-motion`** hoàn toàn trong cả project | 🔴 High | interaction-design skill: "MUST respect prefers-reduced-motion" |
| **A6** | **Scroll reveal timing đồng nhất** (`duration-700`) | 🟡 Medium | Thiếu choreography — không stagger giữa các section |

#### Đề xuất animation strategy

Theo **interaction-design skill** và **animate-text skill**:

- **Hero title**: `soft-blur-in` hoặc `fade-in-up` effect
- **Stats cards**: Stagger reveal với `animation-delay` tăng dần (50-100ms/card)
- **Section content**: Framer Motion `whileInView` + stagger children
- **Cards**: CSS-only `hover:translate + shadow` giữ nguyên (performance tốt)
- **Thêm** `@media (prefers-reduced-motion: reduce)` global rule

---

### 2.3 Accessibility (WCAG AA)

| # | Issue | File | Severity |
|---|---|---|---|
| AC1 | Zero `aria-label` trên landing components | All home/* | 🔴 |
| AC2 | Project cards dùng `onClick` trên `div` — không keyboard accessible | Projects.tsx:30 | 🔴 |
| AC3 | Thiếu `prefers-reduced-motion` media query | globals.css | 🔴 |
| AC4 | Hero scroll indicator `<a>` thiếu descriptive label | Hero.tsx:72 | 🟡 |
| AC5 | Navbar nav links thiếu `aria-current` | Navbar.tsx | 🟡 |

---

### 2.4 Architecture & Code Quality

| # | Issue | Severity |
|---|---|---|
| **Q1** | `page.tsx` dùng `"use client"` — **mất SSR/SEO** cho landing page | 🔴 |
| **Q2** | Section header code duplicated 4 lần (~12 lines each) | 🟡 |
| **Q3** | No landing-specific `SectionHeader` (dashboard và LMS có riêng) | 🟡 |
| **Q4** | `Members.tsx` commented out nhưng vẫn import | 🟢 |
| **Q5** | Nhiều `clubData.json` image URLs dùng placeholder Google Drive IDs | 🟡 |
| **Q6** | `SafeImage` thiếu `sizes` prop cho responsive optimization | 🟡 |

### 2.5 Audit Nội dung & Bố cục (Copywriting & IA)

| # | Vấn đề | File | Severity | Chi tiết |
|---|---|---|---|---|
| **C1** | **Mâu thuẫn Core Values** | About.tsx | 🔴 High | Thẻ "Học Hỏi Không Ngừng" đi kèm mô tả "Trân trọng điểm mạnh của từng cá nhân" (lệch pha hoàn toàn) |
| **C2** | **Sai mô tả hoạt động** | Activities.tsx | 🔴 High | "BDC Data Hackathon" bị copy nhầm mô tả của chương trình Mentoring/Bonding |
| **C3** | **Bỏ quên Ban cố vấn (Mentors)** | Members.tsx | 🔴 High | Dữ liệu cố vấn cực kỳ uy tín (PGS.TS Thoại Nam, thầy Đăng, thầy Thanh) bị bỏ quên, không hiển thị |
| **C4** | **CTA Hero đơn điệu** | Hero.tsx | 🟡 Medium | Chỉ có 1 nút CTA "Tìm hiểu thêm" cho khách vãng lai, thiếu CTA phụ thu hút |
| **C5** | **Thiếu dải logo Bảo trợ học thuật** | page.tsx / About.tsx | 🟡 Medium | Thiếu logo HPC Lab và trường ĐH Bách Khoa (HCMUT) để tạo độ chính quy học thuật |
| **C6** | **Thiếu Final CTA ở cuối trang** | page.tsx | 🟡 Medium | Cuộn hết trang không có nút hành động chốt hạ, giảm tỷ lệ chuyển đổi |
| **C7** | **Trang bị kéo dài quá mức (Bloating)** | Members.tsx | 🟡 Medium | Show toàn bộ 30+ Research members làm loãng trang chủ, cần thu gọn và tách trang riêng |

---

## 3. Nhận xét về DESIGN_RYMTH.md

> **IMPORTANT**: Một số quy tắc trong DESIGN_RYMTH.md thiết kế cho Dashboard/LMS nhưng chưa phù hợp cho Landing Page.

### 3.1 Cần cập nhật

| # | Mục hiện tại | Vấn đề | Đề xuất |
|---|---|---|---|
| **D1** | §4: H1 = `text-3xl md:text-4xl` | Quá nhỏ cho Hero landing — phù hợp Dashboard title thôi | Thêm Landing Hero H1 = `text-4xl sm:text-5xl md:text-6xl font-extrabold` |
| **D2** | §4: H2 = `text-2xl font-bold` | Landing section headers cần lớn hơn | Landing H2 = `text-3xl font-bold` |
| **D3** | §8: `defaultTheme="dark"` | Code thực tế là `"light"` — **mâu thuẫn** | Cần quyết định và đồng bộ |
| **D4** | §9: backdrop-blur chỉ nhắc "Sidebar/Navbar" | Thiếu coverage cho content cards | Mở rộng: "Không dùng trên content cards, sidebar, navbar. Chỉ Auth cards + Modals" |
| **D5** | §5.5: Chỉ centered pipeline header | Landing cần left-aligned variant có icon | Thêm left-aligned variant |
| **D6** | Thiếu: Landing Page Patterns | Không có section hướng dẫn Landing | Thêm section "Landing Page Components" |
| **D7** | Thiếu: Animation Guidelines | Không đề cập motion timing | Thêm section "Motion & Animation" với timing + reduced-motion |
| **D8** | §5.10: Background.tsx | Không đề cập performance budget | Thêm note star count caps và constellation optimization |

### 3.2 Mâu thuẫn

| Mâu thuẫn | Chi tiết |
|---|---|
| `defaultTheme` | §8 nói `"dark"` nhưng code là `"light"` |
| `backdrop-blur` scope | §5.10 cho phép Auth cards dùng `backdrop-blur-xl`, §9 cấm Navbar — Landing đang dùng kiểu Auth cho content cards |
| Card bg opacity | §5.1 Standard Card dùng solid `bg-white` nhưng §5.10 Auth Card dùng `bg-white/90` — Landing cards đang dùng kiểu Auth thay vì Standard |

---

## 4. Kế hoạch Refactor 5 giai đoạn

### Phase 1: Foundation — Common Components & CSS

#### [NEW] `src/components/common/SectionHeader.tsx`
- Component chuẩn hóa Pipeline-style header
- Props: `icon` (LucideIcon), `title` (string), `centered?` (boolean)
- Variants: left-aligned (default cho landing) | centered (Members)
- Thay thế 4 khối code trùng lặp

#### [NEW] `src/components/common/AcademicPartners.tsx`
- Dải logo đối tác/bảo trợ học thuật (HCMUT, HPC Lab)
- Thiết kế mờ nhẹ sang trọng, tối giản phù hợp thẩm mỹ cao cấp

#### [NEW] `src/components/common/FinalCTA.tsx`
- Banner kêu gọi đăng ký/liên hệ chốt ở cuối trang trước Footer
- Kích thích tương tác (conversion rate)

#### [MODIFY] `src/app/globals.css`
- **Thêm** `@media (prefers-reduced-motion: reduce)` global rule
- Cleanup: Đánh dấu dead keyframes
- Thêm CSS variables cho animation timing scale

#### [MODIFY] `src/hooks/animation/useScrollAnimation.ts`
- Thêm `staggerIndex` param cho delay giữa các section
- Respect `prefers-reduced-motion`
- Hoặc chuyển sang Framer Motion `whileInView` (đã install)

---

### Phase 2: Hero Section Enhancement

#### [MODIFY] `src/components/home/Hero.tsx`

| Thay đổi | Trước | Sau |
|---|---|---|
| Title gradient | `dark:text-white` | `dark:bg-gradient-to-r dark:from-blue-400 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent` |
| Stats bg | `bg-white/60 backdrop-blur-sm` | `bg-white dark:bg-[#0F1E35]` (solid) |
| Stats values | Thống kê cũ | Cập nhật Stats: Thêm mảng `"7+ Công bố khoa học"` thay vì chỉ số phụ ít nổi bật |
| CTA buttons | 1 nút CTA cho khách vãng lai | Bổ sung CTA kép (ví dụ: "Tìm hiểu thêm" + "Dự án nổi bật") cho khách chưa đăng nhập |
| Stats hover | inconsistent values | Chuẩn hóa `-translate-y-1` |
| Animation | None | Framer Motion stagger reveal cho stats |

---

### Phase 3: Content Sections Cleanup

#### [MODIFY] `src/components/home/About.tsx`
- Dùng `<SectionHeader>` — replace 8 lines header code
- Card bg → solid `bg-white dark:bg-[#0F1E35]` — bỏ opacity + backdrop-blur
- Hover lift → consistent `-translate-y-1`
- **Sửa mâu thuẫn Core Values (C1):** Cập nhật mô tả "Học Hỏi Không Ngừng" khớp với tiêu đề học thuật.

#### [MODIFY] `src/components/home/Activities.tsx`
- Dùng `<SectionHeader>` — replace header code
- Card bg → solid — bỏ backdrop-blur
- Stagger animation cho cards khi scroll vào view
- **Cân đối số lượng Grid (C2):** Hiển thị đúng 6 hoạt động tiêu biểu nhất (2 hàng x 3 cột) thay vì 7 để cân bằng thị giác.
- **Sửa mô tả Hackathon:** Thay mô tả đúng tính chất cuộc thi code thực chiến thay vì Mentoring.

#### [MODIFY] `src/components/home/Projects.tsx`
- Dùng `<SectionHeader>` × 2
- Card bg → solid — bỏ backdrop-blur
- `rounded-xl` → `rounded-2xl`
- **Clickable div → `<Link>`** — fix keyboard accessibility (AC2)
- **Vô hiệu hóa link dự án rỗng:** Tránh dẫn link hỏng về trang trống `/`.

#### [MODIFY] `src/components/home/Members.tsx`
- Quyết định: Re-enable và cấu trúc lại toàn bộ.
- **Hiển thị Ban Cố Vấn (Mentors - C3):** Thêm khu vực trang trọng ở đầu ban thành viên.
- **Tối ưu chiều dài trang (C7):** Chỉ hiển thị Leads/Core team trên trang chủ, thiết kế nút `"Xem toàn bộ thành viên"` dẫn sang trang riêng biệt `/about/members`.

---

### Phase 4: Layout Shell Fixes

#### [MODIFY] `src/components/layout/Navbar.tsx`
- Scrolled state: `bg-white/90 backdrop-blur-md` → `bg-white dark:bg-[#070E1C]` **solid**
- Verify mobile menu trigger (hiện thiếu hamburger trên < md)

#### [MODIFY] `src/components/layout/Footer.tsx`
- Footer bg: `bg-white/80 backdrop-blur-md` → `bg-white dark:bg-[#070E1C]` **solid**

#### [MODIFY] `src/app/(landing)/layout.tsx`
- Move Footer inside `flex flex-col min-h-screen` cho sticky bottom

---

### Phase 5: Performance & Polish

#### [MODIFY] `src/components/layout/Background.tsx`
- Spatial grid cho constellations: O(n²) → O(n)
- Star count cap: mobile max 150, desktop max 400
- Disable animations khi `prefers-reduced-motion`
- Throttle pointermove

#### [MODIFY] `src/app/(landing)/page.tsx`
- **Remove `"use client"`** — landing nên Server Component cho SEO
- Mỗi child component đã có `"use client"` riêng
- Thêm SEO metadata (title, description, OG tags)

#### [MODIFY/DECIDE] `src/providers/MainProvider.tsx`
- Quyết định `defaultTheme`: `"dark"` (theo spec) hay `"light"` (hiện tại)
- Cập nhật spec nếu giữ light

---

## 5. Verification Plan

### Automated
```bash
npm run build        # Build check
npm run lint         # Lint
npx tsc --noEmit     # Type check
```

### Browser Testing
- [ ] Landing page loads < 3s (LCP)
- [ ] Dark mode toggle hoạt động ở mọi section
- [ ] Scroll animations fire đúng timing
- [ ] Responsive: 375px / 768px / 1024px / 1440px
- [ ] Keyboard Tab qua tất cả interactive elements
- [ ] `prefers-reduced-motion: reduce` → animations disabled
- [ ] Background canvas FPS > 30 trên mobile
- [ ] No layout shift (CLS < 0.1)

### Visual Checklist
- [ ] Cards dùng solid bg (không backdrop-blur)
- [ ] Hero title có gradient text trong dark mode
- [ ] Section headers đồng nhất (SectionHeader component)
- [ ] Hover lift consistent (`-translate-y-1`)
- [ ] Navbar/Footer solid bg khi scroll

---

## Tóm tắt ưu tiên

| Priority | Items | Impact |
|---|---|---|
| 🔴 **P0** | **Kỹ thuật:** V1-V4 (solid bg), A5 (reduced-motion), AC2 (keyboard), Q1 (SSR) <br>**Nội dung:** C1 (sửa Core Value), C2 (sửa mô tả Hackathon), C3 (hiển thị Mentors), vô hiệu hóa link dự án rỗng | Design compliance + A11y + SEO + Độ uy tín học thuật cốt lõi |
| 🟠 **P1** | **Kỹ thuật:** V5 (Hero gradient), V7 (SectionHeader), A1 (Background perf) <br>**Nội dung:** C4 (CTA Hero kép), C7 (Tách trang chi tiết thành viên để chống bloating trang chủ) | Visual identity + Performance + UX Scroll |
| 🟡 **P2** | **Kỹ thuật:** Animation stagger, responsive polish <br>**Nội dung:** C5 (logo HPC Lab / HCMUT), C6 (Final CTA chốt trang), chuyển đổi link ảnh Google Drive sang local | UX Enhancement + Hoàn thiện phễu chuyển đổi + Tải trang ổn định |
| 🟢 **P3** | DESIGN_RYMTH.md updates (D1-D8) | Documentation |
