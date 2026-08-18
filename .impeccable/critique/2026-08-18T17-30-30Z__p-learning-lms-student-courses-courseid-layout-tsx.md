---
target: /lms/student/courses/id sidebar
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-18T17-30-30Z
slug: p-learning-lms-student-courses-courseid-layout-tsx
---
# Critique Report: LMS Student Course Sidebar

⚠️ DEGRADED: single-context (sub-agent tool unavailable/single context execution)

#### Report header provenance
⚠️ DEGRADED: single-context (sub-agent tool unavailable/single context execution)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Section loading states use pulse, but active content highlighted lacks progress depth/percentage inline. |
| 2 | Match System / Real World | 3 | Course structure terms (bài bắt buộc, tài liệu) are clear, but nested instructor accordion feels unexpected. |
| 3 | User Control and Freedom | 2 | Collapse tab toggle floats arbitrarily (`top-12 left-[288px]`), lacks standard dock affordance or quick shortcut. |
| 4 | Consistency and Standards | 2 | Arbitrary micro font size `text-[10px]` used everywhere; violates design system type ramp (`DESIGN.md`). |
| 5 | Error Prevention | 3 | Clean selection model, but no visual indicator for locked or sequential dependencies. |
| 6 | Recognition Rather Than Recall | 2 | Micro icon badges rely on high color variance (`blue`, `emerald`, `teal`, `amber`, `purple`, `sky`, `rose`) requiring color recall. |
| 7 | Flexibility and Efficiency | 1 | No quick filter for "Uncompleted" / "Mandatory", no keyboard shortcut (e.g. `[` / `]`) to toggle sidebar or jump items. |
| 8 | Aesthetic and Minimalist Design | 2 | AI-slop visual noise: nested dark blue background tinting (`bg-[#070E1C]`, `bg-[#0F1E35]/40`, `bg-[#0D192E]`), arbitrary `text-[10px]` clutter. |
| 9 | Error Recovery | 3 | Simple tab state persistence via `localStorage`; graceful fallback when empty. |
| 10 | Help and Documentation | 2 | Tooltips only on co-teacher email hovering; no quick keyboard cheat-sheet or sidebar search. |
| **Total** | | **23/40** | **Acceptable (57.5%)** |

#### Design Specificity Verdict

**LLM assessment**: The sidebar structure suffers from classic AI-generated visual clutter ("AI slop"). It layers multiple overlapping container cards (`bg-slate-50/30`, `bg-slate-50/50`, `bg-[#0F1E35]/40`), hyper-fragmented micro typography (`text-[10px]` scattered across 10+ places), and a rainbow spectrum of content-type icon backgrounds (`blue`, `emerald`, `teal`, `amber`, `purple`, `sky`, `rose`). It lacks the sharp, disciplined "Tech-Academic Terminal" character promised in `DESIGN.md`. Furthermore, the collapse toggle tab is an floating tab positioned at an arbitrary fixed pixel offset (`left-[288px] xl:left-[320px] top-12`) that looks ungrounded and fragile.

**Deterministic scan**: Detector found 9 issues across `CourseLearningSidebar.tsx` and `SidebarSection.tsx`:
- 7x `design-system-font-size` advisory warnings for unapproved `text-[10px]` arbitrary classes.
- 2x `gray-on-color` warnings in `SidebarSection.tsx` (`text-slate-950` on `bg-blue-600`).

**Visual overlays**: Browser injection was not executed in this headless run; deterministic findings were validated directly against source AST/markup.

#### Overall Impression
The sidebar functions well structurally but feels overly decorated and noisy. Simplifying container layering, establishing a clean monocolor icon hierarchy with status accents, standardizing typography to the design system ramp, and refining the collapse toggle will instantly transform this from "generic AI template" to a sleek, high-precision learning navigation dock.

#### What's Working
1. **State Persistence**: Remembers sidebar collapse preference cleanly via `localStorage`.
2. **Clear Completion Badging**: Direct visual checkmark (`CheckCircle2`) and mandatory indicator dot (`bg-amber-500`) clearly differentiate completed vs required items.
3. **Structured Hierarchy**: Accordion-based section breaking keeps long course curricula digestible.

