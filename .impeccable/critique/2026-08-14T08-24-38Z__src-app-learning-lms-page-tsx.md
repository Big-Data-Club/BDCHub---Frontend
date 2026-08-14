---
target: src/app/(learning)/lms/page.tsx
total_score: 33
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-08-14T08-24-38Z
slug: src-app-learning-lms-page-tsx
---
# Critique: LMS Role Selection Page (`/lms`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Loading state is clear, but redirecting states lack visual progress indicators. |
| 2 | Match System / Real World | 4/4 | Terminology is clear, using natural Vietnamese role labels ("Học viên", "Giảng viên", "Quản trị viên"). |
| 3 | User Control and Freedom | 3/4 | "Quay lại trang chủ" is easily accessible, but there is no exit/logout option directly from this page if user logged in with the wrong account. |
| 4 | Consistency and Standards | 3/4 | Uses the correct BDC theme tokens (slate, blue, cyan), but offset animation only triggers on hover, not keyboard focus. |
| 5 | Error Prevention | 4/4 | Proactively redirects users if they only have a single role, preventing redundant selection clicks. |
| 6 | Recognition Rather Than Recall | 4/4 | Card displays key features of each role clearly, reducing cognitive load on what each role does. |
| 7 | Flexibility and Efficiency of Use | 2/4 | Lacks keyboard shortcut or arrow-key navigation to quickly select a role card. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Clean layouts, but feature bullet lists inside cards could be grouped better; the offset shadow border is slightly loud. |
| 9 | Error Recovery | 4/4 | Excellent error state layout with clear action buttons when roles cannot be fetched. |
| 10 | Help and Documentation | 3/4 | Helpful footer tip informs users they can switch roles later, but lacks direct link to user guides. |
| **Total** | | **33/40** | **Good** |

---

## Design Specificity Verdict

### LLM Assessment
The design is tailored specifically for the BDC Course platform. It aligns well with the "Tech-Academic Terminal" aesthetic, utilizing a futuristic Grid Background, deep cosmic dark mode colors (`#050B18`, `#0F1E35`), and high-tech blue/cyan accents. 

However, the hover offset effect (brutalist style pop-out) feels slightly inconsistent with the ultra-clean, high-tech grid vibe of the rest of the application. It behaves dynamically, but does not extend to accessibility focus states.

### Deterministic Scan
The automated detector ran on `src/app/(learning)/lms/page.tsx` and `src/components/lms/RoleSelectionCard.tsx`, identifying **2 warnings**:
- **Gray text on colored background**: `text-slate-950` combined with `bg-blue-950` and `bg-blue-50`.
  - *Note*: One is a false positive due to static parsing of `dark:group-hover:text-slate-950` with `dark:group-hover:bg-cyan-500` (which is actually high contrast).
  - *Correction*: The warning in `src/app/(learning)/lms/page.tsx` line 131 is valid for dark mode legibility.

### Visual Overlays
No browser overlay injection was executed (run via CLI).

---

## Overall Impression
The LMS Role Selection page is a clean, well-thought-out gateway. The auto-redirection logic for single-role users is excellent. The card hover states are playful but need refinement in contrast and accessibility behavior.

---

## What's Working
1. **Auto-Redirection UX**: Instantly redirects users if they only possess one role, bypassing unnecessary decision steps.
2. **Atmospheric Aesthetics**: The Grid Background with the radial glow gradient frames the container perfectly, establishing high design authority.
3. **Structured Visual Cards**: Clear list of features for each role prevents guessing what access they grant.

---

## Priority Issues

### [P1] Accessibility of the Card Container
- **Why it matters**: The entire card is a `<button>`, which makes it hard for screen readers to navigate the internal hierarchy (e.g. headers, feature lists). It also only displays the offset hover state on mouse-hover, ignoring keyboard focus.
- **Fix**: Bind the offset translation to both focus and hover states (`group-hover:opacity-100 group-focus-within:opacity-100` and `group-focus-within:-translate-x-1`). Ensure the button has proper ARIA attributes to describe the entire card cleanly.
- **Suggested command**: `$impeccable layout`

### [P2] Text Contrast & Readability in Dark Mode
- **Why it matters**: The description text in dark mode (`text-slate-400` on `#0F1E35`) has a contrast ratio below WCAG AA compliance (4.5:1).
- **Fix**: Increase the description color to `dark:text-slate-300` or `dark:text-slate-200` to enhance readability.
- **Suggested command**: `$impeccable colorize`

### [P2] Missing Interactive Keyboard Navigation
- **Why it matters**: Users who navigate using keyboard tabs must step through multiple redundant nodes instead of seamlessly moving between cards with arrow keys.
- **Fix**: Implement basic keyboard arrow-key navigation across the grid layout.
- **Suggested command**: `$impeccable adapt`

---

## Persona Red Flags

### Alex (Power User)
- **Red Flag**: No keyboard shortcuts to select roles (e.g., hitting `1`, `2`, `3` to pick). Must tab through multiple links.
- **Abandonment Risk**: Low, but creates friction for high-frequency admin/teacher switches.

### Jordan (First-Timer)
- **Red Flag**: Missing a logout / switch account action. If they log in under the wrong account, they have to navigate back to the main landing page to logout.
- **Abandonment Risk**: Moderate.

---

## Minor Observations
- The back button icon translation on hover is a nice touch, but could use a slightly smoother cubic-bezier transition.
- BDC Logo is styled with a rigid bounding box; adding a subtle drop-shadow or soft glow under the logo could fit the cosmic theme better.

---

## Questions to Consider
- Should we add a keyboard shortcut (e.g. `1` for Admin, `2` for Teacher, `3` for Student) to speed up navigation for power users?
- Would a simple horizontal transition animation on redirect feel smoother than the basic full-screen loading spinner?
