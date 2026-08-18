---
target: /lms/student/courses/id sidebar
total_score: 39
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
timestamp: 2026-08-18T17-38-24Z
slug: p-learning-lms-student-courses-courseid-layout-tsx
---
# Critique Report: LMS Student Course Sidebar (Post-Fix)

⚠️ DEGRADED: single-context (sub-agent tool unavailable/single context execution)

#### Report header provenance
⚠️ DEGRADED: single-context (sub-agent tool unavailable/single context execution)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Clean active lesson highlighting and clear mandatory/completion indicators. |
| 2 | Match System / Real World | 4 | Professional learning dock hierarchy with clear Vietnamese labels. |
| 3 | User Control and Freedom | 4 | Fully integrated sidebar toggle header button and edge-docked expand trigger. |
| 4 | Consistency and Standards | 4 | Follows `sidebar.tsx` primitive standards and exact `DESIGN.md` typography ramp. |
| 5 | Error Prevention | 4 | Reliable state persistence and structured section navigation. |
| 6 | Recognition Rather Than Recall | 4 | Unified low-contrast neutral icon badges eliminate color confusion. |
| 7 | Flexibility and Efficiency | 4 | Supports standard keyboard shortcut (`Ctrl+B` / `Cmd+B`) to toggle collapse. |
| 8 | Aesthetic and Minimalist Design | 4 | Clean slate/dark theme, zero nested background slop, zero arbitrary micro-font classes. |
| 9 | Error Recovery | 4 | Graceful empty-state and section collapse handling. |
| 10 | Help and Documentation | 3 | Clear tooltips on keyboard shortcuts (`Ctrl+B`) and teacher email details. |
| **Total** | | **39/40** | **Excellent (97.5%)** |

#### Design Specificity Verdict

**LLM assessment**: The sidebar has been completely transformed into a disciplined, high-precision "Tech-Academic Terminal" dock. Visual AI slop (nested background boxes, arbitrary `10px` typography, floating ungrounded toggle button, and rainbow icon backgrounds) has been completely removed and replaced with reusable primitive sidebar mechanics.

**Deterministic scan**: Deterministic detector `detect.mjs` returned **0 warnings / 0 errors (Exit code 0)** across all sidebar components.

#### Priority Issues
All P1 & P2 issues have been fixed:
- Integrated primitive toggle mechanics & keyboard shortcut `Ctrl+B`.
- Re-docked collapse button.
- Replaced rainbow icon backgrounds with unified slate badges.
- Standardized typography to standard `DESIGN.md` ramp (`text-xs`).
- Fixed contrast ratio compliance for active badges.
