---
target: src/app/(landing)/page.tsx
total_score: 26
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 1
timestamp: 2026-08-25T04-57-13Z
slug: src-app-landing-page-tsx
---
# Impeccable Design Critique: BDC Hub Landing Page

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Excellent scroll response, theme toggle state, and floating notification toast. |
| 2 | Match System / Real World | 4 | Fluent academic & HPC Lab terminology ("Think Big • Speak Data"). |
| 3 | User Control and Freedom | 3 | Smooth scroll links & dismissible notice; could benefit from a dedicated floating scroll-to-top button. |
| 4 | Consistency and Standards | 4 | Strict adherence to BDC Design Rhythm v3.0 glassmorphism tokens & spacing grammar. |
| 5 | Error Prevention | 4 | LocalStorage notice state persistence, safe image fallbacks, and secure external links. |
| 6 | Recognition Rather Than Recall | 3 | Clear icon + label pairings; hover dropdown on desktop needs explicit mobile touch indicator. |
| 7 | Flexibility and Efficiency | n/a | Landing page surface (Persuade mode). |
| 8 | Aesthetic and Minimalist Design | 4 | High visual hierarchy, balanced typography, zero clutter, and zero eyebrow anti-patterns. |
| 9 | Error Recovery | 4 | Safe avatar and image fallbacks across all cards. |
| 10 | Help and Documentation | n/a | Landing page surface (Persuade mode). |
| **Total** | | **26/32** | **Good (81%)** |

#### Design Specificity Verdict

**LLM Assessment**: Authored specifically for the Big Data Club HCMUT ecosystem. The composition balances high-performance academic computing heritage (HPC Lab, publications, scientific mentors) with modern cybernetic dark/light aesthetics. Typography, card radii (24px/16px), and accent lighting (`#2563EB` & `#06B6D4`) feel custom and tailored rather than templated.

**Deterministic Scan**: The automated detector scanned 8 core landing page files. It detected 0 syntax/runtime errors and 0 non-standard font size deviations. 9 advisory warnings were logged for selection/overlay color classes, which are false positives resulting from outer layout selection container declarations.

**Visual Overlays**: Automated detector verification complete.

#### Overall Impression

The landing page achieves an impressive high-craft impression. The dark glassmorphic cards, telemetry orbits, and typography hierarchy communicate prestige and technical excellence. The main opportunities lie in touch-first affordances for mobile navigation and adding an explicit back-to-top floating control for long viewports.

#### What's Working

1. **Cybernetic Visual Core & Telemetry:** Dynamic dual-orbit rotation with central logo breath effect creates an immediate "wow" factor without cluttering the hero text.
2. **Typography & Structure:** Clear scale steps (7xl display title, bold 2xl card headers, 14px body text) with zero eyebrow/kicker anti-patterns.
3. **Glassmorphic Spatial Grammar:** Cohesive dark (`#0F1E35` over `#050B18`) and light slate backdrop layering.

#### Priority Issues

- **[P1] Mobile Dropdown Touch Target**: HPC School dropdown relies primarily on hover triggers on desktop; on touch devices, explicit tap state needs seamless toggle feedback.
  - *Why it matters*: Mobile users navigating to HPC School may accidentally close the menu or misclick links.
  - *Fix*: Add explicit touch tap handler and ARIA expansion indicators for mobile viewports.
  - *Suggested command*: `$impeccable adapt`

- **[P2] Floating Scroll-To-Top Control**: For long viewports (About -> Activities -> Projects -> Members -> Footer), users must manually scroll back up to access the primary navbar CTAs.
  - *Why it matters*: Increases friction when users want to switch sections or log in after reading footer/members information.
  - *Fix*: Introduce a subtle floating back-to-top pill button after scrolling past 50% viewport.
  - *Suggested command*: `$impeccable delight`

#### Persona Red Flags

- **Jordan (First-Timer / Prospective Applicant)**: Navigating on mobile web, Jordan wants to quickly find HPC School registration details. The floating notice is clear, but clicking dropdown links on smaller screens requires precise tap alignment.
- **Alex (Power User / Club Alum)**: Alex scrolls rapidly to inspect Scientific Publications (`Projects.tsx`). The section layout is readable, but lacks a quick copy-to-clipboard bibtex/citation trigger.

#### Minor Observations

- Footer social icons feel clean with hover scale; consider adding tooltips for screen-reader accessibility.
- Card hover elevations perform smoothly with Framer Motion ease curves.

#### Questions to Consider

- What if we added an interactive quick-copy BibTeX snippet button for scientific publications?
- Should the floating HPC School notification auto-minimize on mobile after 5 seconds of scrolling?
