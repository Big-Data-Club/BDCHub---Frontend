---
version: "alpha"
name: "Signal Ledger"
description: "Signal Ledger Dashboard Section is designed for demonstrating application workflows and interface hierarchy. Key features include clear information density, modular panels, and interface rhythm. It is suitable for product showcases, admin panels, and analytics experiences."
colors:
  primary: "#4B4BA0"
  secondary: "#FFFFFF"
  tertiary: "#8F47AE"
  neutral: "#FFFFFF"
  background: "#FFFFFF"
  surface: "#000000"
  text-primary: "#FFFFFF"
  text-secondary: "#000000"
  border: "#FFFFFF"
  accent: "#4B4BA0"
typography:
  display-lg:
    fontFamily: "Helvetica Neue"
    fontSize: "60px"
    fontWeight: 200
    lineHeight: "55.2px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "Helvetica Neue"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
rounded:
  md: "0px"
  full: "9999px"
spacing:
  base: "8px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "20px"
  gap: "12px"
  section-padding: "48px"
components:
  button-primary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "10px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "12px"
  button-link:
    textColor: "{colors.secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "0px"
---

## Overview

- **Composition cues:**
  - Layout: Flex
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Minimal

## Colors

The color system uses dark mode with #4B4BA0 as the main accent and #FFFFFF as the neutral foundation.

- **Primary (#4B4BA0):** Main accent and emphasis color.
- **Secondary (#FFFFFF):** Supporting accent for secondary emphasis.
- **Tertiary (#8F47AE):** Reserved accent for supporting contrast moments.
- **Neutral (#FFFFFF):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #FFFFFF; Surface: #000000; Text Primary: #FFFFFF; Text Secondary: #000000; Border: #FFFFFF; Accent: #4B4BA0

- **Gradients:** bg-gradient-to-br from-zinc-500 to-white via-zinc-200

## Typography

Typography relies on Helvetica Neue across display, body, and utility text.

- **Display (`display-lg`):** Helvetica Neue, 60px, weight 200, line-height 55.2px, letter-spacing -0.025em.
- **Body (`body-md`):** Helvetica Neue, 14px, weight 400, line-height 20px.

## Layout

Layout follows a flex composition with reusable spacing tokens. Preserve the flex, full bleed structural frame before changing ornament or component styling. Use 8px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a flex / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Flex
- **Content width:** Full Bleed
- **Base unit:** 8px
- **Scale:** 8px, 10px, 12px, 20px, 24px, 48px, 64px, 80px
- **Section padding:** 48px, 64px
- **Gaps:** 12px, 24px, 28px, 32px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 0.67px #FFFFFF
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.12) 0px 12px 32px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.14) 0px 12px 32px 0px
- **Blur:** 8px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 0px padding and a 0px radius. Drive the shell with radial-gradient(circle at 88% 64%, rgba(139, 160, 176, 0.16), rgba(0, 0, 0, 0) 30%), radial-gradient(circle at 55% 40%, rgba(120, 140, 154, 0.08), rgba(0, 0, 0, 0) 35%), none so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 9999px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 9999px

## Components

Anchor interactions to the detected button styles.

### Buttons
- **Primary:** background #FFFFFF, text #000000, radius 9999px, padding 10px, border 0.666667px solid rgba(255, 255, 255, 0.15).
- **Secondary:** background #FFFFFF, text #FFFFFF, radius 9999px, padding 12px, border 0.666667px solid rgba(255, 255, 255, 0.15).
- **Links:** text #FFFFFF, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 8px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

Motion feels controlled and interface-led across text, layout, and section transitions. Timing clusters around 150ms and 1500ms. Easing favors ease and cubic-bezier(0.4. Hover behavior focuses on text and color changes.

**Motion Level:** moderate

**Durations:** 150ms, 1500ms, 1200ms

**Easings:** ease, cubic-bezier(0.4, 0, 0.2, 1)

**Hover Patterns:** text, color, stroke

## WebGL

Reconstruct the graphics as a full-bleed background field using alpha, antialias, dpr clamp, custom shaders. The effect should read as technical and meditative: fluid wave field with black and sparse spacing. Build it from shader field so the effect reads clearly. Animate it as slow breathing pulse. Interaction can react to the pointer, but only as a subtle drift. Preserve dom fallback.

**Id:** webgl

**Label:** WebGL

**Stack:** WebGL

**Insights:**
  - **Scene:**
    - **Value:** Full-bleed background field
  - **Effect:**
    - **Value:** Fluid wave field
  - **Primitives:**
    - **Value:** Shader field
  - **Motion:**
    - **Value:** Slow breathing pulse
  - **Interaction:**
    - **Value:** Pointer-reactive drift
  - **Render:**
    - **Value:** alpha, antialias, DPR clamp, custom shaders

**Techniques:** Breathing pulse, Pointer parallax, Shader gradients, DOM fallback

**Code Evidence:**
  - **HTML reference:**
    - **Language:** html
    - **Snippet:**
      ```html
      <canvas id="orbit-canvas" class="absolute inset-0 h-full w-full" aria-hidden="true" style="display:block; filter: drop-shadow(0 0 1.15rem rgba(185, 218, 255, 0.28));" width="1219" height="876"></canvas>
      ```
  - **JS reference:**
    - **Language:** js
    - **Snippet:**
      ```
      const canvas = document.getElementById('orbit-canvas');
      const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });

      const revealItems = document.querySelectorAll('[data-reveal]');
      requestAnimationFrame(() => {
        revealItems.forEach((item) => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
      …
      ```
  - **Renderer setup:**
    - **Language:** js
    - **Snippet:**
      ```
      const vertexSource = `
        attribute vec2 a_position;
        attribute float a_alpha;
        attribute float a_intensity;
        uniform vec2 u_resolution;
        varying float v_alpha;
        varying float v_intensity;
        void main() {
      …
      ```
