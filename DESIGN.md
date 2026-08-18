---
name: BDCHub Design System
description: Minimal & Formal tech-academic design system for the Big Data Club ecosystem
colors:
  primary: "#2563eb"
  accent: "#06b6d4"
  neutral-bg-light: "#f8fafc"
  neutral-bg-dark: "#050b18"
  surface-light: "#ffffff"
  surface-dark: "#0f1e35"
  border-light: "rgba(226, 232, 240, 0.9)"
  border-dark: "rgba(59, 130, 246, 0.15)"
  glass-bg-light: "rgba(255, 255, 255, 0.8)"
  glass-bg-dark: "rgba(15, 30, 53, 0.8)"
typography:
  display:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1.25
  body:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  lg: "8px"
  xl: "12px"
  "2xl": "16px"
  "3xl": "24px"
  full: "9999px"
spacing:
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "#1d4ed8"
  button-secondary:
    backgroundColor: "#f1f5f9"
    textColor: "#334155"
    rounded: "{rounded.xl}"
    padding: "6px 12px"
  input-text:
    backgroundColor: "#f8fafc"
    textColor: "#0f172a"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
---

# Design System: BDCHub Design System

## Overview

**Creative North Star: "The Tech-Academic Terminal"**

This system represents a clean, high-tech engineering aesthetic that blends computer science vibes with institutional structure. It is designed to be highly functional, structured, and formal, reflecting the engineering nature of the Big Data Club at HCMUT.

The visual system prioritizes clarity and efficiency, utilizing a strict grid layout, well-proportioned typography, and high-contrast form elements. The light mode uses clean slate tones, while the dark mode adopts a deep cosmic navy atmosphere with subtle vibrant blue/cyan glow highlights.

**Key Characteristics:**
- **Technocentric Accent:** High-contrast blue and cyan gradients that highlight active elements and progress metrics.
- **Structural Integrity:** Reliance on solid borders and clear segmentations rather than heavy drop shadows, especially in dark mode.
- **User-Centric Progress:** Seamless, auto-persisted multi-step form navigation with visible stepper indicators.
- **Visual Structure & Spacing:** Centered main templates utilizing a standard `max-w-7xl` layout with unified responsive bounds (px-4 to px-8) and custom background blur panels.

## Colors

The primary palette features deep cosmic navy tones paired with vibrant cybernetic blue and cyan accents.

