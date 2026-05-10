# BDC — Design Rhythm: Developer Guide

*Tài liệu chuẩn hóa UI/UX cho các dự án của Big Data Club (BDC). Mục tiêu: đồng bộ, chuyên nghiệp, tối ưu hóa hiệu suất đội Frontend.*

---

## 1. Triết lý thiết kế (Core Mindset)

* **Academic & Minimal** — giao diện mang tính học thuật, chuyên nghiệp và tinh giản; tránh phô trương.
* **Data-First** — nội dung (văn bản, số liệu) là nhân vật chính; UI là nền, dẫn dắt ánh nhìn.
* **Basic is the Best** — ưu tiên style cơ bản, sạch sẽ; hạn chế bóng đổ dày, viền kép, gradient rực rỡ.

---

## 2. Hệ thống màu sắc (Color System)

Sử dụng palette mặc định của Tailwind CSS.

| Mục đích           |  Tailwind class |       Hex |
| ------------------ | --------------: | --------: |
| Primary background |   `bg-blue-600` | `#2563eb` |
| Primary hover      |   `bg-blue-700` | `#1d4ed8` |
| Accent text / link | `text-blue-600` | `#2563eb` |
| Light primary bg   |    `bg-blue-50` | `#eff6ff` |

**Neutral (Slate)** — ưu tiên Slate để tạo cảm giác công nghệ, hiện đại:

| Purpose           |              Class |       Hex |
| ----------------- | -----------------: | --------: |
| Page background   |      `bg-slate-50` | `#f8fafc` |
| Card background   |         `bg-white` | `#ffffff` |
| Card border       | `border-slate-200` | `#e2e8f0` |
| Input border      | `border-slate-300` | `#cbd5e1` |
| Heading text      |   `text-slate-900` | `#0f172a` |
| Body text         |   `text-slate-600` | `#475569` |
| Caption / subtext |   `text-slate-500` | `#64748b` |
| Placeholder       |   `text-slate-400` | `#94a3b8` |

**Semantic colors:**

* Danger / Error: `text-red-500`, `bg-red-50`, `border-red-500`
* Success: `text-green-600`, `bg-green-50`
* Warning: `text-yellow-600`, `bg-yellow-50`

---

## 3. Dark Mode

Dark mode dùng class strategy (`dark:`) của Tailwind. Toggle qua `next-themes` với `attribute="class"`.

**Nguyên tắc dark mode:**
- Không đảo màu hoàn toàn — giữ tỷ lệ tương phản tương tự light mode
- Background tối nhất ở cấp layout; sáng dần lên card → input
- Blue-600 giữ nguyên cho primary action — đủ contrast trên nền tối
- Không dùng white text thuần trên nền quá tối; dùng `slate-100` / `slate-200`

### Dark Mode Token Mapping

| Role              | Light                  | Dark                        |
| ----------------- | ---------------------- | --------------------------- |
| Page background   | `bg-slate-50`          | `dark:bg-slate-950`         |
| Layout / Sidebar  | `bg-white`             | `dark:bg-slate-900`         |
| Card background   | `bg-white`             | `dark:bg-slate-900`         |
| Card border       | `border-slate-200`     | `dark:border-slate-800`     |
| Input background  | `bg-slate-50`          | `dark:bg-slate-800`         |
| Input border      | `border-slate-300`     | `dark:border-slate-700`     |
| Heading text      | `text-slate-900`       | `dark:text-slate-50`        |
| Body text         | `text-slate-600`       | `dark:text-slate-400`       |
| Caption / subtext | `text-slate-500`       | `dark:text-slate-500`       |
| Placeholder       | `text-slate-400`       | `dark:text-slate-600`       |
| Divider / border  | `border-slate-200`     | `dark:border-slate-800`     |
| Active nav item   | `bg-blue-600 text-white` | `dark:bg-blue-600 dark:text-white` (giữ nguyên) |
| Hover state       | `hover:bg-slate-100`   | `dark:hover:bg-slate-800`   |
| Ghost button text | `text-slate-600`       | `dark:text-slate-400`       |
| Danger            | `text-red-500 bg-red-50` | `dark:text-red-400 dark:bg-red-950/40` |

