"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./ambient.module.css";

/** Enhances server content. With JS disabled, all content stays visible. */
export function AmbientEffects({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    const spotlight = light.current;
    if (!element || !spotlight) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let dispose = () => {};

    const configure = () => {
      dispose();
      if (reduced.matches) return;

      const reveals = Array.from(
        element.querySelectorAll<HTMLElement>("[data-reveal]"),
      );
      const sky = element.querySelector<HTMLElement>("[data-starfield]");
      let skyVisible = false;
      const syncStars = () => {
        if (sky) sky.dataset.active = String(skyVisible && !document.hidden);
      };
      const observer =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(
              (entries) => {
                for (const entry of entries) {
                  if (entry.target === sky) {
                    skyVisible = entry.isIntersecting;
                    syncStars();
                  } else if (entry.isIntersecting) {
                    (entry.target as HTMLElement).dataset.reveal = "visible";
                    observer?.unobserve(entry.target);
                  }
                }
              },
              { threshold: 0.08 },
            );

      reveals.forEach((target) => {
        // Do not hide content already in view during hydration.
        if (
          observer &&
          target.getBoundingClientRect().top >= window.innerHeight
        ) {
          target.dataset.reveal = "pending";
          observer.observe(target);
        }
      });
      if (sky && observer) observer.observe(sky);

      // A bounded pool stamps stationary light marks. No per-frame trail loop.
      const points = Array.from(
        spotlight.querySelectorAll<HTMLElement>("[data-trail-point]"),
      );
      const animations: Array<Animation | undefined> = [];
      let frame = 0;
      let x = 0;
      let y = 0;
      let lastX = 0;
      let lastY = 0;
      let lastStamp = -Infinity;
      let cursor = 0;
      const stopPointer = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        lastStamp = -Infinity;
      };
      const clearTrail = () => {
        stopPointer();
        animations.forEach((animation) => animation?.cancel());
      };
      const onMove = (event: PointerEvent) => {
        if (event.pointerType === "touch" || document.hidden) return;
        x = event.clientX;
        y = event.clientY;
        if (frame) return;
        frame = requestAnimationFrame((time) => {
          frame = 0;
          if (
            time - lastStamp < 48 ||
            (lastStamp !== -Infinity && Math.hypot(x - lastX, y - lastY) < 22)
          )
            return;
          const point = points[cursor];
          const glow = point?.firstElementChild;
          if (
            !(glow instanceof HTMLElement) ||
            typeof glow.animate !== "function"
          )
            return;
          animations[cursor]?.cancel();
          point.style.transform = `translate3d(${x - 72}px, ${y - 72}px, 0)`;
          animations[cursor] = glow.animate(
            [
              { opacity: 0.65, transform: "scale(.55)" },
              { opacity: 0.3, transform: "scale(.85)", offset: 0.35 },
              { opacity: 0, transform: "scale(1.05)" },
            ],
            { duration: 700, easing: "ease-out" },
          );
          cursor = (cursor + 1) % points.length;
          lastX = x;
          lastY = y;
          lastStamp = time;
        });
      };
      const onVisibility = () => {
        syncStars();
        if (document.hidden) clearTrail();
      };
      if (finePointer.matches) {
        element.addEventListener("pointermove", onMove, { passive: true });
        element.addEventListener("pointerleave", stopPointer);
        window.addEventListener("blur", stopPointer);
      }
      document.addEventListener("visibilitychange", onVisibility);

      dispose = () => {
        observer?.disconnect();
        reveals.forEach((target) => {
          target.dataset.reveal = "visible";
        });
        if (sky) sky.dataset.active = "false";
        clearTrail();
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", stopPointer);
        window.removeEventListener("blur", stopPointer);
        document.removeEventListener("visibilitychange", onVisibility);
      };
    };

    configure();
    reduced.addEventListener("change", configure);
    finePointer.addEventListener("change", configure);
    return () => {
      dispose();
      reduced.removeEventListener("change", configure);
      finePointer.removeEventListener("change", configure);
    };
  }, []);

  return (
    <div ref={root} className={`${styles.effects} ${className}`} lang="vi">
      {children}
      <div
        ref={light}
        className={styles.spotlight}
        data-spotlight
        aria-hidden="true"
      >
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} className={styles.trailPoint} data-trail-point>
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}