### Primary
- **Tech Blue** (#2563eb): Used for primary action buttons, focus rings, active progress lines, and active steppers.
- **Cyber Cyan** (#06b6d4): Used as a secondary gradient accent, interactive hovers, and status badges.

### Neutral
- **Cosmic Dark Navy** (#050b18): The main background color for dark mode layouts.
- **LMS Card Dark** (#0f1e35): Container background in dark mode, offering a layered contrast.
- **Slate Light** (#f8fafc): Background background for light mode layouts.
- **Pure White** (#ffffff): Card container background for light mode.
- **Glassmorphic Surface** (rgba(255, 255, 255, 0.8) / rgba(15, 30, 53, 0.8)): High-end layered backdrop styling for summary card blocks and navigation elements.

**The Accent Rarity Rule.** Vibrant primary tech blue is reserved strictly for interactive indicators, primary call-to-actions, and active state indicators, ensuring they stand out immediately.

## Typography

**Display Font:** System Sans-Serif (system-ui, sans-serif)
**Body Font:** System Sans-Serif (system-ui, sans-serif)

### Hierarchy
- **Display** (900, 30px, 1.25): Used for main page titles and key sections.
- **Headline** (800, 20px, 1.3): Used for form section headers.
- **Body** (500, 14px, 1.5): Standard form label and description text.
- **Label** (700, 12px, 0.05em, uppercase): Form field label requirements and table headers.

## Layout

The wizard layout is centered, constrained to a maximum width of 3xl (768px). The responsive spatial grammar adapts margins and paddings dynamically (p-6 on mobile to p-10 on desktop). Standard pages and dashboards use a centered layout width of `max-w-7xl` with `mx-auto px-4 sm:px-6 lg:px-8`. Spacing uses a standard 4px baseline, with most layouts utilizing 16px (gap-4) and 24px (gap-6) spacing steps.

## Elevation & Depth

This system operates on a hybrid elevation model:
- **Light Mode:** Uses ambient elevation with soft shadows (e.g. `shadow-xl`) to lift cards off the slate background.
- **Dark Mode:** Completely flat at rest. Depth is expressed through subtle borders (`border-blue-500/15`) and container background layering (`#0f1e35` over `#050b18`).

**The Flat Dark Rule.** Dark mode surfaces must never use drop shadows. Elevation is represented solely by border color intensity and container background light levels.

## Shapes

- **Inputs & Controls:** Rounded-xl (12px) corners for modern, accessible tactile affordance.
- **Cards & Outer Containers:** Rounded-3xl (24px) corners providing a distinct framing wrapper.
- **Secondary Cards & Widgets:** Rounded-2xl (16px) corners for configuration blocks and settings sidebars.
- **Pills & Active Tabs:** Rounded-lg (8px) corners for interior navigators and tab elements.
- **Action Pills:** Rounded-full (9999px) for pill buttons (e.g., language selection).

## Components

### Buttons
- **Shape:** rounded-xl (12px)
- **Primary:** Tech Blue background (#2563eb), white text, padding px-7 py-3.
- **Secondary / Edit Button:** Slate-100 / dark slate-800 background, padding px-3 py-1.5, active scale transform (95%), with optional thin border highlights.

### Tab Switcher Pills
- **Shape:** rounded-xl (12px) outer container, rounded-lg (8px) inner tab elements.
- **Structure:** Horizontal layout flex container with light/dark backdrop colors, inner spacing padding 4px.
- **Active state:** Active tab utilizes a distinct white (light) or #0f1e35 (dark) background and subtle border frame.

### Inputs / Fields
- **Style:** Background slate-50 (light) or #0d192e (dark) with thin borders.
- **Focus:** Highlighted with a blue focus border and a subtle glow ring.

### Cards / Containers
- **Corner Style:** rounded-3xl (24px) or rounded-2xl (16px)
- **Background:** White (light) or #0f1e35 (dark).
- **Glassmorphic variant:** Semi-transparent backing (`bg-white/80` or `bg-[#0f1e35]/80` with backdrop-blur) and custom hover scale transitions.

### List Items & Navigation Rows
- **Structure:** `w-full min-w-0 overflow-hidden` flex wrapper.
- **Title Truncation:** Must apply `min-w-0 flex-1 truncate block overflow-hidden text-ellipsis whitespace-nowrap` on text containers.
- **Fixed Action / Badge Slot:** Must use `shrink-0` or `flex-shrink-0` on trailing status icons/actions to prevent text pushing icons offscreen.

**The Strict Flex Truncation Rule.** Whenever displaying truncated titles alongside trailing icons inside flex parents (e.g. sidebar navigation lists), all flex ancestor containers and the text element itself MUST explicitly set `min-w-0` and `overflow-hidden`, while trailing status badges MUST be explicitly declared `shrink-0`. Never allow unconstrained text children in flex layouts.

## Do's and Don'ts

### Do:
- **Do** preserve the multi-step progress when a user returns by reading from local storage.
- **Do** use uppercase cyber badges for section tags and status updates.
- **Do** use unified `max-w-7xl` layouts for dashboard and course layout screens.
- **Do** enforce `min-w-0` and `shrink-0` on sidebar list items to protect trailing status badges from layout clipping.

### Don't:
- **Don't** use generic black borders or flat gray highlights. Use themed slate-300 or dark blue/cyan borders instead.
- **Don't** use standard heavy drop shadows on dark mode cards.
- **Don't** omit `min-w-0` on flex children containing truncated text (`truncate`), as flex items default to `min-width: auto` and will push trailing icons offscreen.
