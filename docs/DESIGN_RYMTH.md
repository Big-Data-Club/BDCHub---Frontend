# BDC - Design Rhythm v3.0
## Enterprise AI · Academic Intelligence · Precision-First

> Tài liệu chuẩn hóa UI/UX cho Big Data Club.
> Phong cách tham chiếu: AI-native enterprise (Tencent Cloud · ByteDance · AWS re:Invent).
> Mọi component phải hoạt động hoàn hảo ở cả **dark mode** và **light mode**.

---

## 1. Triết lý thiết kế cốt lõi

```
Minimal Structure.  Massive Clarity.
AI-Native Identity. Enterprise Precision.
```

### Ba trụ cột

| Trụ cột | Ý nghĩa | Biểu hiện trong UI |
|---|---|---|
| **Academic & Minimal** | Giao diện học thuật, tinh giản | Tránh màu loè loẹt, gradient dày đặc |
| **Data-First** | Nội dung là nhân vật chính | Typography rõ ràng, spacing rộng |
| **AI-Native** | Mang ngôn ngữ hình ảnh AI | Pipeline cards, step indicators, glow subtle |

### Cảm giác mục tiêu

Giao diện phải **cảm giác như** sản phẩm của một công ty công nghệ lớn - không phải đồ án sinh viên.

✅ Futuristic · Intelligent · Premium · Scalable · Enterprise-ready  
❌ Startup chaos · Infographic clutter · Cartoon UI · Cyberpunk overload

---

## 2. Color System

### 2.1 Dark Mode (Primary - Default cho LMS/Dashboard)

Dark mode là gương mặt đại diện của BDC. Mọi màu phải đủ contrast, không bao giờ thuần đen.

#### Backgrounds - Layered system (tối → sáng)

| Layer | Class / Value | Hex | Dùng cho |
|---|---|---|---|
| Root background | `bg-[#050B18]` | `#050B18` | `<html>`, `<body>` |
| Layout shell | `bg-[#070E1C]` | `#070E1C` | Sidebar, top-nav shell |
| Section bg | `bg-[#0A1628]` | `#0A1628` | Page content area |
| Card level 1 | `bg-[#0F1E35]` | `#0F1E35` | Primary cards |
| Card level 2 | `bg-[#132240]` | `#132240` | Nested cards, modals |
| Input bg | `bg-[#0D192E]` | `#0D192E` | Inputs, selects |
| Hover state | `bg-[#162644]` | `#162644` | hover trên card/row |

> **Rule:** Không dùng `bg-slate-900` / `bg-slate-950` cho dark mode LMS - dùng blue-navy palette trên. `slate` chỉ dùng cho Dashboard (main).

#### Border - Luôn subtle, không bao giờ harsh

| Usage | Value | Tailwind tương đương |
|---|---|---|
| Card border default | `rgba(59,130,246,0.12)` | `border border-blue-500/10` |
| Card border hover | `rgba(59,130,246,0.25)` | `border-blue-500/25` |
| Section divider | `rgba(148,163,184,0.08)` | `border-slate-400/8` |
| Input border | `rgba(59,130,246,0.20)` | `border-blue-500/20` |
| Input border focus | `rgba(6,182,212,0.50)` | `border-cyan-400/50` |

#### Accent Colors

| Role | Class | Hex | Dùng cho |
|---|---|---|---|
| Primary action | `bg-blue-600` | `#2563EB` | Buttons chính, CTA |
| Primary hover | `bg-blue-700` | `#1D4ED8` | Button hover |
| AI Cyan accent | `text-cyan-400` | `#22D3EE` | Pipeline labels, AI badges, step numbers |
| Purple accent | `text-violet-400` | `#A78BFA` | Tags, secondary highlights |
| Gradient hero | `from-blue-400 to-cyan-400` | - | Hero titles, gradient text |

#### Typography - Dark

