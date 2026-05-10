import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { MessageSquare, Plus, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentService } from "@/services/agentService";
import type { AgentSession } from "@/types";
 
interface ConversationSidebarProps {
  userId: number;
  agentType: "teacher" | "mentor";
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  className?: string;
}
 
export interface ConversationSidebarHandle {
  refresh: () => Promise<void>;
  patchSession: (sessionId: string, patch: Partial<AgentSession>) => void;
  touchSession: (sessionId: string) => void;
}
 
export const ConversationSidebar = forwardRef<
  ConversationSidebarHandle,
  ConversationSidebarProps
>(function ConversationSidebar(
  {
    userId,
    agentType,
    activeSessionId,
    onSelectSession,
    onNewSession,
    className,
  },
  ref,
) {
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await agentService.listSessions(userId, agentType);
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, agentType]);
 
  useEffect(() => {
    let unmounted = false;
    (async () => {
      setIsLoading(true);
      try {
        const data = await agentService.listSessions(userId, agentType);
        if (!unmounted) setSessions(data);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        if (!unmounted) setIsLoading(false);
      }
    })();
    return () => {
      unmounted = true;
    };
  }, [userId, agentType]);
 
  useImperativeHandle(
    ref,
    () => ({
      refresh: fetchSessions,
      patchSession: (sessionId, patch) => {
        setSessions((prev) => {
          const idx = prev.findIndex((s) => s.session_id === sessionId);
          if (idx === -1) {
            // Unknown session — pull a fresh list asynchronously.
            fetchSessions();
            return prev;
          }
          const next = [...prev];
          next[idx] = { ...next[idx], ...patch };
          return next;
        });
      },
      touchSession: (sessionId) => {
        setSessions((prev) => {
          const idx = prev.findIndex((s) => s.session_id === sessionId);
          if (idx === -1) {
            fetchSessions();
            return prev;
          }
          const updated = {
            ...prev[idx],
            last_active_at: new Date().toISOString(),
            turn_count: (prev[idx].turn_count || 0) + 1,
          };
          const next = [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
          return next;
        });
      },
    }),
    [fetchSessions],
  );
 
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-slate-50 dark:bg-slate-900",
        "border-r border-slate-200 dark:border-slate-800",
        className,
      )}
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onNewSession}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "bg-blue-600 hover:bg-blue-700 text-white font-medium",
            "px-4 py-2.5 rounded-xl transition-all duration-200",
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Đoạn chat mới</span>
        </button>
      </div>
 
      <div className="flex-1 overflow-y-auto w-full p-2 space-y-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-20 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-6">
            Chưa có lịch sử hội thoại
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.session_id === activeSessionId;
            return (
              <button
                key={session.session_id}
                onClick={() => onSelectSession(session.session_id)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-xl transition-colors duration-200",
                  isActive
                    ? "bg-slate-200 dark:bg-slate-800"
                    : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isActive
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-700 dark:text-slate-300",
                      )}
                    >
                      {session.title || "Cuộc hội thoại chưa đặt tên"}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {session.last_active_at
                          ? new Date(session.last_active_at).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )
                          : ""}
                      </span>
                      <span className="mx-1">•</span>
                      <span>{session.turn_count} turns</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
});