"use client";

import { useEffect, useRef } from "react";

interface UseScrollSnapOptions {
  /** Height of the sticky navigation header in px (default: 64) */
  stickyHeaderHeight?: number;
  /** Cooldown period after a snap animation in ms (default: 800) */
  cooldownMs?: number;
  /** Debounce delay — snap fires this many ms after user stops scrolling (default: 150) */
  debounceMs?: number;
  /** Enable/disable the snap behavior (default: true) */
  enabled?: boolean;
}

/**
 * Walks up the DOM from `el` and returns the first ancestor whose
 * computed overflow-y is 'auto' or 'scroll' AND whose scrollHeight
 * exceeds its clientHeight. Falls back to `document.documentElement`.
 */
function findScrollContainer(el: HTMLElement): HTMLElement {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return document.documentElement;
}

/**
 * Auto-snap scroll: when the user scrolls and pauses with the header
 * section partially visible, the page snaps either fully past the header
 * or back to the top.
 *
 * Uses a debounced scroll listener (NOT rAF loop) so it only fires
 * after the user stops scrolling, avoiding glitchy re-triggers.
 *
 * The snap decision uses a "halfway" threshold:
 *   - If > 50% of the header is still visible → snap back to top
 *   - If < 50% visible → snap it fully out of view
 *
 * @param headerRef  - Ref to the wrapper around the header section
 * @param contentRef - Ref to the content container (unused but kept for API compat)
 * @param options    - Configuration
 */
export function useScrollSnap(
  headerRef: React.RefObject<HTMLElement | null>,
  contentRef: React.RefObject<HTMLElement | null>,
  options: UseScrollSnapOptions = {}
) {
  const {
    stickyHeaderHeight = 64,
    cooldownMs = 800,
    debounceMs = 150,
    enabled = true,
  } = options;

  const isSnappingRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const scrollDirectionRef = useRef<"down" | "up" | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const header = headerRef.current;
    if (!header) return;

    // Detect the real scroll container
    const scrollContainer = findScrollContainer(header);
    const isDocScroll =
      scrollContainer === document.documentElement ||
      scrollContainer === document.body;

    const getScrollTop = (): number =>
      isDocScroll
        ? window.scrollY || document.documentElement.scrollTop
        : scrollContainer.scrollTop;

    const doScrollTo = (top: number) => {
      if (isDocScroll) {
        window.scrollTo({ top, behavior: "smooth" });
      } else {
        scrollContainer.scrollTo({ top, behavior: "smooth" });
      }
    };

    // Initialize last scroll position
    lastScrollTopRef.current = getScrollTop();

    let debounceTimer: ReturnType<typeof setTimeout>;

    const checkAndSnap = () => {
      if (isSnappingRef.current) return;

      // Only snap when user is scrolling DOWN
      if (scrollDirectionRef.current !== "down") return;

      const rect = header.getBoundingClientRect();
      const scrollTop = getScrollTop();
      const headerBottom = rect.bottom;

      // Guard: header not rendered or user hasn't scrolled enough
      if (rect.height < 10 || scrollTop < 15) return;

      // Header is already fully hidden behind the sticky nav → no action
      if (headerBottom <= stickyHeaderHeight) return;

      // Header is still mostly visible (not scrolled enough into transition zone)
      // Only trigger when user has scrolled past 40% of the header
      const visibleBelowNav = headerBottom - stickyHeaderHeight;
      const totalHeight = rect.height;
      if (visibleBelowNav > totalHeight * 0.6) return;

      // ── Header is partially visible & user is scrolling down → snap it away ──
      const delta = headerBottom - stickyHeaderHeight;
      isSnappingRef.current = true;
      doScrollTo(scrollTop + delta);
      setTimeout(() => {
        isSnappingRef.current = false;
      }, cooldownMs);
    };

    const handleScroll = () => {
      if (isSnappingRef.current) return;

      // Track scroll direction
      const currentScrollTop = getScrollTop();
      const delta = currentScrollTop - lastScrollTopRef.current;

      // Only update direction for meaningful movement (> 2px to avoid noise)
      if (Math.abs(delta) > 2) {
        scrollDirectionRef.current = delta > 0 ? "down" : "up";
      }
      lastScrollTopRef.current = currentScrollTop;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(checkAndSnap, debounceMs);
    };

    const scrollTarget: EventTarget = isDocScroll ? window : scrollContainer;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      clearTimeout(debounceTimer);
    };
  }, [headerRef, contentRef, stickyHeaderHeight, cooldownMs, debounceMs, enabled]);
}