| Role | Class | Hex |
|---|---|---|
| Heading / Hero | `text-white` | `#FFFFFF` |
| Sub-heading | `text-slate-100` | `#F1F5F9` |
| Body text | `text-slate-300` | `#CBD5E1` |
| Caption / meta | `text-slate-400` | `#94A3B8` |
| Muted / disabled | `text-slate-500` | `#64748B` |
| Cyan label | `text-cyan-400` | `#22D3EE` |
| Violet label | `text-violet-400` | `#A78BFA` |

---

### 2.2 Light Mode (Dashboard / App Shell)

Light mode phải cảm giác **premium enterprise** - không flat, không generic SaaS.

#### Backgrounds - Layered

| Layer | Class | Hex | Dùng cho |
|---|---|---|---|
| Page background | `bg-slate-50` | `#F8FAFC` | Root layout |
| Sidebar / Nav | `bg-white` | `#FFFFFF` | Layout shell |
| Card | `bg-white` | `#FFFFFF` | Primary cards |
| Card subtle | `bg-slate-50` | `#F8FAFC` | Secondary areas |
| Input bg | `bg-slate-50` | `#F8FAFC` | Inputs |
| Input focus bg | `bg-white` | `#FFFFFF` | Input khi focused |

#### Border

| Usage | Class | Hex |
|---|---|---|
| Card border | `border-slate-200` | `#E2E8F0` |
| Card border hover | `border-slate-300` | `#CBD5E1` |
| Input border | `border-slate-300` | `#CBD5E1` |
| Input focus | `border-blue-500` | `#3B82F6` |
| Divider | `border-slate-200` | `#E2E8F0` |

#### Typography - Light

| Role | Class | Hex |
|---|---|---|
| Heading | `text-slate-900` | `#0F172A` |
| Body | `text-slate-600` | `#475569` |
| Caption | `text-slate-500` | `#64748B` |
| Placeholder | `text-slate-400` | `#94A3B8` |
| Primary action | `text-blue-600` | `#2563EB` |

#### Semantic Colors (shared)

| Type | Light | Dark |
|---|---|---|
| Danger | `text-red-500 bg-red-50 border-red-200` | `text-red-400 bg-red-950/40 border-red-800/30` |
| Success | `text-green-600 bg-green-50 border-green-200` | `text-green-400 bg-green-950/40 border-green-800/30` |
| Warning | `text-amber-600 bg-amber-50 border-amber-200` | `text-amber-400 bg-amber-950/40 border-amber-800/30` |
| Info | `text-blue-600 bg-blue-50 border-blue-200` | `text-cyan-400 bg-blue-950/40 border-blue-800/30` |

---

## 3. Dark Mode - Token Mapping đầy đủ

Mọi component đều phải khai báo cặp `light / dark:` - không bao giờ thiếu một bên.

| Role | Light | Dark |
|---|---|---|
| Page bg | `bg-slate-50` | `dark:bg-[#050B18]` |
| Layout shell | `bg-white` | `dark:bg-[#070E1C]` |
| Card bg | `bg-white` | `dark:bg-[#0F1E35]` |
| Card border | `border-slate-200` | `dark:border-blue-500/10` |
| Card border hover | `border-slate-300` | `dark:border-blue-500/25` |
| Input bg | `bg-slate-50` | `dark:bg-[#0D192E]` |
| Input border | `border-slate-300` | `dark:border-blue-500/20` |
| Input focus ring | `ring-blue-500/20` | `dark:ring-cyan-400/20` |
| Heading | `text-slate-900` | `dark:text-white` |
| Body | `text-slate-600` | `dark:text-slate-300` |
| Caption | `text-slate-500` | `dark:text-slate-400` |
| Placeholder | `text-slate-400` | `dark:text-slate-500` |
| Active nav | `bg-blue-600 text-white` | `dark:bg-blue-600 dark:text-white` |
| Hover bg | `hover:bg-slate-100` | `dark:hover:bg-[#162644]` |
| Divider | `border-slate-200` | `dark:border-slate-400/8` |
| Sidebar bg | `bg-white` | `dark:bg-[#070E1C]` |
| Danger bg | `bg-red-50` | `dark:bg-red-950/40` |
| Danger text | `text-red-500` | `dark:text-red-400` |

