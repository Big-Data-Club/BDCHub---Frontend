---
target: src/app/(learning)/lms/teacher/page.tsx
total_score: 34
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
timestamp: 2026-08-13T14-16-36Z
slug: src-app-learning-lms-teacher-page-tsx
---
# Design Critique: Teacher Dashboard

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Solid status indicators, though dashboard loading/refresh details can be made even more interactive. |
| 2 | Match System / Real World | 4 | Clear Vietnamese domain terminology matching local academic LMS expectations. |
| 3 | User Control and Freedom | 3 | Easy navigation and role switching, but search filter lacks a quick-clear escape button. |
| 4 | Consistency and Standards | 3 | Mirrored layout matches student pages, but relies on literal off-ramp font sizes (9px, 10px, 11px). |
| 5 | Error Prevention | 4 | Robust page-level role guards and sessionStorage cache handling. |
| 6 | Recognition Rather Than Recall | 3 | Highly visible actions, but search matches do not show active filtered item counts. |
| 7 | Flexibility and Efficiency | 3 | Accelerators for quick actions are visible, but lacks batch operations for course states. |
| 8 | Aesthetic and Minimalist Design | 4 | Extremely clean, modern, and aligned with BDC's Tech-Academic Terminal aesthetic without AI visual tells. |
| 9 | Error Recovery | 3 | Explicit user alerts for API or system connection failures. |
| 10 | Help and Documentation | 4 | Contextual onboarding notes and guides for the AI Assistant. |
| **Total** | | **34/40** | **Good** |

## Design Specificity Verdict

- **LLM assessment**: The page is customized for the BDCourse design identity, using the "Tech-Academic Terminal" style, grid overlays, and mirrored panel structures from the student section. The AI Assistant card is now quieted and fully aligned with the BDCourse design tokens.
- **Deterministic scan**: The automated design detector identified 5 findings:
  - 5 advisories for `design-system-font-size` (using literal `text-[9px]`, `text-[10px]`, `text-[11px]` which are off the design system ramp).
  - The previous warnings for `ai-color-palette` and `bounce-easing` have been successfully resolved.

## Overall Impression
A highly structured, clean, and calm interface that matches the student dashboard designs. The visual grid, charts, and table are easy to scan, with the AI-slop tells resolved.

## What's Working
- **Mirrored Layout Symmetry**: The grid headers and two-column design match the student pages perfectly, making role transitions seamless.
- **Quieted AI Assistant Card**: Card background, borders, and animations are refined to align with BDC design tokens.
- **Rich Data Density**: Using recharts comparison bars and progress status indicators offers teachers an immediate, functional overview of course completion and grades.

## Priority Issues

- **[P2] Off-Ramp Literal Font Sizes**: Small text in tables and badges uses literal font sizes (`text-[9px]`, `text-[10px]`, `text-[11px]`) which are off the documented type ramp in `DESIGN.md`.
  - *Fix*: Map these small sizes to standard system classes like `text-xs` (12px).
  - *Suggested command*: `$impeccable typeset`
- **[P2] Missing Clear Search Affordance**: The courses search filter lacks a dedicated clear button to quickly reset search input states.
  - *Fix*: Display an inline "x" close button when search text is active.
  - *Suggested command*: `$impeccable layout`

## Persona Red Flags

- **Alex (Power User)**: Searching and filtering are immediate, but there is no keyboard shortcut (e.g. `/` to focus search) and no way to bulk-publish draft courses, which slows down power workflows.
- **Sam (Accessibility-Dependent User)**: The literal font sizes of 9px and 10px are extremely small and drop below legible threshold constraints for low-vision users. The search field and headers lack ARIA status tags for announcing filter counts.

## Minor Observations
- Table thumbnails have no default alt titles.
- The refresh indicator has no rotating transition during background sync.
