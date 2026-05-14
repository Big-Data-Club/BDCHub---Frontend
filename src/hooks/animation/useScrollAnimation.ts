"use client";
import { useState, useEffect, useRef } from "react";

/**
 * Enhanced hook for scroll-triggered animations.
 * @param threshold - Intersection observer threshold (0 to 1)
 * @param staggerIndex - Optional index to calculate delay for staggered entry
 * @returns [ref, isVisible, delayStyle]
 */
export function useScrollAnimation(threshold = 0.1, staggerIndex = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldAnimate(!mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setShouldAnimate(!event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );
    
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold]);

  // Calculate delay based on staggerIndex (100ms per index)
  const delay = shouldAnimate ? `${staggerIndex * 100}ms` : "0ms";
  
  const style = {
    transitionDelay: delay,
    animationDelay: delay,
  };

  return [ref, isVisible, style] as const;
}