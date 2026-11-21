"use client";
import { useCallback, useEffect, useState } from "react";
import { sidebarWidth, sidebarMaximum } from "../utils/sidebarLayout";
export function useWorkspaceSidebar(userId?: string) {
  const [width, setWidth] = useState(280),
    [collapsed, setCollapsed] = useState(false),
    [viewport, setViewport] = useState(1440),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setViewport(innerWidth);
    const resize = () => setViewport(innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  useEffect(() => {
    setLoaded(false);
    if (!userId) return;
    try {
      const item = JSON.parse(
        localStorage.getItem(`bdc-workspace-sidebar:${userId}`) || "null",
      );
      setWidth(typeof item?.width === "number" ? item.width : 280);
      setCollapsed(item?.collapsed === true);
    } catch {
      setWidth(280);
      setCollapsed(false);
    }
    setLoaded(true);
  }, [userId]);
  useEffect(() => {
    if (!loaded || !userId) return;
    try {
      localStorage.setItem(
        `bdc-workspace-sidebar:${userId}`,
        JSON.stringify({ width, collapsed }),
      );
    } catch {}
  }, [width, collapsed, loaded, userId]);
  const resize = useCallback(
    (value: number) => setWidth(sidebarWidth(value, innerWidth)),
    [],
  );
  return {
    isDesktop: viewport >= 1024,
    width: sidebarWidth(width, viewport),
    maxWidth: sidebarMaximum(viewport),
    collapsed,
    setCollapsed,
    resize,
  };
}
