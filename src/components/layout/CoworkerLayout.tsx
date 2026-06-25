"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, X, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePageContext } from "@/hooks/usePageContext";
import { AgentChatPanel } from "../lms/agent/AgentChatPanel";
import { AgentNotebookPanel } from "../lms/agent/AgentNotebookPanel";
import { NotificationPopover } from "@/components/lms/notifications/NotificationPopover";

export function CoworkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { user } = useAuth();

  // State persistency in localStorage
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
      setIsOpen(savedOpen === "true");
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
    setIsOpen((prev) => {
      const newVal = !prev;
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

  if (!isMounted || !shouldShowCoworker()) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden relative bg-slate-50 dark:bg-slate-950">
      {/* Workspace Area (Left Pane) */}
      <div 
        className="flex-1 h-full overflow-y-auto"
        style={{
          width: isOpen && !isMobile ? `calc(100% - ${width}px)` : "100%",
          transition: isDragging ? "none" : "width 0.3s ease-in-out",
        }}
      >
        {children}
      </div>

      {/* Resize Handle (Divider) - Desktop Only */}
      {isOpen && !isMobile && (
        <div
          onMouseDown={startResize}
          className={cn(
            "w-1.5 cursor-col-resize select-none h-full transition-colors duration-200 z-50 flex items-center justify-center relative border-l border-r border-slate-200 dark:border-slate-800",
            isDragging 
              ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500" 
              : "bg-slate-100 dark:bg-slate-900 hover:bg-blue-400 dark:hover:bg-blue-600"
          )}
        >
          {/* visual grip dots */}
          <div className="flex flex-col gap-1.5 opacity-60">
            <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
            <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
            <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
          </div>
        </div>
      )}

      {/* Coworker Panel (Right Pane) */}
      {isOpen && (
        <div
          className={cn(
            "h-full bg-white dark:bg-slate-950 flex flex-col z-40 border-l border-slate-200 dark:border-slate-800 shadow-2xl relative",
            isMobile ? "fixed inset-y-0 right-0 w-full sm:w-[450px]" : ""
          )}
          style={{
            width: isMobile ? undefined : `${width}px`,
            transition: isDragging ? "none" : "width 0.3s ease-in-out, transform 0.3s ease-in-out",
          }}
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
            {activeTab === "chat" ? (
              <AgentChatPanel
                key={agentType} // Re-mounts the panel when switching agent types to reset internal state correctly
                agentType={agentType}
                className="h-full border-none rounded-none"
                defaultSidebarOpen={false}
              />
            ) : (
              <AgentNotebookPanel
                courseId={pageContext?.courseId ? Number(pageContext.courseId) : undefined}
                className="h-full"
              />
            )}
          </div>
        </div>
      )}

      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={handleToggleOpen}
          className={cn(
            "fixed bottom-6 right-6 z-[99] flex items-center justify-center w-14 h-14 rounded-full",
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

      {/* Persistent Global Notification Bell (only for authenticated sessions) */}
      {status === "authenticated" && (!isOpen || !isMobile) && (
        <div 
          className="fixed top-4 transition-all duration-300 z-[40]"
          style={{ right: isOpen ? `${width + 16}px` : "16px" }}
        >
          <NotificationPopover />
        </div>
      )}
    </div>
  );
}
