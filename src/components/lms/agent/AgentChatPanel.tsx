"use client";

/**
 * AgentChatPanel - main chat container for both Mentor and Teacher agents.
 *
 * Layout: full-height flex column with scrollable message area + input bar.
 * Works as a self-contained component that can be embedded in any page.
 */
import { useRef, useEffect, useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MessageSquare, Sparkles, Loader2, PanelLeftClose, PanelLeftOpen, Cpu } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useAgentChat } from "@/hooks/useAgentChat";
import { usePageContext } from "@/hooks/usePageContext";
import { AgentMessageBubble } from "./AgentMessageBubble";
import { AgentInputBar } from "./AgentInputBar";
import {
  ConversationSidebar,
  type ConversationSidebarHandle,
} from "./ConversationSidebar";
import { AgentConsoleSidebar } from "./AgentConsoleSidebar";
import type { AgentMessage, HITLRequestData } from "@/types";

interface AgentChatPanelProps {
  agentType: "teacher" | "mentor";
  courseId?: number;
  sessionId?: string;
  userId?: number;
  className?: string;
  defaultSidebarOpen?: boolean;
  initialMessages?: AgentMessage[];
  initialSessions?: any[];
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
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

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
  useEffect(() => {
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
  const welcome = WELCOME[agentType];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

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
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
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
          if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setSidebarOpen(false);
          }
        }}
        onNewSession={() => {
          startNewChat();
          if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setSidebarOpen(false);
          }
        }}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onCloseMobile={() => setSidebarOpen(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] transition-all duration-300 ease-in-out lg:relative lg:z-0 lg:border-r border-slate-200 dark:border-blue-500/10",
          sidebarOpen 
            ? "translate-x-0 lg:w-1/5 lg:min-w-[220px] lg:max-w-[260px] lg:opacity-100" 
            : "-translate-x-full lg:w-0 lg:opacity-0 lg:pointer-events-none lg:border-none",
        )}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-[#050B18] overflow-hidden">
        {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-3.5",
          "border-b border-slate-200 dark:border-blue-500/10",
          "bg-white/80 dark:bg-[#070E1C]/90 backdrop-blur-md sticky top-0 z-10",
        )}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#162644] transition-all duration-200 active:scale-95 flex-shrink-0"
          title={sidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
        >
          {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>
        
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-cyan-500/15 flex items-center justify-center flex-shrink-0 shadow-sm dark:shadow-none">
          <Sparkles className="w-4.5 h-4.5 text-blue-600 dark:text-cyan-400" />
        </div>
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {welcome.title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              BDC AI Learning Assistant
            </p>
          </div>
          {courseId && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/20">
              Môn học #{courseId}
            </span>
          )}
        </div>

        <button
          onClick={() => setConsoleOpen(!consoleOpen)}
          className={cn(
            "ml-auto p-2 rounded-xl border transition-all duration-200 active:scale-95 flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold",
            consoleOpen
              ? "text-blue-600 bg-blue-50 border-blue-200 dark:text-cyan-400 dark:bg-blue-950/40 dark:border-blue-500/30 shadow-sm"
              : "text-slate-600 border-slate-200 dark:text-slate-400 dark:border-blue-500/20 hover:bg-slate-50 dark:hover:bg-[#162644]"
          )}
          title={consoleOpen ? "Ẩn Console" : "Hiện Console Debugger"}
        >
          <Cpu className="w-4 h-4" />
          <span className="hidden sm:inline">Console</span>
        </button>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
      >
        <div className="max-w-4xl mx-auto w-full px-2 sm:px-4 space-y-6">
          {isEmpty ? (
            /* Empty state - welcome + hint chips */
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-16">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-cyan-500/20 flex items-center justify-center shadow-sm dark:shadow-none animate-in fade-in zoom-in-75 duration-300">
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
                      "px-4 py-2 rounded-full text-xs font-semibold",
                      "bg-white dark:bg-[#0F1E35]",
                      "border border-slate-200 dark:border-blue-500/20",
                      "text-slate-700 dark:text-slate-300",
                      "hover:bg-blue-50/80 dark:hover:bg-[#162644]",
                      "hover:border-blue-300 dark:hover:border-cyan-400/40",
                      "hover:text-blue-600 dark:hover:text-cyan-400",
                      "transition-all duration-200 active:scale-95",
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
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 dark:text-cyan-400" />
              <span className="ml-2.5 text-sm text-slate-500 dark:text-slate-400">Đang tải lịch sử...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input bar wrapper */}
      <div className="border-t border-slate-200 dark:border-blue-500/10 bg-white dark:bg-[#070E1C] px-4 py-3">
        <div className="max-w-4xl mx-auto w-full">
          <AgentInputBar
            onSend={sendMessage}
            isStreaming={isStreaming || isLoadingHistory}
            onStop={stopStreaming}
            className="border-t-0 p-0"
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
