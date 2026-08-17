---
target: src/app/(learning)/lms/student/discover/page.tsx
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-17T08-54-46Z
slug: src-app-learning-lms-student-discover-page-tsx
---
# Critique snapshot for LMS Student Discover Page Lazy Loading

## Heuristics Scores

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeleton loader during pagination is clear, but trigger doesn't receive `loading` state prop. |
| 2 | Match System / Real World | 3 | Infinite scrolling feels natural, but lacks indicator of total courses remaining. |
| 3 | User Control and Freedom | 2 | No manual "Load More" fallback if scroll triggers fail or user prefers button click. |
| 4 | Consistency and Standards | 3 | Skeleton structure matches CourseCard nicely. |
| 5 | Error Prevention | 2 | Sequential scroll requests aren't guarded against rapid scroll re-triggering. |
| 6 | Recognition Rather Than Recall | 3 | Category and search state retained across pagination loads. |
| 7 | Flexibility and Efficiency | 2 | Fixed PAGE_SIZE (9) on giant screens might require scrolling past sentinel. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean visual transition, skeleton matches card grid. |
| 9 | Error Recovery | 2 | In-flight pagination failure resets back without graceful inline retry button for next page. |
| 10 | Help and Documentation | 3 | Inline loading indicators clearly shown. |

Total: 26/40 (Acceptable)

## Design Specificity & Technical Verdict
The current lazy loading implementation in `/lms/student/discover` uses:
1. **Infinite Scroll Pagination**: Controlled by `InfiniteScrollTrigger` (which wraps `useInView`).
2. **Image Lazy Loading**: Managed natively via `loading="lazy"` inside `<Image>` in `CourseCard.tsx`.

### Strengths
- Pre-fetching buffer (`rootMargin: "400px"`) initiates fetch early before reaching page bottom.
- High quality `CourseCardSkeleton` matching the 3-column responsive grid layout during `loadingMore`.
- One-shot Intersection Observer prevents memory leaks.

### Critical Deficiencies & Bugs
- **Missing Loading Prop Wiring (P0)**: `<InfiniteScrollTrigger>` in `discover/page.tsx` omits `loading={loadingMore}`, bypassing `useInView`'s guard check!
- **Image Aspect Shift / CLS Risk (P1)**: Images in `CourseCard.tsx` use `unoptimized` alongside `loading="lazy"` without blur placeholder.
- **Accessibility & Keyboard Trap (P1)**: Screen readers cannot easily navigate infinite stream without explicit ARIA announcements or manual trigger fallback.

## Persona Red Flags
- **Alex (Power User)**: Forced to continuously scroll to find courses; cannot jump to end.
- **Casey (Distracted Mobile User)**: On slow mobile connections, scroll trigger fires without clear persistent loading feedback if sentinel is scrolled past fast.
