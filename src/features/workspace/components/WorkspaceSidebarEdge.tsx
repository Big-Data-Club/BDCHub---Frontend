"use client";
import { useRef, useState, type PointerEvent } from "react";
import type { useWorkspaceSidebar } from "../hooks/useWorkspaceSidebar";
import { sidebarMinimum } from "../utils/sidebarLayout";
import styles from "./WorkspaceChrome.module.css";
export function WorkspaceSidebarEdge({
  controls,
}: {
  controls: ReturnType<typeof useWorkspaceSidebar>;
}) {
  const drag = useRef<{
      id: number;
      x: number;
      width: number;
      moved: boolean;
    } | null>(null),
    [dragging, setDragging] = useState(false);
  const finish = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (!cancelled && !start.moved) controls.setCollapsed(true);
  };
  return (
    <div
      className={styles.edge}
      data-dragging={dragging || undefined}
      role="separator"
      tabIndex={controls.collapsed ? -1 : 0}
      aria-label="Thay đổi chiều rộng cây trang"
      aria-orientation="vertical"
      aria-controls="workspace-page-sidebar"
      aria-valuemin={sidebarMinimum}
      aria-valuemax={controls.maxWidth}
      aria-valuenow={controls.width}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          id: event.pointerId,
          x: event.clientX,
          width: controls.width,
          moved: false,
        };
        setDragging(true);
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (!start || start.id !== event.pointerId) return;
        if (Math.abs(event.clientX - start.x) > 4) start.moved = true;
        if (start.moved) controls.resize(start.width + event.clientX - start.x);
      }}
      onPointerUp={(event) => finish(event)}
      onPointerCancel={(event) => finish(event, true)}
      onLostPointerCapture={() => {
        drag.current = null;
        setDragging(false);
      }}
      onKeyDown={(event) => {
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          controls.resize(
            event.key === "Home"
              ? sidebarMinimum
              : event.key === "End"
                ? controls.maxWidth
                : controls.width +
                  (event.key === "ArrowRight" ? 1 : -1) *
                    (event.shiftKey ? 50 : 10),
          );
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          controls.setCollapsed(true);
        }
      }}
    >
      <span className={styles.edgeTip}>
        Nhấn hoặc Ctrl+\ để thu gọn
        <br />
        Kéo để đổi chiều rộng
      </span>
    </div>
  );
}
