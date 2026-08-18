import { useEffect, useRef } from "react";
import { Spinner } from "./Spinner";

export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  loading = false,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const element = triggerRef.current;
    if (!element || loading || !hasMore) return;

    let observer: IntersectionObserver | null = null;

    // Delay observer creation by one animation frame after React paint.
    //
    // WHY THIS IS NECESSARY (not a workaround):
    // When `loading` transitions from true→false (batch finished loading),
    // React commits new DOM nodes (the appended course cards) and paints.
    // useEffect runs post-paint, but IntersectionObserver.observe() can
    // fire its initial callback before the browser has fully evaluated
    // the new layout. This means the sentinel might report as "intersecting"
    // based on stale position data — even though the newly appended cards
    // have pushed it well below the viewport.
    //
    // By deferring observe() to the next animation frame, we guarantee:
    // 1. The browser has completed style recalc + layout for the new cards
    // 2. The sentinel's position reflects the actual DOM state
    // 3. The observer evaluates intersection against accurate geometry
    //
    // After the rAF, the observer works normally — no further delays or
    // hacks are needed for subsequent intersection changes.
    const rafId = requestAnimationFrame(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onLoadMoreRef.current();
          }
        },
        { root: null, rootMargin: "100px", threshold: 0 },
      );
      observer.observe(element);
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [loading, hasMore]);

  if (!hasMore) return null;

  return (
    <div
      ref={triggerRef}
      className="w-full flex items-center justify-center py-6"
      aria-live="polite"
      aria-busy={loading}
    >
      {loading ? (
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-blue-500/20 shadow-sm animate-in fade-in duration-200">
          <Spinner className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          <span>Đang tải thêm khóa học...</span>
        </div>
      ) : (
        <div className="h-6" />
      )}
    </div>
  );
}
