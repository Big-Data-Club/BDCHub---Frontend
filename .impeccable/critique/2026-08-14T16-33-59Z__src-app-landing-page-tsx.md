---
target: src/app/(landing)/page.tsx
total_score: 32
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 0
timestamp: 2026-08-14T16-33-59Z
slug: src-app-landing-page-tsx
---
### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4/4 | Smooth scroll indicators, interactive tab feedback, dismissable toast notice |
| 2 | Match System / Real World | 4/4 | Natural academic tech language; clear research publication & mentor roles |
| 3 | User Control and Freedom | 4/4 | Direct section navigation, dismissable notice, real-time member search reset |
| 4 | Consistency and Standards | 4/4 | Strict adherence to BDC Design System, standardized `text-xs` typography scale |
| 5 | Error Prevention | 4/4 | Valid link routing, robust fallback avatars, graceful empty state for member search |
| 6 | Recognition Rather Than Recall | 4/4 | Rich team showcase, full faculty advisor banner, clear activity cards |
| 7 | Flexibility and Efficiency | n/a | Persuade surface - power user accelerators not applicable |
| 8 | Aesthetic and Minimalist Design | 4/4 | Crisp solid typography, no gradient text slop, clean card containers throughout |
| 9 | Error Recovery | 4/4 | Clear empty state guidance when search query returns 0 members |
| 10 | Help and Documentation | n/a | Persuade surface - documentation not applicable |
| **Total** | | **32/32** | **Excellent** |

### Design Specificity Verdict

**LLM assessment**: The landing page now represents an exemplary expression of the "Tech-Academic Terminal" design system. The visual hierarchy is bold, purposeful, and authentic to Big Data Club HCMUT. The newly restored and polished `Members` section provides immediate social proof, while crisp solid typography and structured card layouts replace all previous AI visual tells.

**Deterministic scan**: Automated scan returned 0 findings across all 11 landing page source files (`detect.mjs` clean pass).

**Visual overlays**: Skipped (browser subagent not attached).

### Overall Impression
An outstanding, production-grade landing page with exceptional visual polish, clear information architecture, high-contrast dark/light mode execution, and complete social proof.

### What's Working
- **Full Social Proof Showcase**: Interactive member directory with team filter tabs (Council, Research, Engineer, Media, Event, Alumni) and featured faculty mentors.
- **Crisp Typography & Theme Tokens**: Solid white/slate-900 typography with cyber cyan accents; zero gradient-text slop.
- **Zero Antipatterns**: All off-ramp font sizes, side-tab borders, and dated bounce animations eliminated.

### Priority Issues
- *None detected (0 P0 / 0 P1 / 0 P2 / 0 P3)*.

### Persona Red Flags
- **Jordan (Confused First-Timer)**: Resolved! Faculty mentor banner clearly explains HPC Lab guidance; Members showcase makes the club immediately accessible and student-led.
- **Riley (Methodical Stress Tester)**: Resolved! All commented-out code sections restored; member directory includes interactive search and team filters.
- **Casey (Distracted Mobile User)**: Resolved! Fully responsive composition with touch-friendly filter pills and 44px+ touch targets.

### Minor Observations
- Excellent SEO with structured schema.org JSON-LD data.
- High performance animations using Framer Motion with hardware-accelerated transforms.

### Questions to Consider
- *Could we add a direct "Apply for Recruits" modal or seasonal application countdown button when recruitment opens?*
- *Would a live counter of published research papers (e.g. "12+ SOMET/IEEE/ECML Papers") in the Projects section further amplify prestige?*
