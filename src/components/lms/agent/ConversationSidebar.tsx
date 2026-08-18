import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { MessageSquare, Plus, Clock, Loader2, Trash2, X, Pencil, Sidebar } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentService } from "@/services/ai/agentService";
import type { AgentSession } from "@/types";
import { TruncatedTooltip } from "@/components/common/TruncatedTooltip";

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
  onToggleCollapse?: () => void;
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
    onToggleCollapse,
    className,
  },
  ref,
) {
  const [sessions, setSessions] = useState<AgentSession[]>(initialSessions || []);
  const [isLoading, setIsLoading] = useState(!initialSessions?.length);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

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
          const idx = prev.findIndex((s) => (s.session_id || (s as any).id) === sessionId);
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
          const idx = prev.findIndex((s) => (s.session_id || (s as any).id) === sessionId);
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
          (s.session_id || (s as any).id) === sessionId ? { ...s, title: trimmed } : s
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
        "flex flex-col h-full w-full min-h-0 bg-white dark:bg-[#070E1C] overflow-hidden",
        "border-r border-slate-200/80 dark:border-blue-500/12",
        className,
      )}
    >
      {/* Header section with New chat button */}
      <div className="p-2.5 sm:px-3 border-b border-slate-200/80 dark:border-blue-500/12 bg-white dark:bg-[#070E1C] flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onNewSession}
          className={cn(
            "flex-1 flex items-center justify-center gap-2",
            "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs",
            "px-3.5 py-2 rounded-xl transition-all duration-200 shadow-sm dark:shadow-none cursor-pointer",
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Đoạn chat mới</span>
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162644] transition-all duration-200 active:scale-95 flex-shrink-0 cursor-pointer"
            title="Thu gọn lịch sử hội thoại"
            aria-label="Thu gọn lịch sử hội thoại"
          >
            <Sidebar className="w-4.5 h-4.5" />
          </button>
        )}

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl border border-slate-200 dark:border-blue-500/15 hover:bg-slate-100 dark:hover:bg-[#162644] text-slate-500 dark:text-slate-400 transition-all duration-200 active:scale-95 flex-shrink-0 cursor-pointer"
            title="Đóng thanh bên"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Session Tab List */}
      <div className="flex-1 min-h-0 overflow-y-auto w-full p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-cyan-400" />
            <span className="text-xs font-medium">Đang tải lịch sử...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-2 border border-blue-100 dark:border-cyan-500/15">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Chưa có lịch sử hội thoại</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bấm &quot;Đoạn chat mới&quot; ở trên để bắt đầu hội thoại với AI Mentor</p>
          </div>
        ) : (
          sessions.map((session, idx) => {
            const sid = session.session_id || (session as any).id || `session-idx-${idx}`;
            const isActive = Boolean(activeSessionId && sid === activeSessionId);
            const isEditing = Boolean(sid && editingSessionId === sid);
            return (
              <div
                key={sid}
                onClick={() => !isEditing && sid && onSelectSession(sid)}
                className={cn(
                  "w-full text-left p-2.5 rounded-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-2.5 active:scale-[0.99] border",
                  isEditing
                    ? "bg-white dark:bg-[#0F1E35] border-blue-500 dark:border-cyan-400 ring-2 ring-blue-500/20 dark:ring-cyan-400/20"
                    : isActive
                    ? "bg-blue-50/80 dark:bg-[#0F1E35] border-blue-200 dark:border-cyan-500/30 shadow-xs text-blue-700 dark:text-cyan-400 font-bold"
                    : "bg-transparent border-transparent hover:bg-slate-100/70 dark:hover:bg-[#0F1E35]/60 hover:border-slate-200/60 dark:hover:border-blue-500/15 text-slate-700 dark:text-slate-300",
                )}
              >
                {/* Icon box + content info */}
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {/* Icon badge container */}
                  <span className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-0.5 border",
                    isActive
                      ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 border-transparent shadow-xs"
                      : "bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-cyan-400 border-blue-100 dark:border-cyan-500/15 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950"
                  )}>
                    <MessageSquare className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSubmit(sid);
                          if (e.key === "Escape") setEditingSessionId(null);
                        }}
                        onBlur={() => handleRenameSubmit(sid)}
                        maxLength={100}
                        className="w-full text-xs font-semibold bg-white dark:bg-[#0D192E] border border-blue-500 dark:border-cyan-400 rounded-lg px-2 py-1 outline-none text-slate-900 dark:text-slate-100 shadow-xs"
                        placeholder="Tên cuộc hội thoại..."
                      />
                    ) : (
                      <div
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(sid);
                          setRenameVal(session.title || "");
                        }}
                      >
                        <TruncatedTooltip
                          text={session.title || "Cuộc hội thoại chưa đặt tên"}
                          className={cn(
                            "text-xs font-semibold truncate transition-colors duration-200 leading-snug cursor-pointer",
                            isActive
                              ? "text-blue-700 dark:text-cyan-400"
                              : "text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400",
                          )}
                        />
                      </div>
                    )}

                    {/* Metadata line */}
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">
                        {session.last_active_at
                          ? new Date(session.last_active_at).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                              },
                            )
                          : "Mới tạo"}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="truncate font-medium text-xs">
                        {session.turn_count || 0} câu hỏi
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons: Rename + Delete */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0 transition-opacity duration-150">
                  {onRenameSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(sid);
                        setRenameVal(session.title || "");
                      }}
                      className="p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-[#162644] text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200 active:scale-90"
                      title="Đổi tên"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteSession && (
                    <>
                      {deletingSessionId === sid ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 p-1 rounded-lg animate-in fade-in duration-150"
                        >
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-300 px-1">Xóa?</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(sid);
                              setDeletingSessionId(null);
                            }}
                            className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold active:scale-95 transition-transform"
                          >
                            Có
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingSessionId(null);
                            }}
                            className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-bold active:scale-95 transition-transform"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingSessionId(sid);
                          }}
                          className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 active:scale-90"
                          title="Xóa cuộc hội thoại"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
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