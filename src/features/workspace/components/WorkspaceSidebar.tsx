"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Files,
  History,
  LockKeyhole,
  NotebookPen,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import type {
  WorkspaceBootstrap,
  WorkspacePage,
  WorkspaceSpace,
} from "../types";
import { useWorkspaceSearch } from "../hooks/useWorkspaceSearch";
import { WorkspacePageMenu, type PageAction } from "./WorkspacePageMenu";
import { WorkspaceButton } from "./WorkspacePrimitives";
const rank = { owner: 5, manager: 4, editor: 3, commenter: 2, viewer: 1 };
interface SidebarProps {
  bootstrap: WorkspaceBootstrap;
  space?: WorkspaceSpace;
  pages: WorkspacePage[];
  activeId?: string;
  onOpen: (id?: string, space?: string) => void;
  onCreate: (parent?: string) => void;
  onCreateSpace: () => void;
  onGuide: () => void;
  onTrash: () => void;
  onNotes: () => void;
  onInbox: () => void;
  onPageAction: (action: PageAction, page: WorkspacePage) => void;
  onMove: (id: string, parentId: string | null) => void;
}
export function WorkspaceSidebar(props: SidebarProps) {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState<"all" | "favorite" | "recent" | "shared">(
      "all",
    ),
    [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const input = useRef<HTMLInputElement>(null),
    search = useWorkspaceSearch(query),
    role = props.space ? rank[props.space.role] : 0;
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest('[contenteditable="true"]')
        )
      ) {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  function tree(
    parent: string | null,
    depth = 0,
    seen = new Set<string>(),
  ): React.ReactNode {
    if (depth > 50) return null;
    return props.pages
      .filter((page) => page.parent_id === parent && page.kind !== "record")
      .map((page) => {
        if (seen.has(page.id)) return null;
        const next = new Set(seen).add(page.id),
          children = props.pages.some(
            (item) => item.parent_id === page.id && item.kind !== "record",
          ),
          closed = collapsed.has(page.id);
        return (
          <div key={page.id}>
            <div
              draggable={role >= 4}
              onDragStart={(event) => {
                event.stopPropagation();
                event.dataTransfer.setData("application/x-bdc-page", page.id);
              }}
              onDragOver={(event) => {
                if (
                  role >= 4 &&
                  page.kind === "page" &&
                  event.dataTransfer.types.includes("application/x-bdc-page")
                ) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
              onDrop={(event) => {
                if (role >= 4 && page.kind === "page") {
                  event.preventDefault();
                  event.stopPropagation();
                  const id = event.dataTransfer.getData(
                    "application/x-bdc-page",
                  );
                  if (id && id !== page.id) props.onMove(id, page.id);
                }
              }}
              className={`group flex min-w-0 items-center rounded-lg ${page.id === props.activeId ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-cyan-300" : "hover:bg-slate-100 dark:hover:bg-lms-hover"}`}
              ref={(element) => {
                if (element)
                  element.style.paddingLeft = `${Math.min(depth, 8) * 12}px`;
              }}
            >
              <button
                type="button"
                aria-label={
                  closed
                    ? `Mở nhánh ${page.title}`
                    : `Thu gọn nhánh ${page.title}`
                }
                aria-expanded={children ? !closed : undefined}
                className="shrink-0 rounded p-1 text-slate-400 transition-all active:scale-95"
                onClick={() =>
                  setCollapsed((items) => {
                    const values = new Set(items);
                    if (values.has(page.id)) values.delete(page.id);
                    else values.add(page.id);
                    return values;
                  })
                }
              >
                {children ? (
                  closed ? (
                    <ChevronRight className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )
                ) : (
                  <span className="block size-3" />
                )}
              </button>
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-sm transition-all active:scale-95"
                onClick={() => props.onOpen(page.id)}
              >
                {page.icon ? (
                  <span className="shrink-0">{page.icon}</span>
                ) : (
                  <FileText className="size-4 shrink-0 text-slate-400" />
                )}
                <span className="min-w-0 flex-1 truncate">{page.title}</span>
              </button>
              {role >= 3 && page.kind === "page" && (
                <button
                  type="button"
                  aria-label={`Tạo trang con trong ${page.title}`}
                  className="shrink-0 rounded p-1 transition-all active:scale-95"
                  onClick={() => props.onCreate(page.id)}
                >
                  <Plus className="size-3" />
                </button>
              )}
              <WorkspacePageMenu
                page={page}
                editable={role >= 3}
                manager={role >= 4}
                onAction={props.onPageAction}
              />
            </div>
            {children && !closed && tree(page.id, depth + 1, next)}
          </div>
        );
      });
  }
  const displayed =
    filter === "favorite"
      ? props.pages.filter((page) => page.favorite)
      : filter === "recent"
        ? [...props.pages]
            .filter((page) => page.opened_at)
            .sort((a, b) =>
              (b.opened_at || "").localeCompare(a.opened_at || ""),
            )
            .slice(0, 15)
        : [];
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50/70 text-slate-700 dark:bg-lms-shell dark:text-slate-300">
      <div className="shrink-0 space-y-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Workspace
          </span>
          <WorkspaceButton
            aria-label="Tạo không gian nhóm"
            className="size-7 p-1"
            onClick={props.onCreateSpace}
          >
            <Plus className="size-4" />
          </WorkspaceButton>
        </div>
        <label className="grid gap-1 text-xs text-slate-500 dark:text-slate-400">
          Không gian
          <select
            aria-label="Chọn không gian"
            value={props.space?.id || ""}
            onChange={(event) => {
              setQuery("");
              props.onOpen(undefined, event.target.value);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-800 dark:border-lms-border dark:bg-lms-input dark:text-slate-100"
          >
            {!props.space && <option value="">Trang được chia sẻ</option>}
            {props.bootstrap.spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {space.title}
              </option>
            ))}
          </select>
        </label>
        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {props.space?.kind === "personal" ? (
            <LockKeyhole className="size-3" />
          ) : (
            <Users className="size-3" />
          )}
          {props.space?.kind === "personal"
            ? "Riêng tư · chia sẻ khi bạn chọn"
            : "Theo quyền được cấp"}
        </p>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-lms-border dark:bg-lms-input">
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            ref={input}
            aria-label="Tìm trang Workspace"
            placeholder="Tìm trang…"
            className="w-full min-w-0 bg-transparent text-sm outline-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {role >= 3 && (
          <WorkspaceButton
            className="w-full justify-start border border-slate-200 bg-white dark:border-lms-border dark:bg-lms-input"
            onClick={() => props.onCreate()}
          >
            <Plus className="size-4" />
            Trang mới
          </WorkspaceButton>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {query.trim().length >= 2 ? (
          <div className="space-y-2" role="status">
            {search.loading ? (
              <p className="p-3 text-xs">Đang tìm…</p>
            ) : search.error ? (
              <p className="p-3 text-xs text-rose-600 dark:text-rose-300">
                {search.error}
              </p>
            ) : search.results.length ? (
              search.results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    props.onOpen(item.id);
                    setQuery("");
                  }}
                  className="block w-full rounded-xl p-3 text-left transition-all hover:bg-slate-100 active:scale-95 dark:hover:bg-lms-hover"
                >
                  <span className="block text-sm font-medium">
                    {item.title}
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {item.snippet}
                  </span>
                </button>
              ))
            ) : (
              <p className="p-3 text-xs">Chưa có trang phù hợp bạn được xem.</p>
            )}
          </div>
        ) : (
          <>
            <nav aria-label="Lọc trang" className="mb-5 space-y-1">
              {[
                { id: "all", label: "Tất cả trang", icon: Files },
                { id: "favorite", label: "Yêu thích", icon: Star },
                { id: "recent", label: "Gần đây", icon: History },
                { id: "shared", label: "Được chia sẻ", icon: Users },
              ].map((item) => (
                <WorkspaceButton
                  key={item.id}
                  className={`w-full justify-start ${filter === item.id ? "bg-slate-200/60 dark:bg-lms-hover" : ""}`}
                  onClick={() => setFilter(item.id as typeof filter)}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </WorkspaceButton>
              ))}
              <WorkspaceButton
                className="w-full justify-start"
                onClick={props.onInbox}
              >
                <Bell className="size-4" />
                Lời mời & thông báo
                {props.bootstrap.invitations.length > 0 && (
                  <span className="ml-auto rounded-full bg-blue-600 px-1.5 text-xs text-white">
                    {props.bootstrap.invitations.length}
                  </span>
                )}
              </WorkspaceButton>
            </nav>
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {filter === "all"
                ? "Trang trong không gian"
                : filter === "shared"
                  ? "Chia sẻ trực tiếp"
                  : filter === "favorite"
                    ? "Trang yêu thích"
                    : "Mở gần đây"}
            </p>
            {filter === "all"
              ? tree(null)
              : filter === "shared"
                ? props.bootstrap.shared_pages.map((page) => (
                    <WorkspaceButton
                      key={page.id}
                      className="w-full justify-start truncate text-left"
                      onClick={() => props.onOpen(page.id)}
                    >
                      <FileText className="size-4 shrink-0" />
                      <span className="truncate">{page.title}</span>
                    </WorkspaceButton>
                  ))
                : displayed.map((page) => (
                    <WorkspaceButton
                      key={page.id}
                      className="w-full justify-start truncate"
                      onClick={() => props.onOpen(page.id)}
                    >
                      <FileText className="size-4 shrink-0" />
                      <span className="truncate">{page.title}</span>
                    </WorkspaceButton>
                  ))}
          </>
        )}
      </div>
      <div className="shrink-0 space-y-1 border-t border-slate-200 p-3 dark:border-lms-border">
        <WorkspaceButton
          className="w-full justify-start"
          onClick={props.onNotes}
        >
          <NotebookPen className="size-4" />
          Vở ghi hiện có
        </WorkspaceButton>
        <WorkspaceButton
          className="w-full justify-start"
          onClick={props.onGuide}
        >
          <BookOpen className="size-4" />
          Hướng dẫn editor & LaTeX
        </WorkspaceButton>
        {role >= 4 && (
          <WorkspaceButton
            className="w-full justify-start"
            onClick={props.onTrash}
          >
            <Trash2 className="size-4" />
            Thùng rác
          </WorkspaceButton>
        )}
        <Link
          href="/lms"
          className="block px-3 py-2 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400"
        >
          Về BDCourse →
        </Link>
      </div>
    </div>
  );
}