---

## 4. Typography System

### Scale

| Role | Classes | Notes |
|---|---|---|
| **Hero / H1** | `text-3xl md:text-4xl font-extrabold leading-tight` | Dùng gradient text trong dark mode |
| **Section title / H2** | `text-2xl font-bold leading-snug` | |
| **Card title / H3** | `text-lg font-bold` | |
| **Body** | `text-base leading-relaxed` | |
| **Caption** | `text-sm` | |
| **Badge / Tag** | `text-xs font-semibold uppercase tracking-wider` | |
| **Step number** | `text-lg font-bold` | Dùng cyan/blue color |
| **Pipeline label** | `text-xs font-bold uppercase tracking-widest` | Cyan trong dark, blue-600 trong light |

### Gradient Text (Dark Mode)

```tsx
<h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
  AI Quiz Generator
</h1>
```

### Font Stack

```css
font-family: 'Inter', 'Geist', system-ui, sans-serif;
```

---

## 5. Component Library

### 5.1 Cards

#### Standard Card

```tsx
{/* Light + Dark */}
<div className="
  bg-white dark:bg-[#0F1E35]
  border border-slate-200 dark:border-blue-500/10
  rounded-2xl p-6
  shadow-sm dark:shadow-none
  hover:shadow-md dark:hover:border-blue-500/25
  transition-all duration-300
">
```

#### AI Feature Card (với subtle glow - Dark Only)

```tsx
<div className="
  bg-[#0F1E35]
  border border-blue-500/15
  rounded-2xl p-6
  shadow-[0_0_30px_rgba(37,99,235,0.06)]
  hover:border-blue-500/30
  hover:shadow-[0_0_40px_rgba(37,99,235,0.10)]
  transition-all duration-300
">
```

#### Pipeline Step Card (numbered)

```tsx
<div className="
  bg-white dark:bg-[#0F1E35]
  border border-slate-200 dark:border-blue-500/12
  rounded-xl p-5
  relative
  hover:border-blue-500/30 dark:hover:border-blue-500/30
  transition-all duration-200
">
  {/* Step number badge */}
  <div className="
    w-8 h-8 rounded-full
    border border-slate-300 dark:border-blue-500/30
    bg-slate-50 dark:bg-[#0A1628]
    flex items-center justify-center
    text-sm font-bold
    text-blue-600 dark:text-cyan-400
    mb-4
  ">
    1
  </div>
  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100 mb-1">
    Input Materials
  </h4>
  <p className="text-sm text-slate-500 dark:text-slate-400">
    Upload documents, slides, or videos.
  </p>
</div>
```

---

### 5.2 Buttons

```tsx
{/* Primary */}
<button className="
  bg-blue-600 hover:bg-blue-700
  text-white font-semibold
  rounded-xl px-6 py-2.5
  shadow-sm dark:shadow-blue-900/30
  active:scale-95 transition-all duration-200
">

{/* Secondary */}
<button className="
  bg-white dark:bg-[#0F1E35]
  border border-slate-300 dark:border-blue-500/20
  text-slate-700 dark:text-slate-300
  hover:bg-slate-50 dark:hover:bg-[#162644]
  hover:border-slate-400 dark:hover:border-blue-500/40
  rounded-xl px-6 py-2.5 font-medium
  active:scale-95 transition-all duration-200
">

{/* Ghost */}
<button className="
  text-slate-500 dark:text-slate-400
  hover:text-slate-800 dark:hover:text-slate-100
  hover:bg-slate-100 dark:hover:bg-[#162644]
  rounded-xl px-4 py-2 font-medium
  active:scale-95 transition-all duration-200
">

{/* Danger */}
<button className="
  bg-red-50 dark:bg-red-950/30
  text-red-600 dark:text-red-400
  border border-red-200 dark:border-red-800/30
  hover:bg-red-100 dark:hover:bg-red-950/50
  rounded-xl px-4 py-2 font-medium
  active:scale-95 transition-all duration-200
">
```