#### Priority Issues

- **[P1] Visual Noise & "AI Slop" Container Layering**: Nested semi-transparent background cards (`bg-slate-50/50`, `bg-[#0F1E35]/40`, `border-blue-500/8`) inside the instructor section create muddy visual contrast and unnecessary visual depth.
  - *Why it matters*: Distracts the student and degrades readability in dark mode.
  - *Fix*: Flatten instructor card into clean, subtle horizontal row separators without nested backdrop cards.
  - *Suggested command*: `$impeccable quiet` or `$impeccable distill`

- **[P1] Arbitrary Micro-Typography (`text-[10px]`) & Off-Ramp Violations**: Widespread use of arbitrary `10px` text for course tags, emails, role badges, and step counters violates `DESIGN.md`.
  - *Why it matters*: Micro text is hard to read on mobile/laptop screens and breaks typographic consistency.
  - *Fix*: Standardize utility text to `text-xs` (12px) with controlled font weights and muted slate tokens (`text-slate-500` / `dark:text-slate-400`).
  - *Suggested command*: `$impeccable typeset`

- **[P1] Rainbow Content-Type Icon Badges**: 7 different background colors for content types (`VIDEO`, `DOCUMENT`, `IMAGE`, `TEXT`, `QUIZ`, `FORUM`, `ANNOUNCEMENT`) create a chaotic visual rainbow in the sidebar list.
  - *Why it matters*: High visual cognitive load; student focus is drawn to background colors rather than content titles and completion status.
  - *Fix*: Use a unified neutral low-contrast icon container (`bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400`) and reserve color accents strictly for `isActive` (Tech Blue / Cyber Cyan) and completion states.
  - *Suggested command*: `$impeccable colorize` / `$impeccable quiet`

- **[P2] Ungrounded Floating Sidebar Collapse Button**: The desktop toggle tab is hardcoded with `top-12 left-[288px] xl:left-[320px]`, floating outside the flex structure and risking misalignment.
  - *Why it matters*: Looks like a misplaced floating element and can clip or misalign on non-standard viewport transitions.
  - *Fix*: Integrate collapse control directly into a clean header/footer dock bar within the sidebar frame or use smooth flex width animation with a edge-aligned trigger.
  - *Suggested command*: `$impeccable layout`

- **[P2] Lack of Power User Filtering & Keyboard Navigation**: Students cannot quickly filter for "Uncompleted" or "Mandatory" lessons, nor press hotkeys (like `[` or `Ctrl+B`) to toggle the sidebar.
  - *Why it matters*: Power users / students navigating heavy course loads face tedious scrolling and clicking.
  - *Fix*: Add a minimal search/filter bar or quick toggle chip ("Chưa hoàn thành") and register a `[ ` keyboard shortcut.
  - *Suggested command*: `$impeccable adapt` / `$impeccable delight`

#### Persona Red Flags

**Alex (Power User)**: No keyboard shortcut to expand/collapse sidebar or jump to next lesson. Must manually click tiny 24px section header buttons to open/close modules. High friction when grinding through multiple lessons.

**Jordan (First-Timer)**: Overwhelmed by 7 different icon colors in the section list. Instructor information is hidden behind a collapsed "Giảng viên phụ trách" header accordion by default, making it hard to know who is teaching.

**Sam (Accessibility-Dependent User)**: Contrast warnings on active blue badges (`text-slate-950` on `bg-blue-600`). Micro `10px` text is illegible when zoomed or on low-resolution screens.

#### Minor Observations
- Active item highlight uses `bg-blue-50/80 dark:bg-[#0F1E35]` which blends into section expanded background.
- Instructor accordion default state is collapsed (`isTeachersExpanded = false`), requiring extra clicks to view instructor credentials.

#### Questions to Consider
- *What if the sidebar icon badges were uniform monochrome slate, letting the active item and checkmarks be the only bright colors?*
- *Should the instructor section live cleanly at the bottom of the sidebar as a pinned footer, or stay at the top without nested container boxes?*
- *Could we add a quick progress filter ("Chỉ hiện bài chưa xong") to help students focus on remaining work?*
