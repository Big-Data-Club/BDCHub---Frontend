"use client";

/**
 * usePageContext - global page-context provider for AI Chat Sidebar.
 *
 * Each LMS page calls `setPageContext(...)` to declare what
 * the user is currently viewing. The ChatSidebar reads this
 * context and includes it in every AI request so the engine
 * knows the exact course / section / content without guessing.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

// ── Public interface ────────────────────────────────────────────────────────

export interface PageContext {
  /** High-level category of the current page. */
  pageType:
    | "course_list"
    | "course_detail"
    | "lesson"
    | "quiz"
    | "forum"
    | "dashboard"
    | "other";

  courseId?: number;
  courseName?: string;
  sectionId?: number;
  sectionName?: string;
  contentId?: number;
  contentTitle?: string;
  /** Lesson material kind, e.g. TEXT / FILE / VIDEO / QUIZ. */
  contentType?: string;
  /** Optional: the actual text content of the lesson/page. */
  contentBody?: string;

  /** Free-form bag for page-specific extras (e.g. quiz id, forum post). */
  extra?: Record<string, any>;

  /** Current route, added by the provider; useful for explainability only. */
  route?: string;
}

// ── Context internals ───────────────────────────────────────────────────────

interface PageContextValue {
  pageContext: PageContext | null;
  setPageContext: (ctx: PageContext) => void;
  patchPageContext: (patch: Partial<PageContext>) => void;
  clearPageContext: () => void;
}

const PageCtx = createContext<PageContextValue | null>(null);

// ── Session persistence ─────────────────────────────────────────────────────
//
// The AI sidebar can be opened before the page finishes loading its data
// (course fetch, content fetch...). Persisting the last declared context -
// bound to the exact route that declared it - lets the agent keep working
// with the right course across hard reloads and mount races instead of
// asking "which course do you mean?".

const PAGE_CONTEXT_STORAGE_KEY = "lms_page_context";

function readStoredPageContext(): PageContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PAGE_CONTEXT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PageContext;
    // Context is only valid on the route that declared it. A different
    // pathname means the user navigated elsewhere - never reuse it.
    if (!parsed || (parsed.route && parsed.route !== window.location.pathname)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistPageContext(ctx: PageContext | null): void {
  if (typeof window === "undefined") return;
  try {
    if (ctx) {
      sessionStorage.setItem(PAGE_CONTEXT_STORAGE_KEY, JSON.stringify(ctx));
    } else {
      sessionStorage.removeItem(PAGE_CONTEXT_STORAGE_KEY);
    }
  } catch {
    // Storage full / disabled - context still works in-memory.
  }
}

// ── Provider ────────────────────────────────────────────────────────────────

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [pageContext, _setPageContext] = useState<PageContext | null>(null);

  // Restore after mount (not during lazy init) so SSR HTML and the client
  // hydration pass render identically.
  useEffect(() => {
    const stored = readStoredPageContext();
    if (stored) {
      _setPageContext(stored);
    }
  }, []);

  const setPageContext = useCallback((ctx: PageContext) => {
    const next = {
      ...ctx,
      route: typeof window === "undefined" ? ctx.route : window.location.pathname,
    };
    _setPageContext(next);
    persistPageContext(next);
  }, []);

  const patchPageContext = useCallback((patch: Partial<PageContext>) => {
    _setPageContext((prev) => {
      const next = {
        ...(prev || {}),
        ...patch,
        route: typeof window === "undefined" ? patch.route || prev?.route : window.location.pathname,
      } as PageContext;
      persistPageContext(next);
      return next;
    });
  }, []);

  const clearPageContext = useCallback(() => {
    _setPageContext(null);
    persistPageContext(null);
  }, []);

  return (
    <PageCtx.Provider value={{ pageContext, setPageContext, patchPageContext, clearPageContext }}>
      {children}
    </PageCtx.Provider>
  );
}

// ── Hooks ───────────────────────────────────────────────────────────────────

/** Read the current page context (used by ChatSidebar). */
export function usePageContext(): PageContext | null {
  const ctx = useContext(PageCtx);
  return ctx?.pageContext ?? null;
}

/** Set page context from a page component. */
export function useSetPageContext() {
  const ctx = useContext(PageCtx);
  if (!ctx) {
    // Outside provider - return noops so pages don't crash
    return {
      setPageContext: () => {},
      patchPageContext: () => {},
      clearPageContext: () => {},
    };
  }
  return {
    setPageContext: ctx.setPageContext,
    patchPageContext: ctx.patchPageContext,
    clearPageContext: ctx.clearPageContext,
  };
}
