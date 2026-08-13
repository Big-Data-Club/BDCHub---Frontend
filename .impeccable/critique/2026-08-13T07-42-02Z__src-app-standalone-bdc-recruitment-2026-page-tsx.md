---
target: src/app/(standalone)/bdc-recruitment-2026/page.tsx
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-13T07-42-02Z
slug: src-app-standalone-bdc-recruitment-2026-page-tsx
---
# Design Critique: bdc-recruitment-2026/page.tsx

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good step indicators, but lack of transition feedback between step changes. |
| 2 | Match System / Real World | 4 | Natural vocabulary suited for HCMUT students (GPA, student ID, THPT/ĐGNL). |
| 3 | User Control and Freedom | 3 | Navigation controls work, but lacks a simple in-wizard reset or clear action. |
| 4 | Consistency and Standards | 3 | Input fields match styling, though some ad-hoc pixel values (11px) are used. |
| 5 | Error Prevention | 3 | Good step-based validation and auto-save draft mechanism. |
| 6 | Recognition Rather Than Recall | 4 | Clean input layout with clear labels and prefix icons. |
| 7 | Flexibility and Efficiency | 2 | Rigid single-path workflow with no keyboard shortcuts for fast navigation. |
| 8 | Aesthetic and Minimalist Design | 3 | Minimalist form design, but gradient text headers add minor visual noise. |
| 9 | Error Recovery | 3 | Toast notifications and inline errors display correctly, but could be more descriptive. |
| 10 | Help and Documentation | 2 | Lacks contextual hints or tooltips for complex uploads (e.g. CV format/size). |
| **Total** | | **30/40** | **Good** |

## Design Specificity Verdict

**LLM Assessment:**
The recruitment form has a solid structure matching "The Tech-Academic Terminal" aesthetic. It integrates branding logos for HCMUT, CSE, and BDC cleanly. However, it relies heavily on standard wizard form paradigms. There is an opportunity to make the experience feel more tailored by reducing the clutter of multiple header logos and replacing gradient headers with cleaner, solid technical accents.

**Deterministic Scan:**
The automated detector identified **6 findings** in [page.tsx](file:///home/thanh/BDCHub---Frontend/src/app/(standalone)/bdc-recruitment-2026/page.tsx):
- **Gradient text** on lines 318 and 357 (decorative gradient headings).
- **Gray text on colored background** on line 286 (false positives triggered by `selection:bg-blue-500` matching alongside standard text colors).
- **Font size outside DESIGN.md** on lines 320 and 423 (use of literal `text-[11px]` which deviates from the typography hierarchy).

## Overall Impression
A highly functional, well-structured multi-step wizard that succeeds in preventing user data loss. The visual layout is clean but would benefit from strict adherence to the new design system typography (replacing `11px` sizes) and a cleaner heading approach.

## What's Working
- **Draft Autosave:** LocalStorage persistence is perfectly integrated, preventing loss of student application data.
- **Clear Navigation Stepper:** The progress bar and node indicators give excellent feedback on completion status.

## Priority Issues

- **[P1] Out of System Typography**: Literal `text-[11px]` is used on step labels and sub-headers.
  - *Why it matters*: Violates typographic rhythm and consistency established in `DESIGN.md`.
  - *Fix*: Replace `text-[11px]` with standard class sizes or update the typography config.
  - *Suggested command*: `npx node@18 .agents/skills/impeccable/scripts/run.mjs typeset src/app/(standalone)/bdc-recruitment-2026/page.tsx`
- **[P1] Decorative Gradient Text**: Gradient fills are applied to the header title and hero description.
  - *Why it matters*: Falls into common generic AI-design/slop anti-patterns, reducing readability and formal look.
  - *Fix*: Replace gradient headings with solid colors or high-contrast Tech Blue.
  - *Suggested command*: `npx node@18 .agents/skills/impeccable/scripts/run.mjs colorize src/app/(standalone)/bdc-recruitment-2026/page.tsx`

## Persona Red Flags

- **Jordan (First-Timer)**: No details on file size limits or supported types for CV/Evidence uploads. May try uploading unsupported files and encounter cryptic failures.
- **Alex (Power User)**: Keyboard-only navigation is limited. Cannot press "Enter" to proceed to the next step when focused on inputs.

## Minor Observations
- The header displays four separate logos, which creates visual noise on smaller viewports.
- The toast alert for errors uses a hardcoded rose-600 background rather than a semantic color variable.

## Questions to Consider
- Should we simplify the header by showing only the BDC logo on mobile screens?
- Would adding keyboard shortcuts (e.g. Command/Control + Enter to go to next step) improve usability for power users?