---

### 5.3 Inputs & Forms

```tsx
<input className="
  w-full rounded-xl px-4 py-3
  bg-slate-50 dark:bg-[#0D192E]
  border border-slate-300 dark:border-blue-500/20
  text-slate-900 dark:text-slate-100
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  focus:bg-white dark:focus:bg-[#0A1628]
  focus:outline-none
  focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20
  focus:border-blue-500 dark:focus:border-cyan-400/50
  transition-all duration-200
" />
```

---

### 5.4 Badges & Tags

```tsx
{/* AI / Feature badge */}
<span className="
  inline-flex items-center gap-1.5
  px-2.5 py-1 rounded-full
  text-xs font-semibold uppercase tracking-wider
  bg-blue-50 dark:bg-blue-900/30
  text-blue-600 dark:text-cyan-400
  border border-blue-200 dark:border-blue-500/20
">

{/* Section label (pipeline header style) */}
<span className="
  text-xs font-bold uppercase tracking-widest
  text-cyan-600 dark:text-cyan-400
">
  Quiz Generation Pipeline
</span>

{/* Status tag */}
<span className="
  px-2 py-0.5 rounded-md text-xs font-medium
  bg-green-50 dark:bg-green-900/30
  text-green-600 dark:text-green-400
  border border-green-200 dark:border-green-800/30
">
  Active
</span>
```

---

### 5.5 Section Headers (Pipeline-style)

```tsx
{/* Centered pipeline label với connector lines */}
<div className="flex items-center gap-4 mb-8">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-blue-500/30 dark:to-cyan-400/20" />
  <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-cyan-400 whitespace-nowrap">
    Quiz Generation Pipeline
  </span>
  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-blue-500/30 dark:to-cyan-400/20" />
</div>
```

---

### 5.6 Sidebar / Navigation

```tsx
<aside className="
  bg-white dark:bg-[#070E1C]
  border-r border-slate-200 dark:border-blue-500/8
  h-full
">
  {/* Nav item - default */}
  <a className="
    flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2
    text-slate-600 dark:text-slate-400
    hover:bg-slate-100 dark:hover:bg-[#162644]
    hover:text-slate-900 dark:hover:text-slate-100
    transition-all duration-200
  ">

  {/* Nav item - active */}
  <a className="
    flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2
    bg-blue-600 text-white
    shadow-sm dark:shadow-blue-900/40
  ">
```

---

### 5.7 Dividers

```tsx
{/* Standard */}
<hr className="border-slate-200 dark:border-slate-400/8" />

{/* Section divider với label */}
<div className="relative my-8">
  <hr className="border-slate-200 dark:border-blue-500/10" />
  <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-3
                   text-xs text-slate-400 dark:text-slate-500
                   bg-slate-50 dark:bg-[#050B18]">
    OR
  </span>
</div>
```

---

### 5.8 Modals / Dialogs

```tsx
{/* Overlay */}
<div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50" />

{/* Dialog panel */}
<div className="
  bg-white dark:bg-[#0F1E35]
  border border-slate-200 dark:border-blue-500/15
  rounded-2xl shadow-xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)]
  p-6 w-full max-w-lg
">
  {/* Header */}
  <div className="border-b border-slate-200 dark:border-blue-500/10 pb-4 mb-5">
    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Modal Title</h2>
  </div>
```

---

### 5.9 Tables

