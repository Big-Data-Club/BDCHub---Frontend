"use client";
import { useRef, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { WorkspaceLibraryModel } from "../../hooks/useWorkspaceLibrary";
import { readyFilter } from "../../utils/library";
import { LibraryTabs } from "./LibraryTabs";
import { LibraryViewSettings, type LibraryPanel } from "./LibraryViewSettings";
import styles from "./WorkspaceLibrary.module.css";
export function LibraryControls({ model }: { model: WorkspaceLibraryModel }) {
  const [panel, setPanel] = useState<LibraryPanel | null>(null),
    [searchOpen, setSearchOpen] = useState(false),
    input = useRef<HTMLInputElement>(null),
    anchor = useRef<HTMLDivElement>(null);
  const active = model.preferences.filters.filter(readyFilter).length;
  return (
    <div className={styles.controls}>
      <LibraryTabs active={model.tab} onChange={model.setTab} />
      <Popover
        open={!!panel}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
      >
        <PopoverAnchor asChild>
          <div className={styles.tools} ref={anchor}>
            <button
              type="button"
              className={styles.iconButton}
              data-active={!!active || undefined}
              aria-label="Bộ lọc thư viện"
              title="Bộ lọc"
              aria-expanded={panel === "filters" || panel === "filterBy"}
              onClick={() => {
                setPanel(
                  panel === "filterBy" || panel === "filters"
                    ? null
                    : active
                      ? "filters"
                      : "filterBy",
                );
                void model.refreshPeople();
              }}
            >
              <Filter size={18} />
              {active > 0 && <i className={styles.dot} />}
            </button>
            {(searchOpen || model.query) && (
              <input
                ref={input}
                aria-label="Tìm trong thư viện"
                placeholder="Tìm theo tên trang…"
                className={styles.searchInput}
                maxLength={200}
                value={model.query}
                onChange={(event) => model.setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    model.setQuery("");
                    setSearchOpen(false);
                  }
                }}
              />
            )}
            <button
              type="button"
              className={styles.iconButton}
              aria-label={
                model.query ? "Xóa tìm kiếm thư viện" : "Tìm kiếm thư viện"
              }
              title="Tìm kiếm"
              onClick={() => {
                if (model.query) model.setQuery("");
                setSearchOpen(true);
                requestAnimationFrame(() => input.current?.focus());
              }}
            >
              {model.query ? <X size={18} /> : <Search size={18} />}
            </button>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Thiết lập thư viện"
              title="Thiết lập"
              aria-expanded={!!panel}
              onClick={() => setPanel(panel ? null : "settings")}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="end"
          sideOffset={12}
          className={styles.popover}
          onOpenAutoFocus={(event) => {
            if (panel === "settings") event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            anchor.current
              ?.querySelector<HTMLButtonElement>(
                'button[aria-label="Thiết lập thư viện"]',
              )
              ?.focus();
          }}
        >
          <LibraryViewSettings model={model} panel={panel} onPanel={setPanel} />
        </PopoverContent>
      </Popover>
      {(model.query || active > 0) && (
        <div className={styles.filterSummary}>
          <span>
            {model.query && `“${model.query}”`}
            {model.query && active > 0 ? " · " : ""}
            {active > 0 && `${active} điều kiện`}
          </span>
          <button
            type="button"
            className={styles.textButton}
            onClick={model.clear}
          >
            Xóa tìm kiếm & bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
