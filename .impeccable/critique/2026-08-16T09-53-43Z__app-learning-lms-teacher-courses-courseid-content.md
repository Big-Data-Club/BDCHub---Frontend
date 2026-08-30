---
target: src/app/(learning)/lms/teacher/courses/[courseId]/content
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-16T09-53-43Z
slug: app-learning-lms-teacher-courses-courseid-content
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dynamic reorder and deletion lack optimistic state/undo indicators; micro-job statuses are isolated in drawers. |
| 2 | Match System / Real World | 3 | High domain fidelity for LMS course structures, though button tooltips mix Vietnamese ("Tạo bài học micro") and English terms. |
| 3 | User Control and Freedom | 2 | Drag handles are hidden behind mouse hover states without visual grab cues; no quick "Collapse All / Expand All" or Bulk Reorder confirmation. |
| 4 | Consistency and Standards | 2 | Top toolbar features 6 different button color variations (Indigo, White, Violet, Emerald, Slate) creating high visual noise and competing hierarchy. |
| 5 | Error Prevention | 3 | Destructive actions use standard browser `confirm()`, but reordering network failures revert silently to prior state without toast alerts. |
| 6 | Recognition Rather Than Recall | 2 | 5+ action icons inside section/content rows are hover-only, forcing teachers to hover over rows to discover edit/preview/AI tools. |
| 7 | Flexibility and Efficiency | 3 | Good drag-and-drop support for sections and content, but lacks keyboard sorting or keyboard shortcut support for power teachers. |
| 8 | Aesthetic and Minimalist Design | 2 | Header and top action bar overload the viewport with competing cards, badges, and colors, breaking the "Accent Rarity Rule". |
| 9 | Error Recovery | 2 | Relies on browser-native alerts; failed operations lack inline recovery hints or contextual retry triggers. |
| 10 | Help and Documentation | 2 | Tooltips describe AI action goals, but there is no inline explanation of how AI Indexing or Micro-Lessons integrate into student learning paths. |
| **Total** | | **24/40** | **Acceptable (60%)** |

#### Design Specificity Verdict

**LLM assessment**: The Teacher Course Content Management interface achieves solid functional depth (supporting drag-and-drop reordering, section-level AI overview generation, micro-lessons, and document indexing). However, it falls into visual overload and discoverability traps. Rather than adhering to the **Tech-Academic Terminal** design system's discipline-where high-contrast blue/cyan accents are reserved strictly for key interactive elements-the top toolbar uses a chaotic rainbow of colors (indigo, purple, emerald, white, slate). Furthermore, critical section-level management tools rely on hover-only visibility, forcing teachers to play "mouse hover hunting" to discover features like AI generation or content preview.

**Deterministic scan**: `detect.mjs` returned 0 mechanical violations across `ContentTab.tsx` and `CourseDetailLayout.tsx`. The code is clean of basic anti-patterns, but structural composition, color harmony, and interaction ergonomics require refinement.

**Visual overlays**: No browser overlay attached (static code analysis pass).

#### Overall Impression
A feature-packed, high-capability teacher course content workspace that currently feels visually noisy and interaction-heavy. Harmonizing the toolbar actions, surfacing row actions predictably, and cleaning up the header visual weights will elevate it from a functional utility to an executive-grade teaching hub.

#### What's Working
1. **Robust Structural Hierarchy**: Clear visual distinction between Course Header metadata, Section Cards (`rounded-2xl bg-white dark:bg-slate-900`), and nested Content Items with index badges and type tags.
2. **Comprehensive AI Integration**: Rich set of AI tools (Index Status, Micro Lessons, Micro Quizzes, Section Overviews) seamlessly wired into the course creation workflow.
3. **Smooth Reordering Affordance**: Built-in drag-and-drop reordering logic with grip handles for both sections and section contents.

#### Priority Issues

- **[P1] Visual Noise & Toolbar Color Saturation (Violation of Accent Rarity Rule)**
  - *Why it matters*: The top action bar presents 5+ primary color buttons side-by-side (Indigo for Bulk Upload, Violet for Micro-Lessons, Emerald for Micro-Quizzes, White/Slate for History, Blue for Add Section). This creates intense cognitive noise, competing focus, and violates the design system's requirement that vibrant accents remain rare and strategic.
  - *Fix*: Consolidate AI tools into a single sleek split button / dropdown menu ("✨ AI Assist"), standardizing secondary actions into cohesive slate/navy subtle buttons with consistent iconography.
  - *Suggested command*: `$impeccable colorize` or `$impeccable layout`

- **[P1] Hidden Actions via Hover-Only Visibility (Discoverability & Mobile Risk)**
  - *Why it matters*: Content item actions (Micro Lesson, Micro Quiz, Preview, Edit, Delete) are set to `opacity-0 group-hover:opacity-100`. On touch devices or for first-time teachers, these actions are entirely invisible until hovered over.
  - *Fix*: Keep essential action icons visible at low opacity (`opacity-60 hover:opacity-100`) or group secondary actions into a clean "..." action dropdown menu.
  - *Suggested command*: `$impeccable clarify` or `$impeccable layout`

- **[P2] Header & Card Visual Weight Competition**
  - *Why it matters*: In `CourseDetailLayout.tsx`, the top header contains Breadcrumbs, Title, Subtitle, Tab Bar, AND a heavy right-hand "Trạng thái cấu hình" card. This card steals focus from the main page title and crowds the top viewport on standard desktop screens.
  - *Fix*: Streamline the course status card into a compact inline metadata bar below the course title, freeing top-right spatial grid for primary course status badges and breadcrumb alignment.
  - *Suggested command*: `$impeccable layout`

- **[P2] Absence of Global Bulk Controls (Expand/Collapse & Multi-Select)**
  - *Why it matters*: When managing a course with 10+ sections, teachers have to manually expand/collapse each section item one by one. There are no "Expand All" / "Collapse All" toggle controls.
  - *Fix*: Add a compact header utility toggle: `Expand All` / `Collapse All` alongside the section count badge.
  - *Suggested command*: `$impeccable adapt` or `$impeccable layout`

#### Persona Red Flags

- **Alex (Power User)**: Forced to click through 6 individual section accordions to inspect content; lacks keyboard navigation or hotkeys (e.g. `Cmd+N` to add section, `Cmd+E` to expand all).
- **Jordan (First-Timer)**: Overwhelmed by the row of colorful buttons at the top ("Upload chung", "Lịch sử Lesson", "Lịch sử Quiz", "Tạo bài học micro", "Tạo micro quiz", "Thêm chương"); unsure which AI button does what without clicking each one.
- **Sam (Accessibility-Dependent User)**: Hover-only drag handles and action buttons lack visible focus rings during keyboard tabbing; `confirm()` dialogs block screen-reader focus flow.

#### Minor Observations
- Reordering failure reverts local state silently without displaying a toast notification to warn the user.
- Drag handle icon (`GripVertical`) uses small touch targets (`p-1`), making mouse grabbing imprecise.
- Badge color combinations in nested content items (e.g. `is_mandatory` badge + `ContentTypeBadge` + `AIIndexButton`) wrap awkwardly on medium viewports.

#### Questions to Consider
- *Could AI generation tools (Micro Lessons, Micro Quizzes, Section Overviews) be unified under a single contextual "AI Studio" menu to clean up the interface?*
- *Should we introduce a batch action bar when selecting multiple content items for bulk deletion or moving between sections?*
- *Would a sticky section quick-nav or mini-table of contents help teachers navigate large courses faster?*
