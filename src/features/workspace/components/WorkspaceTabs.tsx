"use client";
import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  PanelLeft,
  Plus,
  X,
} from "lucide-react";
import type { useWorkspaceTabs } from "../hooks/useWorkspaceTabs";
import { WorkspaceButton } from "./WorkspacePrimitives";
import styles from "./WorkspaceChrome.module.css";
export function WorkspaceTabs({
  model,
  activeId,
  onAdd,
  onSidebar,
  sidebarOpen,
}: {
  model: ReturnType<typeof useWorkspaceTabs>;
  activeId?: string;
  onAdd: () => void;
  onSidebar: () => void;
  sidebarOpen: boolean;
}) {
  const list = useRef<HTMLDivElement>(null);
  const add = useRef<HTMLDivElement>(null);
  const tabs = model.state.tabs;
  const focusId = tabs.some((item) => item.id === activeId)
    ? activeId
    : tabs[0]?.id;
  function revealTab(button: HTMLButtonElement) {
    const container = list.current;
    const tab = button.parentElement;
    if (!container || !tab) return;
    const viewport = container.getBoundingClientRect();
    const bounds = tab.getBoundingClientRect();
    if (bounds.left < viewport.left) {
      container.scrollBy({ left: bounds.left - viewport.left });
    } else if (bounds.right > viewport.right) {
      container.scrollBy({ left: bounds.right - viewport.right });
    }
  }
  useEffect(() => {
    const selected = list.current?.querySelector<HTMLButtonElement>(
      '[aria-selected="true"]',
    );
    if (selected) revealTab(selected);
  }, [activeId, tabs]);
  function focusTab(index: number) {
    const target =
      list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index];
    if (target) {
      target.focus({ preventScroll: true });
      revealTab(target);
    } else {
      add.current?.querySelector("button")?.focus({ preventScroll: true });
    }
  }
  function close(index: number) {
    focusTab(index > 0 ? index - 1 : index + 1);
    model.close(tabs[index].id);
  }
  return (
    <nav className={styles.tabs} aria-label="Trang đã mở">
      <div className={styles.tabTools}>
        <WorkspaceButton
          id="workspace-sidebar-toggle"
          aria-label={sidebarOpen ? "Thu gọn cây trang" : "Mở cây trang"}
          title="Ẩn/hiện cây trang · Ctrl+\"
          className="size-8 p-1"
          aria-controls="workspace-page-sidebar"
          aria-expanded={sidebarOpen}
          onClick={onSidebar}
        >
          <PanelLeft className="size-4" />
        </WorkspaceButton>
        <WorkspaceButton
          aria-label="Trang trước trong workspace"
          className="size-8 p-1"
          disabled={model.state.cursor < 1}
          onClick={() => model.step(-1)}
        >
          <ArrowLeft className="size-4" />
        </WorkspaceButton>
        <WorkspaceButton
          aria-label="Trang tiếp theo trong workspace"
          className="size-8 p-1"
          disabled={model.state.cursor >= model.state.trail.length - 1}
          onClick={() => model.step(1)}
        >
          <ArrowRight className="size-4" />
        </WorkspaceButton>
      </div>
      <div
        className={styles.tabList}
        ref={list}
        role="tablist"
        aria-label="Các tab trong workspace"
      >
        {tabs.map((item, index) => (
          <div
            className={styles.tab}
            key={item.id}
            data-active={item.id === activeId || undefined}
          >
            <button
              type="button"
              role="tab"
              tabIndex={item.id === focusId ? 0 : -1}
              aria-selected={item.id === activeId}
              title={item.title}
              onClick={() => model.select(item.id)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight")
                  next = (index + 1) % tabs.length;
                else if (event.key === "ArrowLeft")
                  next = (index - 1 + tabs.length) % tabs.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = tabs.length - 1;
                else if (event.key === "Delete") {
                  event.preventDefault();
                  close(index);
                  return;
                } else return;
                event.preventDefault();
                focusTab(next);
                model.select(tabs[next].id);
              }}
            >
              {item.icon ? (
                <span>{item.icon}</span>
              ) : (
                <FileText className="size-3.5 shrink-0" />
              )}
              <span>{item.title}</span>
            </button>
            <button
              type="button"
              aria-label={`Đóng tab ${item.title}`}
              onClick={() => close(index)}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
      <div ref={add} className={styles.tabTools}>
        <WorkspaceButton
          aria-label="Mở trang trong tab mới"
          title="Tìm trang hoặc tạo trang mới"
          className="size-8 p-1"
          onClick={onAdd}
        >
          <Plus className="size-5" />
        </WorkspaceButton>
      </div>
    </nav>
  );
}
