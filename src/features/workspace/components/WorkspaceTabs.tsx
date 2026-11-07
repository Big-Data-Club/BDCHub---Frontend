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
  useEffect(() => {
    list.current
      ?.querySelector("[aria-selected=true]")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId]);
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
        {model.state.tabs.map((item, index) => (
          <div
            className={styles.tab}
            key={item.id}
            data-active={item.id === activeId || undefined}
          >
            <button
              type="button"
              role="tab"
              tabIndex={item.id === activeId ? 0 : -1}
              aria-selected={item.id === activeId}
              title={item.title}
              onClick={() => model.select(item.id)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight")
                  next = (index + 1) % model.state.tabs.length;
                else if (event.key === "ArrowLeft")
                  next =
                    (index - 1 + model.state.tabs.length) %
                    model.state.tabs.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End")
                  next = model.state.tabs.length - 1;
                else if (event.key === "Delete") {
                  event.preventDefault();
                  model.close(item.id);
                  return;
                } else return;
                event.preventDefault();
                model.select(model.state.tabs[next].id);
                list.current
                  ?.querySelectorAll<HTMLButtonElement>("[role=tab]")
                  [next]?.focus();
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
              onClick={() => model.close(item.id)}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
      <div className={styles.tabTools}>
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
