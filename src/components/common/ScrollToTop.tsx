"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

/**
 * Reusable Back to Top Component
 * Temporarily enabled ONLY for the main landing page ("/") and completely disabled on LMS & subpages.
 * Features custom requestAnimationFrame cubic ease-out animation for smooth scrolling
 * across both standard window viewports and custom inner overflow containers.
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  const isLandingPage = pathname === "/";

  const getScrollTop = useCallback(() => {
    if (typeof window === "undefined" || !isLandingPage) return 0;

    let maxScroll = Math.max(
      window.scrollY || 0,
      window.pageYOffset || 0,
      document.documentElement?.scrollTop || 0,
      document.body?.scrollTop || 0,
      document.scrollingElement?.scrollTop || 0
    );

    const scrollContainers = document.querySelectorAll<HTMLElement>(
      '.overflow-y-auto, [class*="overflow-y-auto"], [class*="overflow-y-scroll"]'
    );

    scrollContainers.forEach((container) => {
      if (container.scrollTop > maxScroll) {
        maxScroll = container.scrollTop;
      }
    });

    return maxScroll;
  }, [isLandingPage]);

  const toggleVisibility = useCallback(() => {
    if (!isLandingPage) {
      setIsVisible(false);
      return;
    }
    const scrollTop = getScrollTop();
    setIsVisible(scrollTop > 30);
  }, [getScrollTop, isLandingPage]);

  useEffect(() => {
    if (!isLandingPage) return;

    toggleVisibility();

    const listenerOptions: AddEventListenerOptions = { capture: true, passive: true };

    window.addEventListener("scroll", toggleVisibility, listenerOptions);
    document.addEventListener("scroll", toggleVisibility, listenerOptions);
    window.addEventListener("resize", toggleVisibility, listenerOptions);

    const scrollContainers = document.querySelectorAll<HTMLElement>(
      '.overflow-y-auto, [class*="overflow-y-auto"], [class*="overflow-y-scroll"]'
    );
    scrollContainers.forEach((container) => {
      container.addEventListener("scroll", toggleVisibility, listenerOptions);
    });

    const interval = setInterval(toggleVisibility, 250);

    return () => {
      window.removeEventListener("scroll", toggleVisibility, listenerOptions);
      document.removeEventListener("scroll", toggleVisibility, listenerOptions);
      window.removeEventListener("resize", toggleVisibility, listenerOptions);
      scrollContainers.forEach((container) => {
        container.removeEventListener("scroll", toggleVisibility, listenerOptions);
      });
      clearInterval(interval);
    };
  }, [toggleVisibility, isLandingPage]);

  // If not on landing page ("/"), do not render
  if (!isLandingPage) {
    return null;
  }

  const scrollToTop = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (typeof window === "undefined") return;

    const targets: { el: HTMLElement | Window; startTop: number }[] = [];

    const winTop = Math.max(
      window.scrollY || 0,
      window.pageYOffset || 0,
      document.documentElement?.scrollTop || 0,
      document.body?.scrollTop || 0,
      document.scrollingElement?.scrollTop || 0
    );
    if (winTop > 0) {
      targets.push({ el: window, startTop: winTop });
    }

    const scrollContainers = document.querySelectorAll<HTMLElement>(
      '.overflow-y-auto, [class*="overflow-y-auto"], [class*="overflow-y-scroll"]'
    );
    scrollContainers.forEach((container) => {
      if (container.scrollTop > 0) {
        targets.push({ el: container, startTop: container.scrollTop });
      }
    });

    if (targets.length === 0) return;

    const duration = 450;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      targets.forEach(({ el, startTop }) => {
        const currentPos = Math.round(startTop * (1 - easeOut));
        if (el === window) {
          window.scrollTo(0, currentPos);
          if (document.documentElement) document.documentElement.scrollTop = currentPos;
          if (document.body) document.body.scrollTop = currentPos;
        } else {
          (el as HTMLElement).scrollTop = currentPos;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <button
      type="button"
      id="back-to-top"
      onClick={scrollToTop}
      aria-label="Về đầu trang"
      title="Về đầu trang"
      style={{
        position: "fixed",
        bottom: "1.75rem",
        right: "1.75rem",
        zIndex: 999999,
      }}
      className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-cyan-400 ${
        isVisible
          ? "opacity-100 visible translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 invisible translate-y-4 scale-90 pointer-events-none"
      } bg-white text-slate-900 border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 dark:bg-[#070E1C] dark:text-slate-100 dark:border-cyan-500/40 dark:hover:bg-cyan-500 dark:hover:text-slate-950 dark:hover:border-cyan-400 dark:shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all duration-300 ease-out`}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
