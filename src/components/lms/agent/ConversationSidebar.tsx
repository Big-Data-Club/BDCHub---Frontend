import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { MessageSquare, Plus, Clock, Loader2, Trash2, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentService } from "@/services/agentService";
import type { AgentSession } from "@/types";
 
interface ConversationSidebarProps {
  userId: number;
  agentType: "teacher" | "mentor";
  activeSessionId: string | null;
  initialSessions?: AgentSession[];
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onRenameSession?: (sessionId: string, newTitle: string) => void;
  onCloseMobile?: () => void;
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
    initialSessions,
    onSelectSession,
    onNewSession,
    onDeleteSession,
    onRenameSession,
    onCloseMobile,
    className,
  },
  ref,
) {
  const [sessions, setSessions] = useState<AgentSession[]>(initialSessions || []);
  const [isLoading, setIsLoading] = useState(!initialSessions?.length);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

 
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
    if (initialSessions && initialSessions.length > 0) {
      setSessions(initialSessions);
      setIsLoading(false);
      return;
    }
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
  }, [userId, agentType, initialSessions]);
 
  useImperativeHandle(
    ref,
    () => ({
      refresh: fetchSessions,
      patchSession: (sessionId, patch) => {
        setSessions((prev) => {
          const idx = prev.findIndex((s) => s.session_id === sessionId);
          if (idx === -1) {
            // Unknown session - pull a fresh list asynchronously.
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

  const handleRenameSubmit = useCallback(
    (sessionId: string) => {
      const trimmed = renameVal.trim();
      if (!trimmed) {
        setEditingSessionId(null);
        return;
      }
      // Optimistic UI update
      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === sessionId ? { ...s, title: trimmed } : s
        )
      );
      onRenameSession?.(sessionId, trimmed);
      setEditingSessionId(null);
    },
    [renameVal, onRenameSession]
  );

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white dark:bg-[#070E1C]",
        "border-r border-slate-200 dark:border-blue-500/10",
        className,
      )}
    >
      <div className="p-4 border-b border-slate-200 dark:border-blue-500/10 flex items-center gap-2">
        <button
          onClick={onNewSession}
          className={cn(
            "flex-1 flex items-center justify-center gap-2",
            "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold",
            "px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm",
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Đoạn chat mới</span>
        </button>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2.5 rounded-xl border border-slate-200 dark:border-blue-500/10 hover:bg-slate-100 dark:hover:bg-[#162644] text-slate-500 dark:text-slate-400 transition-all duration-200 active:scale-95 flex-shrink-0"
            title="Đóng thanh bên"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
 
      <div className="flex-1 overflow-y-auto w-full p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {isLoading ? (
          <div className="flex justify-center items-center h-20 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-sm text-slate-400/80 py-10">
            Chưa có lịch sử hội thoại
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.session_id === activeSessionId;
            const isEditing = editingSessionId === session.session_id;
            return (
              <div
                key={session.session_id}
                onClick={() => !isEditing && onSelectSession(session.session_id)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-xl transition-all duration-200 border-l-4 cursor-pointer group flex items-center justify-between gap-2 active:scale-[0.98]",
                  isEditing ? "border-blue-400" : isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-cyan-400 shadow-sm"
                    : "hover:bg-slate-100 dark:hover:bg-[#162644] border-transparent",
                )}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn("mt-0.5 transition-colors duration-200 flex-shrink-0", isActive ? "text-blue-500 dark:text-cyan-400" : "text-slate-400")}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSubmit(session.session_id);
                          if (e.key === "Escape") setEditingSessionId(null);
                        }}
                        onBlur={() => handleRenameSubmit(session.session_id)}
                        maxLength={100}
                        className="w-full text-sm font-medium bg-white dark:bg-slate-800 border border-blue-400 dark:border-blue-600 rounded-md px-2 py-0.5 outline-none text-slate-800 dark:text-slate-100 shadow-sm"
                        placeholder="Tên cuộc hội thoại..."
                      />
                    ) : (
                      <p
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.session_id);
                          setRenameVal(session.title || "");
                        }}
                        className={cn(
                          "text-sm font-medium truncate transition-colors duration-200",
                          isActive
                            ? "text-blue-700 dark:text-cyan-400 font-semibold"
                            : "text-slate-700 dark:text-slate-300",
                        )}
                      >
                        {session.title || "Cuộc hội thoại chưa đặt tên"}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
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
                      <span className="mx-1 text-slate-300 dark:text-slate-700">•</span>
                      <span className="truncate">{session.turn_count} lượt gửi</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons: Rename + Delete */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0 transition-opacity duration-150">
                  {onRenameSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(session.session_id);
                        setRenameVal(session.title || "");
                      }}
                      className="p-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-[#162644] text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200 active:scale-90"
                      title="Đổi tên"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Bạn có chắc chắn muốn xóa cuộc hội thoại này?")) {
                          onDeleteSession(session.session_id);
                        }
                      }}
                      className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 active:scale-90"
                      title="Xóa cuộc hội thoại"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});