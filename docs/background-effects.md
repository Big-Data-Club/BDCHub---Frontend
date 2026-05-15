# BDC Background System - Technical Documentation

This document provides a detailed overview of the high-performance background system implemented in `src/components/layout/Background.tsx`. This system is a core part of the **BDC Design Rhythm v3.0**, aiming for a premium, AI-native aesthetic.

## 1. Visual Elements

### 1.1 Star System (`Star` class)
The stars are the primary visual element, managed with a depth-first approach (`z` coordinate).
- **Depth-Based Variety**: Each star is assigned a random `z` value (0 to 1), which anchors its size, opacity, and movement speed.
- **Twinkling Logic**: Uses a Sine-wave oscillation with randomized phases and speeds to ensure non-synchronized blinking.
- **Visual Tiers**:
  - **Standard**: Minimalistic bright points.
  - **Glow Halo (z > 0.5)**: Adds a soft radial gradient around the star for a more atmospheric look.
  - **Sparkle Cross (z > 0.85)**: Occasional four-pointed cross highlights for the brightest stars.
- **Theming**:
  - **Dark Mode**: High contrast, cool blue to warm white hues.
  - **Light Mode**: Subdued indigo and soft blue tones with reduced opacity to maintain readability.

### 1.2 Nebula System (`Nebula` class)
Large, soft ambient glow blobs that provide "atmospheric weight" to the scene.
- **Movement**: Subtle floating movement using nested Sine/Cosine oscillations.
- **Composition**: Multi-stop radial gradients (`hsla` based) to create soft, cloud-like edges.
- **Distribution**: Typically 2-4 large nebulae across the canvas.

### 1.3 Shooting Stars (`ShootingStar` class)
Randomly spawned high-velocity events.
- **Physics**: Linear trajectory with life-cycle management (fading alpha and length).
- **Visuals**: Linear gradient trails with a bright "head" arc.
- **Spawning**: Randomized cooldowns (longer in light mode to maintain cleanliness).

---

## 2. Interaction & Dynamics

### 2.1 Lazy Follow (Smooth Interaction)
The background reacts to mouse movement using a **Linear Interpolation (LERP)** technique.
- **Logic**: `current += (target - current) * 0.2`.
- **Performance**: Decouples high-frequency mouse events from the 60/120fps animation loop.
- **Effect**: Creates a "premium" feel where the background has perceived mass and organic lag, following the cursor gracefully.

### 2.2 Mouse Parallax
All elements shift based on the mouse position, but their displacement is scaled by their `z` (depth).
- **Foreground stars** (high `z`) move significantly.
- **Background stars** and **Nebulae** move minimally.
- This creates a realistic 3D spatial effect on a 2D canvas.

### 2.3 The "Web" / Constellation Effect
Stars near the mouse cursor and each other form a dynamic geometric web.
- **Connection Logic**: Stars within a certain radius (`grabDist`) connect to the cursor and to their neighbors.
- **Visuals**: Thin, semi-transparent lines that fade based on the distance between points.

---

## 3. Performance Engineering

### 3.1 Optimized Spatial Grid
To avoid $O(N^2)$ calculations for constellation lines, the system uses a **numeric-keyed spatial grid**.
- **Grid Partitioning**: The canvas is divided into cells based on the connection radius.
- **Efficient Lookup**: Stars are hashed into these cells using bitwise keys: `(gx << 16) | (gy & 0xFFFF)`.
- **Complexity**: Reduces the line-drawing logic from thousands of checks to only a few dozen nearby neighbors per star.

### 3.2 Hardware Acceleration & Scaling
- **DPR Awareness**: Detects `window.devicePixelRatio` to render crisp visuals on Retina/High-DPI displays.
- **Responsive Caps**:
  - **Mobile**: Star count capped at ~150.
  - **Desktop**: Star count capped at ~800.
- **Passive Listeners**: Event listeners use `{ passive: true }` to prevent blocking the main thread during interactions.

---

## 4. Accessibility (A11y)

### 4.1 Reduced Motion Support
The component respects the system-level `prefers-reduced-motion` setting.
- **Behavior**: If enabled, the `requestAnimationFrame` loop is bypassed for most logic, and a static frame is rendered via `drawStatic()`.
- **Safety**: Prevents dizziness or discomfort for users sensitive to motion.

### 4.2 Theme Integration
Uses `next-themes` (`resolvedTheme`) to instantly adapt the canvas color palette and transparency levels without requiring a page reload.
