---
target: src/app/(landing)/page.tsx
total_score: 25
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-14T16-25-42Z
slug: src-app-landing-page-tsx
---
### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Clean hover states and scroll indicator; active section cues could be sharper |
| 2 | Match System / Real World | 3/4 | Plain Vietnamese academic copy, though jargon ("HPC Lab") lacks inline context |
| 3 | User Control and Freedom | 3/4 | Clear section navigation; hero actions are direct |
| 4 | Consistency and Standards | 3/4 | Consistent cosmic navy aesthetic, but off-ramp 10px text sizes violate DESIGN.md |
| 5 | Error Prevention | 4/4 | Static landing page; clean internal & external links |
| 6 | Recognition Rather Than Recall | 3/4 | Strong icon header language, but Members section is commented out |
| 7 | Flexibility and Efficiency | n/a | Persuade surface - power user accelerators not applicable |
| 8 | Aesthetic and Minimalist Design | 2/4 | Decorative gradient text slop on Hero title, commented-out dead code in page |
| 9 | Error Recovery | 4/4 | No form submission or error-prone state on landing page |
| 10 | Help and Documentation | n/a | Persuade surface - documentation not applicable |
| **Total** | | **25/32** | **Good** |

### Design Specificity Verdict

**LLM assessment**: The landing page demonstrates strong alignment with the "Tech-Academic Terminal" direction established in `DESIGN.md`. The cosmic navy atmosphere, glassmorphic card overlays, and academic publication listings give it a distinct identity for BDC HCMUT. However, it suffers from generic AI visual tells (such as gradient text in `HeroTitle.tsx`), commented-out dead code components (`Members` and `HpcNotice` in `page.tsx`), and slight font-size inconsistency.

**Deterministic scan**: Automated scan detected 18 gray-on-color contrast warnings in `Navbar.tsx`, 1 gradient-text anti-pattern in `HeroTitle.tsx`, and 2 instances of font sizes (`10px`) outside the `DESIGN.md` type ramp in `Navbar.tsx` and `ScrollIndicator.tsx`.

**Visual overlays**: Skipped (browser subagent not attached to active page tab mutation).

### Overall Impression
A solid, cohesive tech-academic showcase for Big Data Club HCMUT with strong dark/light mode foundations, but held back by minor AI visual tropes, contrast issues in navigation, and omitted social proof sections.

### What's Working
- **Cohesive Dual-Theme System**: Dark cosmic navy (`#050b18`) and clean slate light mode render with smooth borders and subtle hover state elevations.
- **Academic Rigor**: The inclusion of scientific publications alongside student projects creates authentic academic authority.
- **Structured Hero Hierarchy**: Clear visual division between club value proposition, action CTAs, and key stats.

### Priority Issues
- **[P1] Commented-out Social Proof (Members & HPC Notice)**
  - *Why it matters*: A club landing page relies heavily on community, student faces, and leadership to build trust with new recruits. Commenting out the Members component leaves an emotional gap.
  - *Fix*: Re-enable and polish the `Members` showcase section with active member grid or alumni highlights.
  - *Suggested command*: `$impeccable onboard` or `$impeccable polish`

- **[P1] Contrast & Washed-out Text in Navbar**
  - *Why it matters*: Detector found multiple `gray-on-color` text classes (`text-slate-600`/`text-slate-400` on `bg-blue-900`), reducing legibility.
  - *Fix*: Standardize navigation text colors to high-contrast white / slate-100 on dark backdrops.
  - *Suggested command*: `$impeccable audit`

- **[P2] Gradient Text Anti-Pattern in Hero Title**
  - *Why it matters*: `bg-clip-text bg-gradient-...` on `HeroTitle.tsx` is a soft AI aesthetic tell that clashes with the crisp, terminal-inspired design direction.
  - *Fix*: Use crisp solid text colors (pure white in dark mode, slate-900 in light mode, with solid cyan-400 accents).
  - *Suggested command*: `$impeccable bolder`

- **[P2] Off-Ramp Font Sizes (10px)**
  - *Why it matters*: Literal `text-[10px]` in `ScrollIndicator.tsx` and `Navbar.tsx` violates the documented typography scale in `DESIGN.md`.
  - *Fix*: Standardize all micro-labels to `text-xs` (12px, font-medium/semibold).
  - *Suggested command*: `$impeccable typeset`

### Persona Red Flags
- **Jordan (Confused First-Timer)**: Mentions "HPC Lab" and "PGS.TS Thoại Nam" without explaining what HPC Lab is; the absence of the Members section makes the club feel abstract rather than student-led.
- **Riley (Methodical Stress Tester)**: Discovers dead commented-out code in `page.tsx`; notices lack of category filters or interactive search for Projects and Activities.
- **Casey (Distracted Mobile User)**: Hero visual core is hidden on mobile screens, shifting key stats into a stacked block that pushes content further down.

### Minor Observations
- Structured JSON-LD for `EducationalOrganization` is well implemented for SEO.
- Smooth scroll resetting via `ScrollReset` component works seamlessly.

### Questions to Consider
- *What if the hero section featured an interactive terminal window displaying real data science code snippets or club metrics?*
- *How can we showcase member achievements and alumni career destinations to maximize recruit conversion?*
- *Would adding tech stack badges (e.g. PyTorch, Hadoop, AWS) to project cards increase technical credibility?*
