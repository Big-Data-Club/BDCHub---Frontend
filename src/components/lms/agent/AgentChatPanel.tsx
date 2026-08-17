"use client";

/**
 * AgentChatPanel - main chat container for both Mentor and Teacher agents.
 *
 * Layout: full-height flex column with scrollable message area + input bar.
 * Works as a self-contained component that can be embedded in any page.
 */
import { useRef, useEffect, useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MessageSquare, Sparkles, Sidebar, Cpu, ArrowDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useAgentChat } from "@/hooks/lms/agent/useAgentChat";
import { usePageContext } from "@/hooks/common/usePageContext";
import { AgentMessageBubble } from "./AgentMessageBubble";
import { AgentInputBar } from "./AgentInputBar";
import {
  ConversationSidebar,
  type ConversationSidebarHandle,
} from "./ConversationSidebar";
import { AgentConsoleSidebar } from "./AgentConsoleSidebar";
import type { AgentMessage, AgentSession, HITLRequestData } from "@/types";

interface AgentChatPanelProps {
  agentType: "teacher" | "mentor";
  courseId?: number;
  sessionId?: string;
  userId?: number;
  className?: string;
  defaultSidebarOpen?: boolean;
  defaultConsoleOpen?: boolean;
  isOverlaySidebar?: boolean;
  initialSelectedMessageId?: string;
  initialMessages?: AgentMessage[];
  initialSessions?: AgentSession[];
}

const WELCOME: Record<string, { title: string; subtitle: string; hints: string[] }> = {
  mentor: {
    title: "Virtual Mentor",
    subtitle: "Tôi có thể giúp bạn học tập hiệu quả hơn",
    hints: [
      "Giải thích khái niệm OOP",
      "Tôi đang yếu phần nào?",
      "Cho tôi 1 bài tập nhỏ",
      "Lập kế hoạch ôn tập",
    ],
  },
  teacher: {
    title: "Virtual Teaching Assistant",
    subtitle: "Tôi hỗ trợ bạn quản lý nội dung và phân tích học viên",
    hints: [
      "Tạo 5 câu hỏi trắc nghiệm",
      "Phân tích điểm yếu lớp",
      "Đề xuất bài cần ôn lại",
      "Index tài liệu mới",
    ],
  },
};

