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

  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const isLockedRef = useRef(false);

  // Manage post-load layout settle lock
  useEffect(() => {
    if (loading) {
      isLockedRef.current = true;
    } else {
      const timer = setTimeout(() => {
        isLockedRef.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (!hasMore) return;

    const tryTrigger = () => {
      if (loadingRef.current || !hasMoreRef.current || isLockedRef.current) return;
      const element = triggerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      if (rect.top <= windowHeight + 150 && rect.bottom >= -50) {
        isLockedRef.current = true;
        onLoadMoreRef.current();
      }
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && triggerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            tryTrigger();
          }
        },
        { rootMargin: "150px" }
      );
      observer.observe(triggerRef.current);
    }

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        tryTrigger();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [hasMore]);

  if (!hasMore) return null;

  return (
    <div
      ref={triggerRef}
      className="w-full flex items-center justify-center py-6 [overflow-anchor:none]"
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
