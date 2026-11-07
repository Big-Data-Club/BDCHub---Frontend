"use client";
import { useCallback, useEffect, useRef, useState } from "react";
const sections = ["start", "blocks", "latex", "library", "sync"];
export function useGuideNavigation() {
  const container = useRef<HTMLDivElement>(null),
    [active, setActive] = useState("start");
  const jump = useCallback((id: string) => {
    const root = container.current,
      target = root?.querySelector<HTMLElement>(`#workspace-guide-${id}`);
    if (!root || !target) return;
    const top =
      root.scrollTop +
      target.getBoundingClientRect().top -
      root.getBoundingClientRect().top -
      90;
    root.scrollTo({
      top: Math.max(0, top),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    history.replaceState(history.state, "", `#workspace-guide-${id}`);
    setActive(id);
  }, []);
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    let frame = 0;
    const track = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = sections[0];
        for (const id of sections) {
          const target = root.querySelector(`#workspace-guide-${id}`);
          if (
            target &&
            target.getBoundingClientRect().top <=
              root.getBoundingClientRect().top + 160
          )
            current = id;
        }
        setActive(current);
      });
    };
    root.addEventListener("scroll", track, { passive: true });
    const id = location.hash.replace("#workspace-guide-", "");
    if (sections.includes(id)) jump(id);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("scroll", track);
    };
  }, [jump]);
  return { container, active, jump };
}
