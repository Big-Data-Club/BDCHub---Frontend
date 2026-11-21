"use client";
import { Clock3, Files, LockKeyhole, Star, Users } from "lucide-react";
import { libraryTabs } from "../../utils/library";
import type { LibraryTab } from "../../types/library";
import styles from "./WorkspaceLibrary.module.css";
const icons = {
  recent: Clock3,
  favorites: Star,
  shared: Users,
  private: LockKeyhole,
  all: Files,
};
export function LibraryTabs({
  active,
  onChange,
}: {
  active: LibraryTab;
  onChange: (tab: LibraryTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Các mục thư viện"
      className={styles.tabs}
      onKeyDown={(event) => {
        const index = libraryTabs.findIndex((tab) => tab.id === active);
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % libraryTabs.length;
        else if (event.key === "ArrowLeft")
          next = (index + libraryTabs.length - 1) % libraryTabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = libraryTabs.length - 1;
        else return;
        event.preventDefault();
        onChange(libraryTabs[next].id);
        event.currentTarget
          .querySelectorAll<HTMLButtonElement>('button[role="tab"]')
          [next]?.focus();
      }}
    >
      {libraryTabs.map((tab) => {
        const Icon = icons[tab.id];
        return (
          <button
            type="button"
            key={tab.id}
            role="tab"
            tabIndex={tab.id === active ? 0 : -1}
            aria-selected={tab.id === active}
            onClick={() => onChange(tab.id)}
          >
            <Icon size={17} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
