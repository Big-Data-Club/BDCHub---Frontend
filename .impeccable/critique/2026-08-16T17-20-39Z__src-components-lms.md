---
target: src/components/lms
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-16T17-20-39Z
slug: src-components-lms
---
⚠️ DEGRADED: single-context (sub-agent tool unavailable in this session)

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | AI generation shows generic loading spinners without streaming progress or token counts. |
| 2 | Match System / Real World | 3 | AI features introduce technical graph terminology ("Node Consolidate", "Knowledge Graph") instead of teacher-friendly terms. |
| 3 | User Control and Freedom | 3 | AI-generated quizzes cannot be partially regenerated per-question; requires full regeneration. |
| 4 | Consistency and Standards | 2 | Inconsistent AI styling: mixture of standard blue buttons and high-contrast violet/cyan AI gradients across components. |
| 5 | Error Prevention | 3 | Good delete confirmations, but missing overwriting warnings when AI generates content into existing sections. |
| 6 | Recognition Rather Than Recall | 2 | Heavy reliance on `text-[10px]` and `text-[11px]` off-ramp font sizes making AI metadata hard to scan. |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts (Esc/Enter) or bulk actions for managing AI-generated quiz questions. |
| 8 | Aesthetic and Minimalist Design | 2 | **AI Flop Alert:** Overuse of purple/cyan glows and gradient borders causing visual noise and slop aesthetics. |
| 9 | Error Recovery | 2 | AI API failures swallow detailed error codes and output generic "Không thể tải" alerts. |
| 10 | Help and Documentation | 2 | Missing contextual tooltips explaining AI Knowledge Graph mapping and confidence thresholds. |
| **Total** | | **24/40** | **Acceptable (60%)** |

### Design Specificity Verdict

**LLM Assessment**:
The overall LMS design system is functionally structured, but suffers from **"AI Feature Bloat & Aesthetic Slop"**. Rather than feeling like a cohesive, enterprise-grade LMS (like Canvas or Coursera), the UI frequently lapses into generic AI wrapper aesthetics — heavy use of violet/cyan gradients (`from-violet-950`, `from-violet-400`), arbitrary `text-[10px]` micro-typography, and decorative sparkle icons (`✨`, `🤖`) attached to standard forms.

