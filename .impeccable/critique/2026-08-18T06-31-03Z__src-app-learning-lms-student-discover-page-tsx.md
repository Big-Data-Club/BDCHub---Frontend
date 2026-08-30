---
target: /lms/student/discover
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-18T06-31-03Z
slug: src-app-learning-lms-student-discover-page-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeleton loading present, but inline filtering lacks subtle search/filter activity indicator. |
| 2 | Match System / Real World | 3 | Natural terminology overall, though some raw backend enum states peek through. |
| 3 | User Control and Freedom | 2 | No "Clear All Filters" button; preference modal lacks ESC key handling. |
| 4 | Consistency and Standards | 2 | Raw inline tailwind buttons in page vs reusable component buttons; arbitrary `text-[10px]` sizes. |
| 5 | Error Prevention | 3 | Input fields in preference modal lack validation and chip feedback. |
| 6 | Recognition Rather Than Recall | 3 | Active tag highlighted, but search bar lacks active filter counts and recent hints. |
| 7 | Flexibility and Efficiency | 2 | No search hotkey (`/`), no sorting options (Popular, Rating, Newest). |
| 8 | Aesthetic and Minimalist Design | 2 | Generic AI slop tropes (`Sparkles` icons, blue-cyan gradients) cluttering visual hierarchy. |
| 9 | Error Recovery | 3 | Error Alert and EmptyState provide clear guidance. |
| 10 | Help and Documentation | 2 | Missing context on how AI recommendations are calculated from student preferences. |
| **Total** | | **25/40** | **Acceptable** |

#### Design Specificity Verdict

**LLM assessment**: The surface is functional but relies on generic AI aesthetics ("AI slop") - throwing `<Sparkles />` icons and generic `from-blue-600 to-cyan-600` gradients onto standard card grids without deep UX value. It lacks the sharp structural polish, tactile feedback, and high-contrast terminal styling defined in the project's "Tech-Academic Terminal" design system (`DESIGN.md`).

**Deterministic scan**: 3 findings detected across `page.tsx` and `CourseCard.tsx`:
- `design-system-font-size` (advisory): `text-[10px]` on line 93 of `page.tsx` violates `No-Literal-Scale Rule`.
- `gray-on-color` (warning): `text-slate-800` on `bg-blue-950` in `CourseCard.tsx` (low contrast).
- `design-system-font-size` (advisory): `text-[7px]` on line 127 of `CourseCard.tsx`.

#### Overall Impression
The LMS Student Discover surface provides core searching and recommendation features, but visually degrades into generic AI placeholder tropes. Elevating this page requires replacing superficial AI embellishments with meaningful match reasoning, standardizing UI controls to design system tokens, adding rich filtering/sorting, and implementing keyboard shortcuts.

#### What's Working
- Clean breadcrumb navigation and subtle background grid accent (`GridBackground`).
- Structured skeleton cards and empty states for course grid loading states.
- Smooth infinite scroll integration for pagination.

#### Priority Issues

- **[P1] AI Slop & Superficial AI Integration**: Generic `Sparkles` badges and cyan gradients don't convey *why* a course was recommended or match user goals.
  - *Why it matters*: Users distrust generic "AI" tags without tangible relevance scores or match reasons.
  - *Fix*: Replace generic AI badges with a structured "Match Score & Reason" chip (e.g. `98% Match · Data Science Goal`), and refine the header action to feel integrated into the terminal aesthetic.
  - *Suggested command*: `$impeccable bolder`

- **[P1] Unstructured Filter Bar & Inconsistent UI Controls**: Filter tags use raw tailwind inline buttons (`page.tsx`) with hardcoded colors instead of design system button components or unified tab filters. No sort control (e.g., Popular, Newest, Rating) or quick "Clear Filters" action.
  - *Why it matters*: Scalability issue-as tags grow, raw wrap buttons overflow clumsily without horizontal scrolling or categorical grouping.
  - *Fix*: Redesign filter bar with scrollable tag chips, active filter counter, search input integration, and sort dropdown.
  - *Suggested command*: `$impeccable layout`

- **[P2] Design System & Token Deviations**: Arbitrary font sizes (`text-[10px]`, `text-[7px]`) and low-contrast text combinations (`text-slate-800` on `bg-blue-950`).
  - *Why it matters*: Violates DESIGN.md "No-Literal-Scale Rule" and WCAG color contrast guidelines.
  - *Fix*: Standardize metadata fonts to `text-xs` / `text-2xs` design tokens and fix contrast pairs.
  - *Suggested command*: `$impeccable audit`

- **[P2] Weak Keyboard & Power User Controls**: Missing search shortcut (pressing `/` to focus search bar), missing keyboard trap in modal, and lack of quick course preview.
  - *Why it matters*: Slows down navigation for student power users browsing dozens of courses.
  - *Fix*: Add hotkey listener `/` for search, ESC to close modal, and shortcut hints in placeholders.
  - *Suggested command*: `$impeccable adapt`

#### Persona Red Flags
- **Jordan (First-Timer)**: Sees "Mục tiêu học tập AI" button with generic `Sparkles`, opens modal with comma-separated raw input field (`VD: Python, Data Science, AI`), creating confusion on how inputs translate to actual course recommendations.
- **Alex (Power User)**: Tries to press `/` to search or `Esc` to close preference modal; no keyboard shortcuts exist. Has to manually reset filter tags and level selector separately because there is no 1-click reset action.
- **Sam (Accessibility)**: Arbitrary tiny font sizes (`text-[7px]`, `text-[10px]`) and `text-slate-800` on `bg-blue-950` create contrast and legibility issues.

#### Minor Observations
- The recommendation section header uses hardcoded `text-blue-600 dark:text-cyan-400` icon styling instead of consistent system badge tokens.
- Tag selection buttons lack focus-visible outlines for keyboard tab navigation.

#### Questions to Consider
- What if recommended courses displayed *why* they match the student's specific career goal directly on the card header?
- How might we replace raw comma-separated text input in AI preferences with interactive skill tags / selector chips?
- What would a true "Tech-Academic Terminal" discovery dashboard look like with quick course preview drawers and instant keyboard filtering?
