---
target: src/app/(learning)/lms/teacher/courses/page.tsx
total_score: 38
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
timestamp: 2026-08-14T05-29-40Z
slug: src-app-learning-lms-teacher-courses-page-tsx
---
# Design Critique: CoursesListPage
Target: `src/app/(learning)/lms/teacher/courses/page.tsx`

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Solid. Mirrored summary card, load spinner and active action processing. |
| 2 | Match System / Real World | 4 | Clear Vietnamese terms aligned with LMS context. |
| 3 | User Control and Freedom | 4 | Search input has an instant X clear trigger; dynamic filter updates. |
| 4 | Consistency and Standards | 4 | Complies with BDCourse tokens (rounded-xl inputs, rounded-3xl container, deep cosmic dark backgrounds). |
| 5 | Error Prevention | 4 | Explicit confirmation prompts for destructive status changes. |
| 6 | Recognition Rather Than Recall | 4 | Accessible layout with shortcut indicator (/) and hover icons with context labels. |
| 7 | Flexibility and Efficiency | 4 | Keyboard focus handler, multiple filter levels, client-side sorting options, and desktop header sort. |
| 8 | Aesthetic and Minimalist Design | 4 | Clean typography hierarchy, strict standard margins, flat dark depth. |
| 9 | Error Recovery | 3 | Error alerts visible on top, but could preserve state in more complex error cases. |
| 10 | Help and Documentation | 3 | Basic description copy, but no direct help doc link within courses list scope. |
| **Total** | | **38/40** | **Excellent** |

## Design Specificity Verdict

**LLM Assessment:** Extremely coherent layout tailored for Big Data Club LMS ("Tech-Academic Terminal"). Incorporates custom `GridBackground`, mirroring analytical cards, and custom category badges. 

**Deterministic Scan:** Automated detector returned `0` findings. All previous raw text size violations (e.g. `text-[10px]`, `text-[11px]`) have been successfully resolved into standard `text-xs` steps.

**Visual Overlays:** Fallback mode active (Single-context run). No human overlay injected.

## Overall Impression
Highly responsive and structured dashboard interface. It cleanly splits analytical summary metrics from operational lists. The filter panel and the dynamic table layout feel cohesive and functional.

## What's Working
- **Adaptive Layout:** Gracefully switches from desktop tabular display to mobile cards view.
- **Client-side Sorting & Clickable Headers:** Combining header sorting with a filter select box provides high UX authority.

## Priority Issues
- **[P3] Error Recovery Preservation**: If loading failed, clicking refresh might reset active page filter state unless cached.
  - *Fix*: Cache search and filters in URL params or sessionStorage.
  - *Suggested command*: `$impeccable polish`
- **[P3] Help link fallback**: No direct link to the LMS User Manual or teacher guidance.
  - *Fix*: Add a help icon linking to guidance docs in the layout/header.
  - *Suggested command*: `$impeccable clarify`

## Persona Red Flags

**Alex (Power User)**:
- High keyboard efficiency with the `/` hotkey for search. Fully keyboard tabbing navigation supported. Action speed is high with instant interactive table hovers.

**Jordan (First-Timer)**:
- Direct Vietnamese actions ("Xuất bản", "Nháp", "Lưu trữ") and simple visual metrics help Jordan understand course statuses immediately without system confusion.

## Minor Observations
- Tooltips or hover labels on table action buttons can enhance first-time clarity even further.

## Questions to Consider
- Should we synchronize the filter/sort states with the browser URL query string? (Allows teachers to copy and share pre-filtered lists).
