---
title: "BDC Hub Hero & Stats Redesign Specification"
category: "module-spec"
status: "active-spec"
last_updated: "2026-08-16"
target_surface: "src/components/home/hero/"
---

# BDC Hub Hero & Stats Redesign Specification

This document presents the UX/UI redesign concept, structural architecture, and technical specifications of the **Hero and Stats** sections of BDC Hub. It details the rationale behind the visual transitions, the conversion-driven Call to Action (CTA) hierarchy, and the high-fidelity animation mechanics.

---

## 1. Executive Summary & Core Objectives

The BDC Hub landing page serves as the digital front-door for the Big Data Club at HCMUT. The previous design relied on a standard center-stacked layout with high-redundancy CTAs and blocky static stats, leading to cognitive friction and diminished user conversion.

The redesign achieves three core objectives:

* **Resolve CTA Redundancy**: Align the landing page navigation to steer users toward a primary conversion target rather than repeating local scroll links.
* **Establish Tech-Forward Premium Aesthetics**: Integrate statistics dynamically to reflect the club’s technical identity in Big Data, AI, and Cloud Computing.
* **Optimize Multi-Device Responsive Flows**: Ensure an equally captivating, high-performance experience on both ultra-wide screens and compact mobile devices.

---

## 2. UX Bottleneck Analysis (The "Why")

Before the redesign, a guest user encountered multiple competing actions pointing to identical sections:

```plaintext
[Navbar]               "Về CLB" --→ Scrolls to #about
                       "Dự Án"  --→ Scrolls to #projects

[Hero Buttons]         "Khám phá dự án" (Primary) --→ Scrolls to #projects
                       "Tìm hiểu thêm"  (Secondary) → Scrolls to #about

[Scroll Indicator]     "Khám phá" (Text Label) -----→ Scrolls to #about
```

### The Cognitive Pitfalls

1. **Hick's Law Violation**: Presenting multiple visually weighted options that trigger the exact same local navigation scroll dilutes user focus and decreases overall click-through rates.
2. **Lack of Active Conversion Goals**: Inactive local scrolling buttons make the site feel passive. A premium SaaS-like hub should drive high-value actions (e.g., student registration, learning management platform sign-in).
3. **Visual Overcrowding**: Large, heavy static blocks for stats beneath the CTAs consume excessive vertical screen space (above the fold) without establishing an organic connection to the hero copy.

---

## 3. The Redesign Blueprint: Split-Screen & Floating Glassmorphic Stats

To solve these bottlenecks, the layout is redesigned into a modern **2-Column Split-Screen Grid Layout** on desktop screens, separating informational hierarchy from interactive visual showcase.

```plaintext
+------------------------------------------------------------+
|                        BDC HUB NAVBAR                      |
+------------------------------------------------------------+
|                                                            |
|  [COLUMN 1: CONTENT & CTAs]     [COLUMN 2: VISUAL CORE]    |
|                                                            |
|   TITLE (S-Curve Reveal)                 (   )             |
|   Big Data Club                    Stat 1 (BDC) Stat 2     |
|                                           (   )            |
|   DESCRIPTION                      Stat 3       Stat 4     |
|   leading academic club...                                 |
|                                                            |
|   CTAs (Conversion-Focused)                                |
|   [Start Now] [View Projects]                              |
|                                                            |
+------------------------------------------------------------+
|                       (Mouse Scroll)                       |
+------------------------------------------------------------+
```

### 3.1 Left Column: Conversion-Oriented Copy & Actions

* **Title & Text Alignment**: Aligned to the left (`lg:text-left lg:items-start`) on desktop, and centered on mobile to prioritize read-flow.
* **Primary Conversion Gateways (CTAs)**:
  * **Unauthenticated Users (Guests)**:
    * *Primary (Filled Blue)*: **"Bắt đầu ngay" (Start Now)** → Redirects to `/login`. Drives user registration and onboarding to the LMS.
    * *Secondary (Minimal Outlined)*: **"Xem dự án" (View Projects)** → Scrolls to `#projects`.
  * **Authenticated Users (Members)**:
    * *Primary (Filled Blue)*: **"Bảng quản trị" (Dashboard)** → Redirects to `/dashboard`.
    * *Secondary (Minimal Outlined)*: **"Về BDC Hub" (About BDC)** → Scrolls to `#about`.

### 3.2 Right Column: Interactive Ambient Visual Core & Glassmorphic Stats

Instead of basic grids, club statistics are integrated into an organic **visual showcase area**:

* **Visual Core & BDC Logo**:
  * Swapped the plain text "BDC HUB" in the central core circle with the official high-resolution **Big Data Club Logo** (`LogoIcon` via `SafeImage`).
  * Styled as a premium, unified glassmorphic container: `w-32 h-32` (`128x128px`), padding `p-2`, overflow-hidden, and using the stats card theme `bg-white/40 dark:bg-[#0F1E35]/40 backdrop-blur-md border border-slate-200/50 dark:border-blue-500/10`.
  * Integrates an interactive hover micro-animation scale zoom: `group-hover:scale-110 transition-transform duration-500` on the logo image (`w-20 h-20`).