export function AgentChatPanel({
  agentType,
  courseId,
  sessionId: propSessionId,
  userId: propUserId,
  className,
  defaultSidebarOpen = true,
  defaultConsoleOpen = false,
  isOverlaySidebar = false,
  initialSelectedMessageId,
  initialMessages,
  initialSessions,
}: AgentChatPanelProps) {
  const { data: session } = useSession();
  const sessionUserId = session?.user ? Number((session.user as any).id || (session.user as any).userId) : undefined;
  const effectiveUserId = propUserId ?? sessionUserId ?? 1;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sidebarRef = useRef<ConversationSidebarHandle>(null);
 
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
  const [consoleOpen, setConsoleOpen] = useState(defaultConsoleOpen);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(initialSelectedMessageId || null);

  // Keyboard shortcut listener: Ctrl+Shift+C or Cmd+Shift+C toggles AI Console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setConsoleOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSessionUpdated = useCallback(
    (update: { sessionId: string; title?: string; reason: string }) => {
      const sidebar = sidebarRef.current;
      if (!sidebar) return;
      if (update.reason === "title" && update.title) {
        sidebar.patchSession(update.sessionId, { title: update.title });
      } else if (update.reason === "new" || update.reason === "reused") {
        sidebar.refresh();
      } else if (update.reason === "activity") {
        sidebar.touchSession(update.sessionId);
      }
    },
    [],
  );

  const pageContext = usePageContext();

  const {
    messages,
    sessionId,
    isStreaming,
    isLoadingHistory,
    sendMessage,
    stopStreaming,
    startNewChat,
    switchSession,
    deleteSession,
    renameSession,
  } = useAgentChat({
    agentType,
    courseId: courseId || (pageContext?.courseId ? Number(pageContext.courseId) : undefined),
    initialSessionId: propSessionId,
    initialMessages,
    userId: effectiveUserId,
    pageContext: pageContext || undefined,
    onSessionUpdated: handleSessionUpdated,
  });

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant") || null;

  // Reset selected message log when session ID changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSelectedMessageId(null);
  }, [sessionId]);

  const activeLogMessage = selectedMessageId
    ? (messages.find((m) => m.id === selectedMessageId) || null)
    : lastAssistantMsg;

  // Sync state sessionId back to URL query parameters
  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const urlSessionId = current.get("sessionId");
    
    if (sessionId) {
      if (urlSessionId !== sessionId) {
        current.set("sessionId", sessionId);
        router.replace(`${pathname}?${current.toString()}`);
      }
    } else if (urlSessionId) {
      current.delete("sessionId");
      router.replace(`${pathname}?${current.toString()}`);
    }
  }, [sessionId, router, pathname, searchParams]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const welcome = WELCOME[agentType];

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
      userScrolledUpRef.current = false;
      setShowScrollButton(false);
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceToBottom > 40) {
      setShowScrollButton(true);
      userScrolledUpRef.current = true;
    } else {
      setShowScrollButton(false);
      userScrolledUpRef.current = false;
    }
  }, []);

  // Auto-scroll to bottom on new messages if user has not scrolled up
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      scrollToBottom(true);
    }
  }, [messages, scrollToBottom]);

  const isEmpty = messages.length === 0;

  const handleActionApprove = useCallback((request: HITLRequestData) => {
    // Navigation is the only generic action today. Keep it local and allow
    // only application-relative paths; write actions use editable widgets.
    if (request.data?.action === "navigate") {
      const href = String(request.data?.href || "");
      if (href.startsWith("/") && !href.startsWith("//")) router.push(href);
    }
  }, [router]);

  return (
    <div
      className={cn(
        "flex h-full w-full relative",
        "bg-slate-50 dark:bg-[#050B18]",
        "overflow-hidden",
        className,
      )}
    >
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (isOverlaySidebar || (typeof window !== "undefined" && window.innerWidth < 1024)) && (
        <div
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "bg-black/40 backdrop-blur-xs animate-in fade-in duration-200",
            isOverlaySidebar ? "absolute inset-0 z-25" : "fixed inset-0 z-40 lg:hidden"
          )}
        />
      )}

      {/* Sidebar for chat history */}
      <ConversationSidebar 
        ref={sidebarRef}
        userId={effectiveUserId} 
        agentType={agentType} 
        activeSessionId={sessionId}
        initialSessions={initialSessions}
        onSelectSession={(sid) => {
          switchSession(sid);
          if (isOverlaySidebar || (typeof window !== "undefined" && window.innerWidth < 1024)) {
            setSidebarOpen(false);
          }
        }}
        onNewSession={() => {
          startNewChat();
          if (isOverlaySidebar || (typeof window !== "undefined" && window.innerWidth < 1024)) {
            setSidebarOpen(false);
          }
        }}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onCloseMobile={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarOpen(false)}
        className={cn(
          isOverlaySidebar
            ? "absolute inset-y-0 left-0 z-30 w-[280px] max-w-[85vw] border-r bg-white dark:bg-[#070E1C] transition-transform duration-300 ease-in-out"
            : "fixed inset-y-0 left-0 z-50 w-[280px] transition-all duration-300 ease-in-out lg:relative lg:z-0 lg:flex-shrink-0 lg:border-r border-slate-200/80 dark:border-blue-500/12",
          isOverlaySidebar
            ? (sidebarOpen ? "translate-x-0" : "-translate-x-full")
            : (sidebarOpen ? "translate-x-0 lg:w-72 xl:w-80 lg:opacity-100" : "-translate-x-full lg:w-0 lg:opacity-0 lg:pointer-events-none lg:border-none"),
        )}
      />

      {/* Main Chat Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-slate-50 dark:bg-[#050B18] overflow-hidden min-h-0 relative">
        {/* Floating Top Controls */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở lịch sử hội thoại"
            className={cn(
              "absolute top-3.5 left-4 z-30 p-2 rounded-xl",
              "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
              "hover:bg-slate-200/60 dark:hover:bg-[#162644]/80 backdrop-blur-sm",
              "transition-all duration-200 active:scale-95 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            )}
            title="Mở lịch sử hội thoại"
          >
            <Sidebar className="w-4.5 h-4.5 text-blue-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Lịch sử chat</span>
          </button>
        )}

        <button
          onClick={() => setConsoleOpen(!consoleOpen)}
          aria-label={consoleOpen ? "Ẩn nhật ký AI Console" : "Hiện nhật ký AI Console"}
          className={cn(
            "absolute top-3.5 right-4 z-30 p-2 sm:px-3 sm:py-1.5 rounded-xl backdrop-blur-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs",
            consoleOpen
              ? "text-blue-600 bg-blue-50/90 border border-blue-200 dark:text-cyan-400 dark:bg-blue-950/60 dark:border-cyan-500/30"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#162644]/80"
          )}
          title={consoleOpen ? "Ẩn Console (Ctrl+Shift+C)" : "Hiện Console Debugger (Ctrl+Shift+C)"}
        >
          <Cpu className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span className="hidden sm:inline">Console</span>
        </button>

        {/* Messages area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pt-12 pb-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 relative"
        >
          <div className="max-w-4xl mx-auto w-full px-2 sm:px-4 space-y-6">
            {isEmpty ? (
              /* Empty state - welcome + hint chips */
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-16">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-[#0F1E35] border border-blue-100 dark:border-cyan-500/20 flex items-center justify-center shadow-xs dark:shadow-none animate-in fade-in zoom-in-75 duration-300">
                  <MessageSquare className="w-8 h-8 text-blue-600 dark:text-cyan-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {welcome.title}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    {welcome.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 justify-center max-w-lg pt-2">
                  {welcome.hints.map((hint) => (
                    <button
                      key={hint}
                      onClick={() => sendMessage(hint)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-semibold",
                        "bg-white dark:bg-[#0F1E35]",
                        "border border-slate-200 dark:border-blue-500/15",
                        "text-slate-700 dark:text-slate-200",
                        "hover:bg-blue-50/80 dark:hover:bg-[#12223a]",
                        "hover:border-blue-400/60 dark:hover:border-cyan-500/40",
                        "hover:text-blue-600 dark:hover:text-cyan-400",
                        "transition-all duration-200 active:scale-95 cursor-pointer",
                        "shadow-xs dark:shadow-none",
                      )}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <AgentMessageBubble
                    key={msg.id}
                    message={msg}
                    onClarificationSelect={(option) => sendMessage(option)}
                    onActionApprove={handleActionApprove}
                    isSelectedForLogs={activeLogMessage?.id === msg.id}
                    onSelectForLogs={() => {
                      setSelectedMessageId(msg.id);
                      setConsoleOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
            
            {isLoadingHistory && (
              <div className="space-y-4 py-4">
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#0F1E35]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-[#0F1E35] rounded-md w-3/4" />
                      <div className="h-4 bg-slate-200 dark:bg-[#0F1E35] rounded-md w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Permanent 128px Gradient Fade Overlay Layer behind Floating Input Bar */}
        <div
          className={cn(
            "absolute bottom-0 inset-x-0 h-32 pointer-events-none z-10",
            "bg-gradient-to-t from-slate-50 via-slate-50/80 via-50% to-transparent dark:from-[#050B18] dark:via-[#050B18]/80 dark:via-50% dark:to-transparent"
          )}
        />

        {/* Floating Scroll to Latest Button */}
        {showScrollButton && (
          <div className="relative z-30">
            <button
              onClick={() => scrollToBottom(true)}
              aria-label="Cuộn xuống tin nhắn mới nhất"
              className={cn(
                "absolute right-6 -top-12 p-2.5 rounded-full",
                "bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/20",
                "text-slate-700 dark:text-cyan-400 shadow-md hover:shadow-lg",
                "hover:bg-blue-50 dark:hover:bg-[#162644]",
                "transition-all duration-200 active:scale-90 flex items-center gap-1.5 text-xs font-semibold cursor-pointer",
                "animate-in fade-in slide-in-from-bottom-2 duration-200",
              )}
              title="Cuộn xuống tin nhắn mới nhất"
            >
              <ArrowDown className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              {isStreaming && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>
          </div>
        )}

        {/* Floating Prompt Input bar wrapper */}
        <div className="relative z-20 flex-shrink-0 px-4 pb-4 pt-2">
          <div className="max-w-4xl mx-auto w-full">
            <AgentInputBar
              onSend={sendMessage}
              isStreaming={isStreaming || isLoadingHistory}
              onStop={stopStreaming}
              placeholder={
                agentType === "mentor"
                  ? "Hỏi Mentor về bài học..."
                  : "Nhờ TA hỗ trợ quản lý khóa học..."
              }
            />
          </div>
        </div>
      </div>
      
      {/* Right Sidebar Console */}
      <AgentConsoleSidebar
        isOpen={consoleOpen}
        onClose={() => setConsoleOpen(false)}
        activeMessage={activeLogMessage}
      />
    </div>
  );
}
