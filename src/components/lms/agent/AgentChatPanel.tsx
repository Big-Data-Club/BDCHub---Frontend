"use client";

/**
 * AgentChatPanel — main chat container for both Mentor and Teacher agents.
 *
 * Layout: full-height flex column with scrollable message area + input bar.
 * Works as a self-contained component that can be embedded in any page.
 */
import { useRef, useEffect, useCallback } from "react";
import { MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useAgentChat } from "@/hooks/useAgentChat";
import { AgentMessageBubble } from "./AgentMessageBubble";
import { AgentInputBar } from "./AgentInputBar";
import {
  ConversationSidebar,
  type ConversationSidebarHandle,
} from "./ConversationSidebar";

interface AgentChatPanelProps {
  agentType: "teacher" | "mentor";
  courseId?: number;
  className?: string;
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
  className,
}: AgentChatPanelProps) {
  const { data: session } = useSession();
  const userId = session?.user ? Number((session.user as any).id || (session.user as any).userId) : undefined;

  const sidebarRef = useRef<ConversationSidebarHandle>(null);
 
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
 
  const {
    messages,
    sessionId,
    isStreaming,
    isLoadingHistory,
    sendMessage,
    stopStreaming,
    startNewChat,
    switchSession,
  } = useAgentChat({
    agentType,
    courseId,
    userId,
    onSessionUpdated: handleSessionUpdated,
  });

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

  return (
    <div
      className={cn(
        "flex h-full w-full",
        "bg-slate-50 dark:bg-slate-950",
        "rounded-2xl border border-slate-200 dark:border-slate-800",
        "overflow-hidden",
        className,
      )}
    >
      {/* Sidebar for chat history */}
      {userId && (
          <ConversationSidebar 
              ref={sidebarRef}
              userId={userId} 
              agentType={agentType} 
              activeSessionId={sessionId}
              onSelectSession={switchSession}
              onNewSession={startNewChat}
              className="w-1/4 min-w-[250px] max-w-[300px] border-r-0 lg:border-r"
          />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950">
        {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-4",
          "border-b border-slate-200 dark:border-slate-800",
          "bg-white dark:bg-slate-900",
        )}
      >
        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
            {welcome.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Powered by AI
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {isEmpty ? (
          /* Empty state — welcome + hint chips */
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                {welcome.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm">
                {welcome.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {welcome.hints.map((hint) => (
                <button
                  key={hint}
                  onClick={() => sendMessage(hint)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium",
                    "bg-white dark:bg-slate-900",
                    "border border-slate-200 dark:border-slate-800",
                    "text-slate-600 dark:text-slate-400",
                    "hover:bg-blue-50 dark:hover:bg-slate-800",
                    "hover:border-blue-300 dark:hover:border-blue-700",
                    "hover:text-blue-700 dark:hover:text-blue-400",
                    "transition-all duration-200 active:scale-95",
                    "shadow-sm",
                  )}
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <AgentMessageBubble
              key={msg.id}
              message={msg}
              onClarificationSelect={(option) => sendMessage(option)}
            />
          ))
        )}
        
        {isLoadingHistory && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-slate-500">Đang tải lịch sử...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
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
  );
}