**Deterministic Scan Findings**:
The automated scanner scanned `src/components/lms` and flagged **multiple AI Anti-patterns (Slop)** and Quality Issues:
- 🚨 **`ai-color-palette` (Slop Warning)**: `from-violet-950 gradient` in [`GraphConsolidateModal.tsx`](file:///home/thanh/BDCHub---Frontend/src/components/lms/teacher/ai/GraphConsolidateModal.tsx#L111) and `from-violet-400` in [`StudentTab.tsx`](file:///home/thanh/BDCHub---Frontend/src/components/lms/teacher/page/StudentTab.tsx#L187).
- 🚨 **`gray-on-color` (Contrast Warning)**: Low-contrast `text-slate-400` on `bg-red-50` in [`CoTeacherSection.tsx`](file:///home/thanh/BDCHub---Frontend/src/components/lms/teacher/page/CoTeacherSection.tsx#L239).
- 🚨 **`design-system-font-size` (Type Ramp Advisory)**: 8+ instances of non-standard `text-[10px]` and `text-[11px]` in AI modals, drawers, and charts ([`AIQuizGenPanel.tsx`](file:///home/thanh/BDCHub---Frontend/src/components/lms/teacher/page/AIQuizGenPanel.tsx#L551), [`SectionOverviewDrawer.tsx`](file:///home/thanh/BDCHub---Frontend/src/components/lms/teacher/overview/SectionOverviewDrawer.tsx#L793)).

---

### Overall Impression
The LMS UI is logically partitioned and rich in features, but its AI integration feels **tacked on with generic AI tropes** (purple glows, magic wand icons) rather than feeling like an invisible, intelligent assistant built into an enterprise workspace. Cleaning up visual slop, standardizing font sizes to the BDC Design Ramp, and restoring dark-mode contrast will dramatically elevate craft quality.

---

### What's Working
1. **Clear Page Composition**: `page.tsx` serves purely as a composition shell while custom hooks and presentational components handle data and interaction cleanly.
2. **Comprehensive Analytics**: The AI Knowledge Heatmap provides genuine pedagogical value for teachers rather than superficial AI fluff.
3. **Structured Modal Orchestration**: Complex AI generation flows (Micro-lessons, Micro-quizzes) are well-segregated into controlled modal layers.

---

### Priority Issues (AI Flops & UI Quality)

#### 1. [P1] AI Aesthetic Slop & Color Cliché (`ai-color-palette`)
- **Why it matters**: Using purple/violet gradients (`from-violet-400`, `from-violet-950`) screams "cheap AI wrapper". It breaks the BDC Design System standard (which mandates Navy `#050B18` + Electric Blue / Cyan highlights).
- **Fix**: Replace all generic violet/purple gradients with solid BDC Navy card backgrounds (`bg-[#0F1E35]`) and clean BDC Blue/Cyan borders (`border-blue-500/20`).
- **Suggested command**: `$impeccable colorize src/components/lms/teacher/ai`

#### 2. [P1] Unreadable Text Contrast on Colored Alert/Badge Banners (`gray-on-color`)
- **Why it matters**: `text-slate-400` placed over `bg-red-50` or `bg-amber-50` fails WCAG AA contrast (fails 4.5:1 ratio), making error and warning states unreadable.
- **Fix**: Pair light colored backgrounds with dark/vibrant text tokens (`text-red-700` for `bg-red-50`, `dark:text-red-400` for `dark:bg-red-950/40`).
- **Suggested command**: `$impeccable harden src/components/lms/teacher/page/CoTeacherSection.tsx`

#### 3. [P2] Typography Off-Ramp Fragmentation (`text-[10px]` / `text-[11px]`)
- **Why it matters**: Arbitrary pixel font-sizes (`text-[10px]`, `text-[11px]`) clutter the code, strain teachers' eyes, and break the design system's standardized type scale.
- **Fix**: Standardize all micro-labels to `text-xs` (12px) with `font-semibold` or `font-bold` for legibility.
- **Suggested command**: `$impeccable typeset src/components/lms/teacher`

#### 4. [P2] Non-Actionable AI Loading & Error States
- **Why it matters**: When AI generation is triggered, teachers see a generic spinner without knowing how many questions/nodes were generated, or why an API call failed.
- **Fix**: Add progressive status updates (e.g. "Đang phân tích tài liệu ➔ Đang trích xuất 5 câu hỏi") and actionable retry controls.
- **Suggested command**: `$impeccable clarify src/components/lms/teacher/page/AIQuizGenPanel.tsx`

---

### Persona Red Flags

- **Jordan (First-Time Teacher)**: Confused by technical terms like "Knowledge Node Consolidation" and "Graph Embedding". Wonders if clicking "Tạo AI" will overwrite existing manually-written lessons.
- **Alex (Power-User Teacher)**: Annoyed that generating AI quizzes requires clicking through 3 modal steps with no keyboard shortcuts (Esc to cancel, Cmd+Enter to generate).
- **Sam (Accessibility User)**: Screen reader struggles with badge-only status updates (`text-[10px]`), and low-contrast error text on amber/red backgrounds fails readability checks.

---

### Minor Observations
- Icons on AI buttons are inconsistent: some use `Sparkles`, some `Bot`, some `Wand2`.
- Modal backdrops in dark mode occasionally suffer from overlapping opacity (`backdrop-blur` + `bg-black/50`).

---

### Questions to Consider
- "What if AI features felt less like a separate 'magic tool' and more like intelligent default suggestions inside standard form inputs?"
- "Can we replace arbitrary `text-[10px]` tags with standard `text-xs` badges to improve legibility for older teachers?"
