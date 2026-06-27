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
// Staggered Floating Constants (Recalibrated coordinates inside the new 540px desktop container to prevent overlap)
const statsData = [
  { label: "Kết nối", value: "100+", floatClasses: "top-[6%] left-[2%]", duration: 4.2 },
  { label: "Năm hoạt động", value: "4", floatClasses: "top-[22%] right-[0%]", duration: 4.8 },
  { label: "Dự án NCKH", value: "10+", floatClasses: "bottom-[22%] left-[2%]", duration: 5.2 },
  { label: "Giải thưởng", value: "5+", floatClasses: "bottom-[6%] right-[2%]", duration: 4.5 }
];
```

Each inner badge loops perpetually with scaled-up bounce amplitude to match the heavier visual weight:

```typescript
animate={{ y: [0, -14, 0] }} // Amplitude scaled up from -12px to -14px
transition={{
  repeat: Infinity,
  duration: duration, // staggered duration per card
  ease: "easeInOut"
}}
```

### 4.3 High-Contrast Orbiting Rings & Parallax Satellites (Science-Tech Core)

To produce an eye-catching, high-fidelity visual experience representing BDC's technical identity, the rotating background concentric orbits around the central BDC Logo are implemented with premium CSS animations and GPU-based optimizations:

1. **Outer Orbit (Dashed) with Blue Glowing Satellite & Seamless SVG Trail**:
   * **Styling**: `w-64 h-64` circular path, `border border-dashed border-blue-500/35 dark:border-blue-500/20`.
   * **Rotation**: Spun clockwise at a steady, majestic rhythm of **`28s`** (`animate-[spin_28s_linear_infinite]`).
   * **Lead Satellite Node**: Features an absolute blue glowing particle (`w-2.5 h-2.5`) at the 12 o'clock position with a high-glow shadow `shadow-[0_0_10px_rgba(59,130,246,0.8)]`.
   * **Seamless Tapering & Fading Trail (SVG)**: Utilizes an absolute mathematically generated SVG path curved wedge (`d="M 128 -1.5 A 129.5 129.5 0 0 0 37.5 37.5 A 126.5 126.5 0 0 1 128 1.5 Z"` in a `256x256` viewBox). The arc spans $45^\circ$, tapering from a width of `3px` at the head down to `0px` at the tail. It is filled with a linear gradient (`#blueCometGrad` going from `opacity: 1` down to `opacity: 0` at the tail) to create a perfect continuous glowing comet sweep.
2. **Inner Orbit (Dotted) with Cyan Glowing Satellite & Seamless SVG Trail**:
   * **Styling**: `w-48 h-48` circular path, `border-2 border-dotted border-cyan-500/35 dark:border-cyan-500/20`.
   * **Rotation**: Spun counter-clockwise in a rapid reverse parallax at **`12s`** (`animate-[spin_12s_linear_infinite_reverse]`).
   * **Lead Satellite Node**: Features an absolute cyan glowing particle (`w-2 h-2`) at the 6 o'clock position with a high-glow shadow `shadow-[0_0_10px_rgba(6,182,212,0.8)]`.
   * **Seamless Tapering & Fading Trail (SVG)**: Utilizes an absolute mathematically generated SVG path curved wedge (`d="M 96 193.2 A 97.2 97.2 0 0 1 28.1 163.9 A 94.8 94.8 0 0 0 96 190.8 Z"` in a `192x192` viewBox). The arc spans $45^\circ$, tapering from a width of `2.4px` at the bottom down to `0px` at the tail. It is filled with a cyan linear gradient (`#cyanCometGrad` going from `opacity: 1` to `opacity: 0` at the tail) to produce a matching high-speed faded comet sweep.
3. **GPU Compositing Optimization**:
   * Added `will-change-transform` to both orbits to force GPU composition layer rendering. This keeps CPU usage at `0%` and ensures buttery smooth `60fps/120fps` visual rotations.

### 4.4 Optical Character Alignment (Visual Left Flush)

To achieve absolute typographic perfection and ensure the split-character title aligns flawlessly with the left edge of the content container (and the description text below it), we apply **Optical Character Alignment** to the very first letter of the title:

* **The Problem**: Font glyphs naturally contain built-in left and right blank spacing (known as **Side Bearings**) in their glyph definitions. When splitting the text into isolated inline-block DOM elements (`motion.span`), the left side bearing of the very first letter ("B") introduces a small blank visual gap, causing the entire title to appear slightly indented or shifted to the right.
* **The Typographic Solution**: We conditionally apply a custom negative left margin (`ml-[-0.05em]`) **exclusively to the first letter** of the title (`index === 0`):

  ```tsx
  className={`inline-block will-change-transform [backface-visibility:hidden] ${index === 0 ? "ml-[-0.05em]" : ""}`}
  ```

* **Why it works**: By utilizing `em` units, the negative margin scales proportionally with any font size adjustments across different screen breakpoints, pulling the flat left vertical stroke of the letter "B" perfectly flush with the left boundary of the grid column.

---

## 5. Responsive Adaptation Schema

The design employs a strict responsive design system using Tailwind CSS to adapt dynamically:

| Screen Breakpoint | Layout Behavior | Stats Presentation | Scroll Indicator |
| :--- | :--- | :--- | :--- |
| **Desktop** (`>= lg: 1024px`) | Split-screen Grid (Col-Span 7 / Col-Span 5) | Interactive Floating Badges in Right Column (`h-[540px]`) | Minimalist Mouse-wheel with animated scroll-dot |
| **Tablet** (`768px - 1023px`) | Single-column Centered Stack | Compact 2x2 Glassmorphic Grid underneath CTAs | Minimalist Mouse-wheel with animated scroll-dot |
| **Mobile** (`< 768px`) | Single-column Centered Stack | Compact 2x2 Glassmorphic Grid underneath CTAs | Minimalist Mouse-wheel with animated scroll-dot |

This guarantees that visitors on smartphones and tablets have full access to BDC's statistics and key credibility metrics without the visual clutter of desktop-oriented coordinates.