```tsx
<div className="rounded-2xl border border-slate-200 dark:border-blue-500/10 overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="bg-slate-50 dark:bg-[#0A1628] border-b border-slate-200 dark:border-blue-500/10">
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
                       text-slate-500 dark:text-slate-400">
          Column
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-slate-100 dark:border-blue-500/5
                     hover:bg-slate-50 dark:hover:bg-[#162644]
                     transition-colors duration-150">
        <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">
          Data
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 5.10 Auth Pages - Cosmic Glass Aesthetic

Auth pages (login, register, pending, confirm-password) dùng **glassmorphic card** với cosmic background.

#### AuthShell (Client Component wrapper)

Wraps auth layout with: cosmic star-field background, orbital glow decorations, ThemeToggle button (top-right).

```tsx
import { AuthShell } from "@/components/login/AuthShell";

// Used in (auth)/layout.tsx
<AuthShell>
  <main className="flex-1 ... relative z-10">{children}</main>
  <Footer />
</AuthShell>
```

#### Glassmorphic Auth Card

```tsx
<div className="
  w-full max-w-md rounded-2xl p-8 mx-auto
  bg-white/90 dark:bg-[#0F1E35]/80
  backdrop-blur-xl
  border border-slate-200 dark:border-blue-500/15
  shadow-lg dark:shadow-[0_8px_40px_rgba(37,99,235,0.08)]
  transition-all duration-300
">
```

> **Rule:** Auth pages use `backdrop-blur-xl` on cards - this is the ONE exception to the "no backdrop-blur on layout shell" rule. The blur is on the card only, not on nav/sidebar.

#### Theme Toggle Placement

- **Auth pages:** Fixed top-right corner via `AuthShell`
- **Landing pages:** Inside `Navbar` component
- **Dashboard/LMS:** Not shown (follows system preference or user setting)

#### Cosmic Background (`Background.tsx`)

- **Dark mode:** Full cosmic star-field with twinkling stars, nebula blobs, and shooting stars
- **Light mode:** Very subtle - muted stars, nearly invisible nebulae
- **Interactive:** Mouse parallax on star layers, constellation lines to cursor

---

## 6. Layout & Spacing

### Wrappers

```tsx
{/* Standard page content */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

{/* Section spacing */}
<section className="space-y-8">

{/* Grid - pipeline cards */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

{/* Grid - feature cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Spacing Scale

| Element | Value |
|---|---|
| Between page sections | `space-y-10` / `gap-10` |
| Between cards | `gap-4` / `gap-6` |
| Card internal padding | `p-5` (compact) / `p-6` (standard) |
| Between title & body | `mb-1` / `mb-2` |
| Section title → content | `mb-6` / `mb-8` |
| Transitions | `duration-200` (interactions) / `duration-300` (reveals) |

---

## 7. AI-Native Visual Elements

Những element này định nghĩa bản sắc AI của BDC - dùng có chọn lọc, không lạm dụng.

### Pipeline Connector Arrow

```tsx
{/* Arrow giữa các step */}
<div className="flex items-center justify-center text-blue-400 dark:text-cyan-400/60">
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/>
  </svg>
</div>
```

### Metric / KPI Block

```tsx
<div className="flex items-center gap-3">
  {/* Icon wrapper */}
  <div className="w-10 h-10 rounded-xl
                  bg-blue-50 dark:bg-blue-900/20
                  border border-blue-200 dark:border-blue-500/20
                  flex items-center justify-center
                  text-blue-600 dark:text-cyan-400">
    <IconComponent size={18} />
  </div>
  <div>
    <p className="text-xl font-extrabold text-slate-900 dark:text-white">80%+</p>
    <p className="text-xs text-slate-500 dark:text-slate-400">Time saved</p>
  </div>
</div>
```

### Capability Badge Row

```tsx
<div className="flex flex-wrap gap-3">
  {capabilities.map(cap => (
    <div key={cap.id} className="
      flex items-center gap-2 px-3 py-2 rounded-xl
      bg-slate-50 dark:bg-[#0A1628]
      border border-slate-200 dark:border-blue-500/12
      text-sm
    ">
      <IconComponent size={14} className="text-blue-600 dark:text-cyan-400 shrink-0" />
      <span className="font-semibold text-slate-700 dark:text-slate-200">{cap.title}</span>
      <span className="text-slate-500 dark:text-slate-400 text-xs">{cap.desc}</span>
    </div>
  ))}
</div>
```

---

## 8. Dark Mode - Setup

```tsx
// tailwind.config.ts
module.exports = {
  darkMode: "class",
  // ...
};

// providers/MainProvider.tsx
import { ThemeProvider } from "next-themes";
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
  {children}
</ThemeProvider>
```

### Theme Toggle Component

```tsx
"use client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl
                 text-slate-500 dark:text-slate-400
                 hover:bg-slate-100 dark:hover:bg-[#162644]
                 hover:text-slate-700 dark:hover:text-slate-200
                 active:scale-95 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
```

---

## 9. Anti-Patterns - Tuyệt đối tránh

| ❌ Đừng làm | ✅ Thay bằng |
|---|---|
| `backdrop-blur` trên Sidebar/Navbar | `bg-white dark:bg-[#070E1C]` solid |
| Gradient nhiều màu rực rỡ | Solid hoặc cùng dải (blue→cyan) |
| Thiếu `dark:` pair trên bất kỳ màu nào | Luôn khai báo cả hai |
| Chữ `bg-slate-900` thay vì navy | Dùng `bg-[#0F1E35]` cho card dark |
| Shadow nặng trên dark mode | `dark:shadow-none` hoặc glow subtle |
| Text thuần trắng `#FFF` trên nền tối quá | `text-slate-100` hoặc `text-slate-200` |
| Paragraph dài `text-center` | `text-left`; chỉ tiêu đề mới center |
| Icon trang trí thừa | Mỗi icon phải có nghĩa, không dùng khi đã có text label |
| `active:scale-95` thiếu trên button | Mọi clickable element cần press feedback |
| Hardcode màu hex trong className | Dùng Tailwind token hoặc arbitrary value nhất quán |
| Rounded nhỏ `rounded-md` cho card | `rounded-2xl` cho card, `rounded-xl` cho button/input |

---

## 10. Developer Checklist

### Màu sắc

- [ ] Mọi `bg-`, `text-`, `border-` đều có cặp `dark:`
- [ ] Dark mode dùng blue-navy palette (`#050B18` → `#132240`)
- [ ] Light mode dùng slate palette (`slate-50` → `white`)
- [ ] Primary action luôn là `blue-600` (cả hai mode)
- [ ] Semantic colors (danger/success/warning) đủ cặp light/dark

### Typography

- [ ] Heading dùng `font-bold` / `font-extrabold`
- [ ] Body dùng `leading-relaxed`
- [ ] Caption dùng `text-sm text-slate-500 dark:text-slate-400`
- [ ] Pipeline label dùng `text-xs uppercase tracking-widest text-cyan-400`

### Components

- [ ] Card: `rounded-2xl border dark:border-blue-500/10 shadow-sm dark:shadow-none`
- [ ] Button: `active:scale-95 transition-all duration-200`
- [ ] Input: `focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20`
- [ ] Modal overlay: `bg-black/40 dark:bg-black/60 backdrop-blur-sm`
- [ ] Không dùng `backdrop-blur` trên layout shell

### Layout

- [ ] Section title có connector line hoặc spacing đủ rộng
- [ ] Pipeline steps dùng numbered badges
- [ ] Grid responsive: 1 → 2 → 3+ columns

### Accessibility

- [ ] Contrast đủ (WCAG AA) ở cả hai mode
- [ ] Focus visible rõ ràng
- [ ] `aria-label` trên icon-only buttons
- [ ] `role="status"` trên loading states