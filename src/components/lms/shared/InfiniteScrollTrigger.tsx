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

  // Use refs so the observer callback always reads latest values
  // without needing to destroy/recreate the observer
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const onLoadMoreRef = useRef(onLoadMore);

  // After triggering, require the sentinel to exit viewport
  // before it can trigger again — prevents cascade loading
  const hasFiredRef = useRef(false);

  // Sync props → refs on every render
  loadingRef.current = loading;
  hasMoreRef.current = hasMore;
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (hasMoreRef.current && !loadingRef.current && !hasFiredRef.current) {
            hasFiredRef.current = true;
            onLoadMoreRef.current();
          }
        } else {
          // Sentinel left viewport — allow next trigger
          hasFiredRef.current = false;
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []); // Stable observer — created once, lives for component lifetime

  if (!hasMore) return null;

  return (
    <div ref={triggerRef} className="w-full flex items-center justify-center py-6">
      {loading ? (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Spinner className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          <span>Đang tải thêm khóa học...</span>
        </div>
      ) : (
        <div className="h-6" />
      )}
    </div>
  );
}