### Cách áp dụng chuẩn

```jsx
<aside className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
  <h3 className="text-slate-900 dark:text-slate-50">Title</h3>
  <p className="text-slate-500 dark:text-slate-400">Subtext</p>
  <div className="border-t border-slate-200 dark:border-slate-800" />
</aside>
```

### Theme Toggle

Dùng `useTheme()` từ `next-themes`. Chỉ render icon sau mount để tránh hydration mismatch:

```tsx
const { theme, setTheme } = useTheme();
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

// Render:
{mounted && (theme === "dark" ? <Sun /> : <Moon />)}
```

---

## 4. Typography

* **H1 — Page Title:** `text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight`
* **H2 — Section Title:** `text-2xl font-bold text-slate-900 dark:text-slate-50`
* **H3 — Card Title:** `text-lg font-bold text-slate-800 dark:text-slate-100`
* **Body Text:** `text-base text-slate-600 dark:text-slate-400 leading-relaxed`
* **Subtext / Caption:** `text-sm text-slate-500 dark:text-slate-500`
* **Tag / Label:** `text-xs font-semibold text-blue-600 uppercase tracking-wider`

---

## 5. UI Components

### Cards & Containers

```jsx
<div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Tiêu đề</h3>
  <p className="text-slate-600 dark:text-slate-400">Nội dung</p>
</div>
```

### Inputs & Forms

```jsx
<input
  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3.5
             text-slate-900 dark:text-slate-100 placeholder:text-slate-400
             bg-slate-50 dark:bg-slate-800
             focus:bg-white dark:focus:bg-slate-900
             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
             transition-all"
/>
```

### Buttons

```jsx
{/* Primary */}
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3 shadow-sm transition-all active:scale-95">
  Hoàn tất
</button>

{/* Secondary */}
<button className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-6 py-3 font-medium transition-all active:scale-95">
  Quay lại
</button>

{/* Ghost */}
<button className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-4 py-2 font-medium transition-all">
  Hủy
</button>
```

---

## 6. Spacing & Layout

* **Wrapper:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
* **Section spacing:** `py-20` / `py-24`
* **Gaps:** `gap-4`, `gap-6`, `gap-8`
* **Transitions:** `transition-all duration-200` / `duration-300`

---

## 7. Anti-Patterns — Tuyệt đối tránh

1. **Glassmorphism:** không dùng `backdrop-blur` + nền trong suốt cho layout/sidebar/navbar
2. **Viền kép / đậm:** ưu tiên `rounded-xl` / `rounded-2xl` với `border-slate-200 dark:border-slate-800`
3. **Căn giữa đoạn văn dài:** chỉ tiêu đề dùng `text-center`; mô tả ≥3 dòng phải `text-left`
4. **Gradient rực rỡ:** không dùng gradient nhiều màu; chỉ solid hoặc cùng dải (nhạt→đậm)
5. **Hardcode data:** data phải từ `.json` / API; UI chỉ render
6. **Icon thừa:** mỗi action chỉ dùng icon khi collapsed; khi expanded ưu tiên text label rõ nghĩa

---

## 8. Checklist triển khai (Developer)

* [ ] Palette Tailwind chuẩn hóa — không thêm màu nếu chưa có approval
* [ ] Typography classes cố định cho mọi vai trò heading/body/caption
* [ ] Dark mode: thêm `dark:` variant cho mọi màu nền, chữ, border
* [ ] Input: `focus:ring-blue-500/20` + `dark:bg-slate-800`
* [ ] Button: `active:scale-95` + `transition-all`
* [ ] Card: `rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm`
* [ ] Accessibility: contrast đủ, keyboard focus, aria labels