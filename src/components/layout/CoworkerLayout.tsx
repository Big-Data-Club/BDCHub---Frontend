"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, X, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePageContext } from "@/hooks/usePageContext";


// The coworker is available on every authenticated page. Keep its sizeable
// chat/notebook code out of the shared navigation bundle until it is opened.
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

class CoworkerPanelBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    // Keep the failure isolated to the optional panel; the workspace must
    // remain usable even if a persisted legacy widget is malformed.
    console.error("[coworker-panel] render failed", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Không thể hiển thị phiên AI này.</p>
          <button type="button" onClick={() => this.setState({ failed: false })} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700">Thử lại</button>
        </div>
      );
    }
    return this.props.children;
  }
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
  const { data: session, status } = useSession();
  const { user } = useAuth();

  // State persistency in localStorage
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasOpened, setHasOpened] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(450);
  const [agentType, setAgentType] = useState<"mentor" | "teacher">("mentor");
  const [activeTab, setActiveTab] = useState<"chat" | "notebook">("chat");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const pageContext = usePageContext();

  // Initialize and persist state on mount
  useEffect(() => {
    setIsMounted(true);
    
    const savedOpen = localStorage.getItem("bdc_coworker_open");
    if (savedOpen !== null) {
      const open = savedOpen === "true";
      setIsOpen(open);
      setHasOpened(open);
    }

    const savedWidth = localStorage.getItem("bdc_coworker_width");
    if (savedWidth !== null) {
      const parsedWidth = parseInt(savedWidth, 10);
      if (!isNaN(parsedWidth) && parsedWidth >= 320) {
        setWidth(parsedWidth);
      }
    }

    // Detect mobile viewport
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  // Persist state changes
  const handleToggleOpen = useCallback(() => {
    preloadCoworker();
    setIsOpen((prev) => {
      const newVal = !prev;
      if (newVal) setHasOpened(true);
      localStorage.setItem("bdc_coworker_open", String(newVal));
      return newVal;
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem("bdc_coworker_open", "false");
  }, []);

  // Resizing mouse handlers
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      // Calculate width from the right edge
      const newWidth = windowWidth - e.clientX;
      
      // Impose limits (min 320px, max 75% of screen width)
      if (newWidth >= 320 && newWidth <= windowWidth * 0.75) {
        setWidth(newWidth);
        localStorage.setItem("bdc_coworker_width", String(newWidth));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Render check: determine if coworker widget should be enabled on this page
  const shouldShowCoworker = () => {
    if (status !== "authenticated") return false;
    
    // Hide on dedicated AI pages to prevent double chat interface
    if (pathname.includes("/ai-mentor") || pathname.includes("/ai-assistant")) {
      return false;
    }
    
    // Only display on workspace pages
    const workspacePaths = [
      "/dashboard",
      "/lms",
      "/events",
      "/tasks",
      "/users",
      "/profile",
      "/chat"
    ];
    
    return workspacePaths.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );
  };

  if (!isMounted) {
    return <>{children}</>;
  }

  const showCoworker = shouldShowCoworker();

  const isFullHeightPage = pathname?.includes("/ai-mentor") || pathname?.includes("/ai-assistant");

  return (
    <div className="flex h-screen w-screen overflow-hidden relative bg-slate-50 dark:bg-slate-950">
      {/* Workspace Area (Left Pane) */}
      <div className={cn("flex-1 h-full w-full", isFullHeightPage ? "overflow-hidden" : "overflow-y-auto")}>
        {children}
      </div>

      {/* Backdrop overlay */}
      {showCoworker && (
        <div
          className={cn(
            "fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out z-[60]",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={handleClose}
        />
      )}

      {/* Coworker Panel (Right Pane) */}
      {showCoworker && hasOpened && (
        <div
          className={cn(
            "fixed inset-y-0 right-0 z-[70] flex flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "translate-x-full",
            isMobile ? "w-full sm:w-[450px]" : "w-[450px] max-w-[90vw]"
          )}
        >
          {/* Header Segment selector */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg w-full">
                <button
                  onClick={() => {
                    setActiveTab("chat");
                  }}
                  className={cn(
                    "flex-1 text-[10px] sm:text-xs py-1.5 rounded-md font-semibold transition-all duration-200 active:scale-95 cursor-pointer",
                    activeTab === "chat"
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  {agentType === "teacher" ? "AI Virtual Assistant" : "AI Mentor"}
                </button>
                <button
                  onClick={() => setActiveTab("notebook")}
                  className={cn(
                    "flex-1 text-[10px] sm:text-xs py-1.5 rounded-md font-semibold transition-all duration-200 active:scale-95 cursor-pointer",
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
              title="Đóng AI Coworker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Panel (Chat or Notebook) */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CoworkerPanelBoundary key={`${agentType}-${activeTab}`}>
              {activeTab === "chat" ? (
                <AgentChatPanel
                  key={agentType} // Re-mounts the panel when switching agent types to reset internal state correctly
                  agentType={agentType}
                  className="h-full border-none rounded-none"
                  defaultSidebarOpen={false}
                  isOverlaySidebar={true}
                />
              ) : (
                <AgentNotebookPanel
                  courseId={pageContext?.courseId ? Number(pageContext.courseId) : undefined}
                  className="h-full"
                />
              )}
            </CoworkerPanelBoundary>
          </div>
        </div>
      )}

      {/* Floating Chat Bubble Button */}
      {showCoworker && !isOpen && (
        pathname.startsWith("/lms/teacher") ||
        pathname.startsWith("/lms/admin") ||
        pathname.startsWith("/lms/student")
      ) && (
        <button
          onClick={handleToggleOpen}
          onMouseEnter={preloadCoworker}
          onFocus={preloadCoworker}
          className={cn(
            "fixed bottom-6 right-6 z-[55] flex items-center justify-center w-14 h-14 rounded-full",
            "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
            "shadow-xl shadow-indigo-500/20 text-white transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group"
          )}
          title="Mở AI Coworker"
        >
          {/* Subtle glow pulse ring */}
          <span className="absolute inset-0 rounded-full border border-blue-500/50 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-75" />
          
          <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}

    </div>
  );
}
