"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "@/lib/tenant/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth/useAuth";
import { useCoworkerResize } from "@/hooks/common/useCoworkerResize";
import { usePageContext } from "@/hooks/common/usePageContext";

const AgentChatPanel = dynamic(
  () => import("../lms/agent/AgentChatPanel").then((mod) => mod.AgentChatPanel),
  { ssr: false, loading: () => <PanelLoading label="Đang mở AI trợ lý…" /> },
);
const AgentNotebookPanel = dynamic(
  () => import("../lms/agent/AgentNotebookPanel").then((mod) => mod.AgentNotebookPanel),
  { ssr: false, loading: () => <PanelLoading label="Đang mở vở ghi…" /> },
);

function PanelLoading({ label }: { label: string }) {
  return <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">{label}</div>;
}

let coworkerPreloaded = false;
function preloadCoworker() {
  if (coworkerPreloaded) return;
  coworkerPreloaded = true;
  void import("../lms/agent/AgentChatPanel");
  void import("../lms/agent/AgentNotebookPanel");
}

export function CoworkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const courseNotebookAvailable = /^\/lms\/student\/courses\/\d+(\/|$)/.test(pathname);
  const { status } = useSession();
  const { user } = useAuth();
  const canOpen = status === "authenticated" && !pathname.includes("/ai-mentor") && !pathname.includes("/ai-assistant") &&
    ["/dashboard", "/lms", "/events", "/tasks", "/users", "/profile", "/chat"].some(path => pathname === path || pathname.startsWith(path + "/"));

  // State persistency in localStorage
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasOpened, setHasOpened] = useState<boolean>(false);
  const [agentType, setAgentType] = useState<"mentor" | "teacher">("mentor");
  const [activeTab, setActiveTab] = useState<"chat" | "notebook">("chat");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const pageContext = usePageContext();
  const { rootRef, isSplit, isDragging, separatorProps } = useCoworkerResize(isOpen && canOpen);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Initialize and persist state on mount
  useEffect(() => {
    setIsMounted(true);
    
    try {
      const open = localStorage.getItem("bdc_coworker_open") === "true";
      setIsOpen(open);
      setHasOpened(open);
    } catch { /* A blocked preference store must not prevent opening chat. */ }

  }, []);

  // Update default agentType based on user role and current pathname context
  useEffect(() => {
    if (pathname) {
      if (pathname.includes("/lms/student")) {
        setAgentType("mentor");
        return;
      }
      if (pathname.includes("/lms/teacher")) {
        setAgentType("teacher");
        return;
      }
    }

    if (user?.role) {
      const isAdminOrTeacher = 
        user.role === "ROLE_ADMIN" || 
        user.role === "ROLE_MANAGER" || 
        user.role === "ROLE_TEACHER";
      
      setAgentType(isAdminOrTeacher ? "teacher" : "mentor");
    }
  }, [user, pathname]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    try { localStorage.setItem("bdc_coworker_open", "false"); } catch { /* Optional preference. */ }
    requestAnimationFrame(() => {
      const previous = returnFocusRef.current;
      (previous?.isConnected ? previous : triggerRef.current)?.focus({ preventScroll: true });
    });
  }, []);

  const handleToggleOpen = useCallback(() => {
    if (isOpen) { handleClose(); return; }
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    preloadCoworker();
    setHasOpened(true);
    setIsOpen(true);
    try { localStorage.setItem("bdc_coworker_open", "true"); } catch { /* Optional preference. */ }
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen || !canOpen) return;
    panelRef.current?.focus({ preventScroll: true });
  }, [isOpen, canOpen]);

  // Global Keyboard Shortcut: Shift+A toggles AI Coworker drawer
  useEffect(() => {
    if (!canOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleToggleOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleOpen, canOpen]);

  if (pathname === "/projects" || pathname.startsWith("/projects/")) {
    return <>{children}</>;
  }

  const showCoworker = isMounted && canOpen;

  const isFullHeightPage = pathname?.includes("/ai-mentor") || pathname?.includes("/ai-assistant");

  return (
    <div ref={rootRef} className="flex h-dvh w-full min-w-0 overflow-hidden relative bg-slate-50 dark:bg-slate-950">
      {/* Workspace Area (Left Pane) */}
      <div
        hidden={showCoworker && isOpen && !isSplit}
        className={cn("@container/workspace flex-1 min-w-0 h-full", isFullHeightPage ? "overflow-hidden" : "overflow-y-auto", isDragging && "pointer-events-none select-none")}
      >
        {children}
      </div>

      {/* Coworker Panel (Right Pane) */}
      {showCoworker && hasOpened && (
        <aside
          ref={panelRef}
          id="coworker-panel"
          aria-label="AI Cowork"
          tabIndex={-1}
          hidden={!isOpen}
          inert={!isOpen}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
              event.preventDefault();
              handleClose();
            }
          }}
          className={cn(
            "relative shrink-0 min-w-0 flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 outline-none",
            isOpen ? "flex" : "hidden",
            isSplit ? "w-[var(--coworker-width,450px)]" : "w-full"
          )}
        >
          {/* Resize Handle */}
          {isSplit && isOpen && (
            <div
              {...separatorProps}
              aria-controls="coworker-panel"
              title="Kéo hoặc dùng phím mũi tên để chỉnh; nhấp đúp để đặt lại"
              className={cn(
                "absolute top-0 left-0 -translate-x-1/2 bottom-0 w-2 touch-none cursor-col-resize z-50 group/resize focus-visible:outline-2 focus-visible:outline-blue-500",
                isDragging ? "bg-blue-500/20" : "hover:bg-blue-500/10"
              )}
            >
              {/* Visual indicator line */}
              <div className={cn(
                "w-0.5 h-full mx-auto transition-colors duration-200",
                isDragging ? "bg-blue-500" : "bg-transparent group-hover/resize:bg-blue-500/30"
              )} />
            </div>
          )}
          {/* Header Segment selector */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg w-full">
                <button
                  onClick={() => {
                    setActiveTab("chat");
                  }}
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded-md font-semibold transition-all duration-200 active:scale-95 cursor-pointer",
                    activeTab === "chat"
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  {agentType === "teacher" ? "AI Virtual Assistant" : "AI Mentor"}
                </button>
                <button
                  onClick={() => {
                    if (courseNotebookAvailable) { window.dispatchEvent(new Event("bdc:open-course-notebook")); handleClose(); }
                    else setActiveTab("notebook");
                  }}
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded-md font-semibold transition-all duration-200 active:scale-95 cursor-pointer",
                    activeTab === "notebook"
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  Vở ghi (Notebook)
                </button>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
              title={isSplit ? "Đóng AI Cowork" : "Quay lại nội dung"}
              aria-label={isSplit ? "Đóng AI Cowork" : "Quay lại nội dung"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Panel (Chat or Notebook) */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <div className={cn("h-full", activeTab !== "chat" && "hidden")}>
              <AgentChatPanel
                key={agentType} // Re-mounts the panel when switching agent types to reset internal state correctly
                agentType={agentType}
                className="h-full border-none rounded-none"
                defaultSidebarOpen={false}
                isOverlaySidebar={true}
              />
            </div>
            {activeTab === "notebook" && (
              <AgentNotebookPanel
                courseId={pageContext?.courseId ? Number(pageContext.courseId) : undefined}
                className="h-full"
              />
            )}
          </div>
        </aside>
      )}

      {/* Floating AI Coworker Trigger Pill (Quieter & Refined) */}
      {showCoworker && !isOpen && (
        pathname.startsWith("/lms/teacher") ||
        pathname.startsWith("/lms/admin") ||
        pathname.startsWith("/lms/student")
      ) && (
        <button
          ref={triggerRef}
          onClick={handleToggleOpen}
          aria-controls="coworker-panel"
          aria-expanded={false}
          onMouseEnter={preloadCoworker}
          onFocus={preloadCoworker}
          className={cn(
            "fixed bottom-6 right-6 z-[55] flex items-center gap-2 px-3.5 py-2 rounded-full",
            "bg-white/95 dark:bg-[#070E1C]/95 backdrop-blur-md",
            "border border-slate-200/80 dark:border-blue-500/20",
            "hover:border-slate-300 dark:hover:border-blue-500/40",
            "shadow-sm hover:shadow-md",
            "transition-all duration-200 active:scale-95 cursor-pointer group"
          )}
          title="Mở AI Coworker (Shift+A)"
        >
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
            AI Cowork
          </span>
        </button>
      )}

    </div>
  );
}
