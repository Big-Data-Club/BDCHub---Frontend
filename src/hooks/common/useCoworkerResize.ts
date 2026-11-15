"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

const STORAGE_KEY = "bdc_coworker_width";
const DEFAULT_WIDTH = 450;
const MIN_WIDTH = 320;
const MAX_WIDTH = 600;
const MIN_WORKSPACE_WIDTH = 640;
const SPLIT_MIN_WIDTH = 1024;

export function useCoworkerResize(enabled: boolean) {
  const rootElement = useRef<HTMLDivElement | null>(null);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const rootRef = useCallback((node: HTMLDivElement | null) => {
    rootElement.current = node;
    setRoot(node);
  }, []);
  const preferredWidth = useRef(DEFAULT_WIDTH);
  const currentWidth = useRef(DEFAULT_WIDTH);
  const drag = useRef<{ handle: HTMLDivElement; pointerId: number } | null>(null);
  const frame = useRef<number | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [bounds, setBounds] = useState({ split: false, max: MAX_WIDTH });
  const [isDragging, setIsDragging] = useState(false);

  const applyWidth = useCallback((requested: number) => {
    const available = rootElement.current?.clientWidth ?? SPLIT_MIN_WIDTH;
    const max = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, available - MIN_WORKSPACE_WIDTH));
    const next = Math.round(Math.max(MIN_WIDTH, Math.min(max, requested)));
    currentWidth.current = next;
    rootElement.current?.style.setProperty("--coworker-width", `${next}px`);
    return next;
  }, []);

  const persistWidth = useCallback(() => {
    preferredWidth.current = currentWidth.current;
    setWidth(currentWidth.current);
    try { localStorage.setItem(STORAGE_KEY, String(currentWidth.current)); } catch { /* Storage is optional. */ }
  }, []);

  const finishDrag = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    const active = drag.current;
    if (!active) return;
    drag.current = null;
    if (active.handle.hasPointerCapture(active.pointerId)) active.handle.releasePointerCapture(active.pointerId);
    persistWidth();
    setIsDragging(false);
  }, [persistWidth]);

  useEffect(() => {
    if (!root) { setIsDragging(false); return; }
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      if (Number.isFinite(saved) && saved >= MIN_WIDTH) preferredWidth.current = Math.min(saved, MAX_WIDTH);
    } catch { /* Keep defaults when storage is unavailable. */ }
    const measure = () => {
      const split = root.clientWidth >= SPLIT_MIN_WIDTH;
      const max = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, root.clientWidth - MIN_WORKSPACE_WIDTH));
      setBounds((previous) => previous.split === split && previous.max === max ? previous : { split, max });
      setWidth(applyWidth(preferredWidth.current));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => {
      observer.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      const active = drag.current;
      drag.current = null;
      if (active?.handle.hasPointerCapture(active.pointerId)) active.handle.releasePointerCapture(active.pointerId);
    };
  }, [root, applyWidth]);

  useEffect(() => {
    if (!enabled || !bounds.split) finishDrag();
  }, [enabled, bounds.split, finishDrag]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || !bounds.split || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { handle: event.currentTarget, pointerId: event.pointerId };
    setIsDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    const clientX = event.clientX;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const right = rootElement.current?.getBoundingClientRect().right;
      if (right !== undefined) applyWidth(right - clientX);
    });
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    const right = rootElement.current?.getBoundingClientRect().right;
    if (right !== undefined) applyWidth(right - event.clientX);
    finishDrag();
  };

  const resetWidth = () => {
    applyWidth(DEFAULT_WIDTH);
    persistWidth();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = { ArrowLeft: currentWidth.current + 20, ArrowRight: currentWidth.current - 20,
      Home: MIN_WIDTH, End: bounds.max, Enter: DEFAULT_WIDTH }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    applyWidth(next);
    persistWidth();
  };

  return {
    rootRef, isSplit: bounds.split, isDragging,
    separatorProps: {
      role: "separator", tabIndex: 0, "aria-orientation": "vertical" as const,
      "aria-label": "Điều chỉnh chiều rộng AI Cowork", "aria-valuemin": MIN_WIDTH,
      "aria-valuemax": bounds.max, "aria-valuenow": width,
      onPointerDown, onPointerMove, onPointerUp, onPointerCancel: finishDrag,
      onLostPointerCapture: finishDrag, onDoubleClick: resetWidth, onKeyDown,
    },
  };
}