* **Visual Orbiting Rings (Parallax Atomic Core)**:
  * Concentric orbital borders spin in opposite directions to reflect BDC's high-tech, atomic science-tech identity (see Section 4.3 for full animation specs).
* **Glassmorphic Floating Badges**:
  * Four statistic cards (**100+ Connections**, **4+ Years**, **10+ R&D Projects**, **5+ Key Awards**) float around the core.
  * **Style**: Ultra-light transparent glassmorphism (`backdrop-blur-md bg-white/40 dark:bg-[#0F1E35]/40 border border-slate-200/50 dark:border-blue-500/10`) with glowing hover shadows.
  * **Scaled-up Proportion**: Enlarged card width to `w-[170px]`, inner padding to `p-5`, value sizes to `text-3xl font-extrabold`, and label sizes to `text-xs font-bold`.

### 3.3 Progressive Scroll Indicator

The duplicate text label "Khám phá" is removed. It is replaced with a silent **mouse scroll wheel simulation** with an animated scroll dot moving downwards, offering a luxury, minimalist hint of progression.

---

## 4. Animation Choreography & Technical Specs

All animations are powered by **Framer Motion** to guarantee native-like rendering speeds and zero rendering lag.

### 4.1 Entrance Choreography

* **Staggered Cascade**: Children elements animate sequentially to create a clean, intentional entry flow.
* **Easing Curve**: Leverages a premium out-expo bezier curve `[0.16, 1, 0.3, 1]` for ultra-smooth zoom transitions on the title and description block.

### 4.2 Floating Badges Physics (Continuous Loops)

To achieve a natural floating effect, each statistic card is split into two concentric containers:

1. **Entrance Wrapper**: Handles the staggered entrance transition.
2. **Continuous Physics Loop**: Animates continuously using infinite repeats and staggered cycle durations to prevent synchronous motion.

```typescript
// Staggered Floating Constants
const statsData = [
  { label: "Kết nối", value: "100+", floatClasses: "top-[6%] left-[2%]", duration: 4.2 },
  { label: "Năm hoạt động", value: "4", floatClasses: "top-[22%] right-[0%]", duration: 4.8 },
  { label: "Dự án NCKH", value: "10+", floatClasses: "bottom-[22%] left-[2%]", duration: 5.2 },
  { label: "Giải thưởng", value: "5+", floatClasses: "bottom-[6%] right-[2%]", duration: 4.5 }
];
```

Each inner badge loops perpetually with scaled-up bounce amplitude:

```typescript
animate={{ y: [0, -14, 0] }}
transition={{
  repeat: Infinity,
  duration: duration,
  ease: "easeInOut"
}}
```

### 4.3 High-Contrast Orbiting Rings & Parallax Satellites (Science-Tech Core)

To produce an eye-catching, high-fidelity visual experience representing BDC's technical identity:

1. **Outer Orbit (Dashed) with Blue Glowing Satellite & Seamless SVG Trail**:
   * **Styling**: `w-64 h-64` circular path, `border border-dashed border-blue-500/35 dark:border-blue-500/20`.
   * **Rotation**: Spun clockwise at a steady, majestic rhythm of **`28s`** (`animate-[spin_28s_linear_infinite]`).
   * **Lead Satellite Node**: Features an absolute blue glowing particle (`w-2.5 h-2.5`) with a high-glow shadow.
2. **Inner Orbit (Dotted) with Cyan Glowing Satellite & Seamless SVG Trail**:
   * **Styling**: `w-48 h-48` circular path, `border-2 border-dotted border-cyan-500/35 dark:border-cyan-500/20`.
   * **Rotation**: Spun counter-clockwise in a rapid reverse parallax at **`12s`** (`animate-[spin_12s_linear_infinite_reverse]`).
3. **GPU Compositing Optimization**:
   * Added `will-change-transform` to force GPU composition layer rendering, keeping CPU usage at `0%`.

### 4.4 Optical Character Alignment (Visual Left Flush)

To achieve typographic alignment, we apply negative left margin (`ml-[-0.05em]`) to the very first letter of the title (`index === 0`), pulling the letter "B" flush with the left boundary of the grid column.

---

## 5. Responsive Adaptation Schema

| Screen Breakpoint | Layout Behavior | Stats Presentation | Scroll Indicator |
| :--- | :--- | :--- | :--- |
| **Desktop** (`>= lg: 1024px`) | Split-screen Grid (Col-Span 7 / Col-Span 5) | Interactive Floating Badges in Right Column | Minimalist Mouse-wheel with animated scroll-dot |
| **Tablet** (`768px - 1023px`) | Single-column Centered Stack | Compact 2x2 Glassmorphic Grid underneath CTAs | Minimalist Mouse-wheel with animated scroll-dot |
| **Mobile** (`< 768px`) | Single-column Centered Stack | Compact 2x2 Glassmorphic Grid underneath CTAs | Minimalist Mouse-wheel with animated scroll-dot |
