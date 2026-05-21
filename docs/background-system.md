# BDC Cosmic Background System - High Performance Animation Architecture

This document provides a comprehensive overview of the advanced, worker-based background system implemented in `src/components/layout/Background.tsx` and `src/components/layout/background.worker.ts`.

## 1. Architectural Philosophy

The system is built on a **"Zero Main-Thread Impact"** philosophy, delegating all intensive calculations and rendering to a background thread to ensure peak UI responsiveness.

### 1.1 Worker-Centric Execution
- **OffscreenCanvas**: All rendering is offloaded to a Web Worker, freeing the main React thread.
- **Typed Arrays (`Float32Array`)**: Star data is managed in a contiguous memory block with a **Stride of 11** (x, y, z, size, baseAlpha, speed, phase, hue, type, shimmer, initDelay).
- **Performance Optimization**: Uses pre-rendered sprite sheets for star variations to minimize GPU draw calls.

### 1.2 Zero-Allocation Core
To eliminate Garbage Collection (GC) spikes and ensure consistent 60/120fps:
- **Spatial Partitioning (Linked-List Grid)**: Uses `Int32Array` based `gridHead` and `gridNext` pointers. This structure is rebuilt every frame with zero object allocation.
- **Bitmask Adjacency Matrix**: Tracks constellation pairs using a `Uint8Array` bitmask for $O(1)$ lookup and set operations.
- **Pulse Pooling**: Uses an object recycling system (Pool) for energy pulses to prevent memory fragmentation from constant creation/deletion.

---

## 2. Initialization & Entry Sequence

### 2.1 "Cosmic Bloom" (Materialization)
- **Sequential Reveal**: Each star has an independent `initDelay` calculated from its **Radial Distance**, **Depth (Z)**, and a **Random Factor**.
- **The Pattern**: Distant background stars materialize first, followed by a radial "bloom" of foreground stars from the center outwards.
- **Initialization Stability**: Parallax movement is **fully disabled for the first 3 seconds** to maintain cinematic elegance during the materialization phase.

### 2.2 Synchronized Component Entry
- **Delayed Reveal**: To focus user attention on the background bloom, all `HeroSection` components feature a base delay:
  - **Background Canvas**: 0s (Bloom begins).
  - **Title (H1)**: 0.8s delay.
  - **Subtitle / Buttons**: 1.0s - 1.2s delay.
  - **Stats & Indicators**: 1.4s - 2.0s delay.

---

## 3. Visual Elements & AI-Native Rhythm

### 3.1 Dynamic Star System
- **Deep Space Distribution**: Follows a `z = random^3` curve, prioritizing a rich field of distant stars (~85%) with sparse, bright foreground stars (~5%).
- **Twinkle & Breathing**:
  - **Large Stars (z > 0.85)**: Feature a steady, majestic breathing cycle (**0.35 - 0.85 rad/s**). They never fade below 10% brightness.
  - **Standard Stars**: Faster twinkling (**0.3 - 1.5 rad/s**) for a sparkling atmosphere.

### 3.2 Background Constellations
- **Visual Clarity Filter**: To maintain a premium, uncluttered aesthetic, automatic star-to-star connections are only formed between stars with **$z \ge 0.45$**. 
- **Depth Focus**: This prevents "visual noise" from distant micro-stars, focusing the geometric patterns on the more prominent foreground layers.

### 3.3 Interactive Ripple
- **Shimmer Physics**: Shooting stars and data pulses leave a luminous wake in nearby stars with an exponential decay factor of **0.98** per frame.

---

## 4. Interaction System

### 4.1 Extreme Needle-point Hover
- **Grid-Optimized Interaction**: Uses a Radius-2 spatial grid search (5x5 cells) to instantly identify stars within the `160px` grab distance, reducing complexity from $O(N)$ to $O(1)$ effectively.
- **Concentrated Excitation**: Stars brighten significantly when directly under the cursor using a **Power of 8** falloff distribution.
- **Precision Focus**: Only the stars in immediate proximity (0-20px) are energized, while stars further away remain untouched.
- **Universal Connectivity**: Unlike background constellations, the **Energy Web (Hover)** connects to **all stars** regardless of depth, ensuring a responsive feel across the entire field.

### 4.2 Energy Web
- **Luminosity-Linked Alpha**: The brightness and width of web lines are **purely dependent** on the real-time luminosity (`starAlpha`) of the connected stars.
- **Materialization Check**: The web effect only connects to stars that have already fully materialized, preventing "phantom" connections to invisible stars during the bloom phase.

### 4.3 Immersive Parallax
- **High-Intensity Movement**: Features a reactive parallax multiplier (**18x Horizontal / 12x Vertical**) for an expansive sense of spatial depth.
- **Depth Mapping**: Parallax intensity scales with the `z` coordinate, providing realistic motion parallax.

---

## 5. Known Issues & Lifecycle Quirks

### 5.1 Offscreen Canvas Transfer on SPA Transitions
- **The Issue**: During client-side SPA transitions (e.g., navigating to the Login page and returning to the landing page), Next.js's Router Cache may preserve and reuse the layout's `<canvas>` DOM element. Re-triggering `transferControlToOffscreen()` on a reused element throws a `DOMException` ("Cannot transfer control to offscreen twice"), causing silent initialization failures and disabling the background.
- **Current Mitigation**: Handled via a global module-level reference cache tracking the active Worker and Canvas instances in [Background.tsx](file:///home/thanh/BDCHub---Frontend/src/components/layout/Background.tsx), preventing redundant transfer calls.
- **Future Refactoring**: Open for simplification if a cleaner state-sharing mechanism or standard offscreen lifecycle abstraction is introduced.

