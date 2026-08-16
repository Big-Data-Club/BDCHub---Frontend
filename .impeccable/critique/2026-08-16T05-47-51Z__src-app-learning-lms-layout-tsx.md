---
target: src/app/(learning)/lms/layout.tsx
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-16T05-47-51Z
slug: src-app-learning-lms-layout-tsx
---
# Critique report for LMS Layout & Navigation Shell
Target: src/app/(learning)/lms/layout.tsx

## Design Health Score (26/40 - Acceptable)
- Visibility of System Status: 3/4
- Match System / Real World: 3/4
- User Control and Freedom: 2/4
- Consistency and Standards: 2/4
- Error Prevention: 3/4
- Recognition Rather Than Recall: 3/4
- Flexibility and Efficiency: 2/4
- Aesthetic and Minimalist Design: 2/4
- Error Recovery: 3/4
- Help and Documentation: 3/4

## Design Specificity Verdict
- LLM Review: Layout acts as generic global hub sidebar rather than contextual LMS app shell.
- Deterministic Scan: 2 font-size ramp violations (`text-[9px]`).

## Priority Issues
1. [P1] Context Mismatch: Global Sidebar used inside LMS service instead of dedicated course/LMS navigation shell.
2. [P1] Unfocused Top Header & Mobile Header: Missing LMS page context, course search, breadcrumbs, and role switcher.
3. [P2] Inconsistent Design System & Type Ramp: Raw font size `text-[9px]` breaking DESIGN.md typography rule.
4. [P2] Lack of LMS-specific Quick Actions & Status Indicators: Role status (Student/Teacher) is hidden inside session/script logic without visible toggle UI.
