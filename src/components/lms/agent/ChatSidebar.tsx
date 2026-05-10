"use client";

/**
 * ChatSidebar — slide-out AI chat panel from the right edge.
 *
 * Lightweight overlay that reads the current PageContext to give
 * the AI engine full awareness of what the user is viewing.
 * Reuses AgentMessageBubble and AgentInputBar for consistency.
 */
import { useRef, useEffect, useCallback, useState } from "react";
import {
  X,
  Sparkles,
  MessageSquare,
  BookOpen,
  Loader2,
  Minus,
  Clock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useAgentChat } from "@/hooks/useAgentChat";
import { usePageContext } from "@/hooks/usePageContext";
import { AgentMessageBubble } from "./AgentMessageBubble";
import { AgentInputBar } from "./AgentInputBar";
import { ConversationSidebar } from "./ConversationSidebar";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Auto-detect agent type from the LMS role stored in sessionStorage. */
function detectAgentType(): "teacher" | "mentor" {
  if (typeof window === "undefined") return "mentor";
  const role = sessionStorage.getItem("lms_selected_role");
  return role === "TEACHER" || role === "ADMIN" ? "teacher" : "mentor";
}

const SIDEBAR_HINTS: Record<string, string[]> = {
  mentor: [
    "Giải thích bài học này",
    "Tóm tắt nội dung chính",
    "Cho tôi câu hỏi luyện tập",
  ],
  teacher: [
    "Phân tích tiến độ lớp",
    "Đề xuất cải thiện nội dung",
    "Tạo câu hỏi từ bài này",
  ],
};

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const { data: session } = useSession();
  const userId = session?.user
    ? Number((session.user as any).id || (session.user as any).userId)
    : undefined;

  const pageContext = usePageContext();
  const [agentType] = useState<"teacher" | "mentor">(detectAgentType);
  const [showHistory, setShowHistory] = useState(false);

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
    courseId: pageContext?.courseId,
    userId,
    pageContext: pageContext ?? undefined,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el && !showHistory) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, showHistory]);

  // Sidebar resizer
  const [width, setWidth] = useState(420);
  const isDragging = useRef(false);

  const startDragging = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; // prevent text selection while dragging
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      // Constraint min and max width
      if (newWidth > 320 && newWidth < window.innerWidth * 0.9) {
        setWidth(newWidth);
      }
    };
    const onMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Build context label for the header chip
  const contextLabel = pageContext?.courseName
    ? pageContext.contentTitle
      ? `${pageContext.courseName} › ${pageContext.contentTitle}`
      : pageContext.courseName
    : null;

  const hints = SIDEBAR_HINTS[agentType];

  return (
    <>
      {/* Sidebar panel */}
      <aside
        style={{ width: `${width}px` }}
        className={cn(
          "fixed top-0 right-0 z-[61] h-full max-w-[90vw]",
          "flex flex-col",
          "bg-white dark:bg-slate-900",
          "border-l border-slate-200 dark:border-slate-800",
          "shadow-2xl",
          // Only animate transform, not width, to make dragging smooth
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Resizer Handle */}
        <div
          onMouseDown={startDragging}
          className="absolute top-0 left-0 bottom-0 w-1.5 -ml-0.5 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 z-50 transition-colors group flex items-center justify-center"
        >
           <div className="h-8 w-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* ── Header ────────────────────────────────────────────────── */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            "border-b border-slate-200 dark:border-slate-800",
            "bg-white dark:bg-slate-900",
          )}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">
              AI Assistant
            </h3>
            {contextLabel ? (
              <div className="flex items-center gap-1 mt-0.5">
                <BookOpen className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate font-medium">
                  {contextLabel}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {agentType === "mentor" ? "Virtual Mentor" : "Teaching Assistant"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200 active:scale-95",
                "text-slate-400 hover:text-blue-600 dark:hover:text-blue-400",
                showHistory && "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
                !showHistory && "hover:bg-slate-100 dark:hover:bg-slate-800",
              )}
              title="Lịch sử chat"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                startNewChat();
                setShowHistory(false);
              }}
              className={cn(
                "p-2 rounded-lg transition-all duration-200 active:scale-95",
                "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
              )}
              title="Đoạn chat mới"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg transition-all duration-200 active:scale-95",
                "text-slate-400 hover:text-red-500",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
              )}
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main content area ────────────────────────────────────── */}
        {showHistory ? (
          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-900/50">
            <ConversationSidebar
              userId={userId || 0}
              agentType={agentType}
              activeSessionId={sessionId}
              onSelectSession={(sid) => {
                switchSession(sid);
                setShowHistory(false);
              }}
              onNewSession={() => {
                startNewChat();
                setShowHistory(false);
              }}
              className="border-r-0"
            />
          </div>
        ) : (
          <>
            {/* ── Context chip (when page context is available) ─────────── */}
            {pageContext && (
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/50 bg-blue-50/50 dark:bg-blue-950/20">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Context:
                  </span>{" "}
                  {pageContext.pageType === "lesson" && pageContext.contentTitle
                    ? `Đang xem: ${pageContext.contentTitle}`
                    : pageContext.pageType === "course_detail" && pageContext.courseName
                      ? `Khóa học: ${pageContext.courseName}`
                      : pageContext.pageType === "quiz"
                        ? `Quiz — ${pageContext.courseName || "Không rõ khóa"}`
                        : `Trang: ${pageContext.pageType}`}
                </p>
              </div>
            )}

            {/* ── Messages area ────────────────────────────────────────── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            >
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                      {agentType === "mentor" ? "Hỏi Mentor" : "Nhờ TA hỗ trợ"}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs">
                      {pageContext
                        ? "AI đã nắm được ngữ cảnh trang bạn đang xem."
                        : "Bắt đầu trò chuyện với AI."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    {hints.map((hint) => (
                      <button
                        key={hint}
                        onClick={() => sendMessage(hint)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-sm font-medium text-left",
                          "bg-slate-50 dark:bg-slate-800",
                          "border border-slate-200 dark:border-slate-700",
                          "text-slate-600 dark:text-slate-400",
                          "hover:bg-blue-50 dark:hover:bg-slate-700",
                          "hover:border-blue-300 dark:hover:border-blue-700",
                          "hover:text-blue-700 dark:hover:text-blue-400",
                          "transition-all duration-200 active:scale-[0.98]",
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
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-slate-500">
                    Đang tải...
                  </span>
                </div>
              )}
            </div>

            {/* ── Input bar ────────────────────────────────────────────── */}
            <AgentInputBar
              onSend={sendMessage}
              isStreaming={isStreaming || isLoadingHistory}
              onStop={stopStreaming}
              placeholder={
                agentType === "mentor"
                  ? "Hỏi về bài học hiện tại..."
                  : "Nhờ TA hỗ trợ..."
              }
            />
          </>
        )}
      </aside>
    </>
  );
}

