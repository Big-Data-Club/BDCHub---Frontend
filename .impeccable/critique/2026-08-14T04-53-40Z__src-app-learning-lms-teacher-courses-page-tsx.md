---
target: /lms/teacher/courses
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-14T04-53-40Z
slug: src-app-learning-lms-teacher-courses-page-tsx
---
# Critique: /lms/teacher/courses

This critique reviews the Teacher Courses page (`/lms/teacher/courses`) against the design system and patterns established in the main Teacher Dashboard (`/lms/teacher`).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Has tabs with counts and spinner loaders, but no top-level save/unsaved indicators or toast confirmations. |
| 2 | Match System / Real World | 4 | Clear Vietnamese terminology matching course management expectations. |
| 3 | User Control and Freedom | 3 | Uses native confirm dialogs for destructive actions, but lacks immediate undo states for archiving/publishing. |
| 4 | Consistency and Standards | 2 | Header layout, row hover effects, and select controls diverge from the premium dashboard styles. |
| 5 | Error Prevention | 3 | Standard confirmation dialogs prevent accidental actions. |
| 6 | Recognition Rather Than Recall | 3 | Row actions are hidden until hover (`opacity-0`), which hurts discoverability and accessibility. |
| 7 | Flexibility and Efficiency | 2 | Lacks search keyboard shortcuts (like `/` or `Ctrl+K`) and bulk action capabilities. |
| 8 | Aesthetic and Minimalist Design | 2 | Feels dry and templated; lacks the glassmorphism, background grids, and refined select designs of the dashboard. |
| 9 | Error Recovery | 3 | Standard alert banner display is functional. |
| 10 | Help and Documentation | 1 | No contextual tooltips, guidance, or info blocks about course creation or archiving rules. |
| **Total** | | **26/40** | **Acceptable (Significant improvements needed)** |

---

## Design Specificity Verdict

- **LLM Assessment**: The page is functional but lacks the high-tech, premium aesthetic defined in the "Tech-Academic Terminal" creative north star. It relies heavily on standard cards and unstyled native inputs, making it look generic. It misses the grid backgrounds, cohesive rounding, and glassmorphic card wrappers that give the dashboard its premium look.
- **Deterministic Scan**: No style issues or configuration warnings detected by the automated scanner.
- **Visual Overlays**: No live browser visual overlays are active in this run.

---

## Overall Impression

The teacher courses list page is highly functional but visually decoupled from the main teacher dashboard. By aligning its header, card designs, and filtering elements with the dashboard's design grammar, we can elevate it from a basic admin table to a premium, integrated tool.

---

## What's Working

1. **Clear Metadata Badges**: The usage of color-coded badges for statuses (Draft, Published, Archived) and course difficulty levels (Cơ bản, Trung cấp, Nâng cao) makes the list easy to scan.
2. **Infinite Scrolling Integration**: The `InfiniteScrollTrigger` allows seamless loading of courses without heavy pagination buttons, matching modern web expectations.

---

## Priority Issues

### [P1] Missing Premium Header and Theme Consistency
- **Why it matters**: Jumping from the dashboard (with its grid background, status mirror card, and active sub-navigation buttons) to this plain header breaks the mental model of a single cohesive workspace.
- **Fix**: Re-implement the header using `GridBackground`, the top-level path indicator, and the dashboard's container spacing.
- **Suggested command**: `$impeccable layout`

### [P1] Hover-Only Row Action Controls
- **Why it matters**: Hiding edit, publish, archive, and delete buttons until hover (`group-hover:opacity-100`) makes them completely inaccessible on touch screens (mobile) and difficult to find for keyboard-navigating users.
- **Fix**: Keep actions visible at all times but slightly muted/desaturated, highlighting them fully on focus/hover, or provide a dropdown menu button on smaller screens.
- **Suggested command**: `$impeccable adapt`

### [P1] Plain Native Select Elements
- **Why it matters**: The default browser `<select>` inputs for Category and Level look unstyled and basic next to the custom UI tokens and tabs of the dashboard.
- **Fix**: Replace or style the dropdown fields to match the dark navy slate inputs, utilizing themed borders and custom icons.
- **Suggested command**: `$impeccable bolder`

### [P2] Missing Search Shortcuts and Focus States
- **Why it matters**: Power users cannot quick-focus the search field using `/` or `Ctrl+K`, breaking consistency with the search field behavior on the dashboard.
- **Fix**: Wire up the keyboard listener and autofocus/refs for the search input on the courses page.
- **Suggested command**: `$impeccable layout`

---

## Persona Red Flags

- **Sam (Accessibility-Dependent User)**: The action buttons inside the row are hidden by default (`opacity-0`) and only trigger on hover. Screen readers and keyboard-only users will find it extremely difficult to focus and interact with these controls safely.
- **Casey (Distracted Mobile User)**: Hover actions do not translate well to mobile viewports. On a phone, the user cannot hover to see actions; they have to guess where to tap, and the native select elements look cramped on smaller screens.

---

## Minor Observations

- The card component wraps the entire list, but does not use the glassmorphic style (`bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-xs`) used for sidebars and secondary metrics on the dashboard.
- Course thumbnail placeholders lack styling or subtle micro-animations when loading.

---

## Questions to Consider

- Should we support bulk actions (e.g., selecting multiple courses to publish or archive at once)?
- Can we add a sidebar or an action card similar to the "AI Assistant" card on the dashboard to prompt course creation or importing?
