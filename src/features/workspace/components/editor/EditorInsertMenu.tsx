"use client";
import { useEffect } from "react";
import {
  useComponentsContext,
  type DefaultReactSuggestionItem,
  type SuggestionMenuProps,
} from "@blocknote/react";
import styles from "./EditorMenus.module.css";

export function EditorInsertMenu({
  items,
  selectedIndex,
  onItemClick,
  loadingState,
}: SuggestionMenuProps<DefaultReactSuggestionItem>) {
  const components = useComponentsContext();
  useEffect(() => {
    document
      .getElementById(`bn-suggestion-menu-item-${selectedIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);
  if (!components) return null;
  const Menu = components.SuggestionMenu;
  return (
    <Menu.Root
      id="bn-suggestion-menu"
      className={`bn-suggestion-menu ${styles.menu} ${styles.suggestions}`}
    >
      {items.map((item, index) => (
        <div key={item.title}>
          {(index === 0 || items[index - 1].group !== item.group) && (
            <Menu.Label className="bn-suggestion-menu-label">
              {item.group}
            </Menu.Label>
          )}
          <div
            role="option"
            aria-selected={index === selectedIndex}
            className="bn-suggestion-menu-item"
            id={`bn-suggestion-menu-item-${index}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onItemClick?.(item)}
          >
            <span className="bn-suggestion-menu-item-icon">{item.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="bn-suggestion-menu-item-title">{item.title}</div>
              <div className="bn-suggestion-menu-item-subtitle">
                {item.subtext}
              </div>
            </div>
            {item.badge && (
              <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                {item.badge}
              </span>
            )}
          </div>
        </div>
      ))}
      {!items.length && (
        <Menu.EmptyItem className="bn-suggestion-menu-item">
          {loadingState === "loading-initial"
            ? "Đang tìm…"
            : "Không tìm thấy khối phù hợp"}
        </Menu.EmptyItem>
      )}
    </Menu.Root>
  );
}
