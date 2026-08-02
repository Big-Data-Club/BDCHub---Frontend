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
        "flex flex-col h-full w-full min-h-0 bg-white dark:bg-[#070E1C] overflow-hidden",
        "border-r border-slate-200/80 dark:border-blue-500/10",
        className,
      )}
    >
      {/* Header section with category title & New chat button */}
      <div className="p-4 border-b border-slate-200/80 dark:border-blue-500/10 bg-slate-50/40 dark:bg-[#070E1C]/60 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Lịch sử trò chuyện
            </span>
            {sessions.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200/60 dark:bg-blue-900/30 text-slate-700 dark:text-cyan-400 border border-slate-300/40 dark:border-blue-500/15">
                {sessions.length}
              </span>
            )}
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-blue-500/10 hover:bg-slate-100 dark:hover:bg-[#162644] text-slate-500 dark:text-slate-400 transition-all duration-200 active:scale-95 flex-shrink-0"
              title="Đóng thanh bên"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={onNewSession}
          className={cn(
            "w-full flex items-center justify-center gap-2.5",
            "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs",
            "px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm dark:shadow-none cursor-pointer",
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Đoạn chat mới</span>
        </button>
      </div>

      {/* Session Tab List - Autofill height with min-h-0 and flex-1 */}
      <div className="flex-1 min-h-0 overflow-y-auto w-full p-2.5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-cyan-400" />
            <span className="text-xs font-medium">Đang tải lịch sử...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center p-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0D192E] flex items-center justify-center text-slate-400 mb-2">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Chưa có lịch sử hội thoại</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Bắt đầu trò chuyện mới với AI Mentor ngay</p>
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
                  "w-full text-left p-2.5 rounded-xl transition-all duration-200 cursor-pointer group flex items-center justify-between gap-2.5 active:scale-[0.99] border",
                  isEditing
                    ? "bg-white dark:bg-[#0F1E35] border-blue-500 ring-2 ring-blue-500/20"
                    : isActive
                    ? "bg-blue-50/80 dark:bg-[#0F1E35] border-blue-200/80 dark:border-blue-500/20 shadow-xs text-blue-700 dark:text-cyan-400 font-bold"
                    : "bg-transparent border-transparent hover:bg-slate-100/60 dark:hover:bg-[#0F1E35]/30 hover:border-slate-200/50 dark:hover:border-blue-500/10 text-slate-700 dark:text-slate-300",
                )}
              >
                {/* Icon box + content info */}
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {/* Icon badge container matching Course Workspace SidebarSection */}
                  <span className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150 mt-0.5",
                    isActive
                      ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs"
                      : "bg-blue-50/60 dark:bg-blue-950/30 text-blue-600 dark:text-cyan-400 group-hover:bg-blue-100/80 dark:group-hover:bg-blue-900/40"
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
                          if (e.key === "Enter") handleRenameSubmit(session.session_id);
                          if (e.key === "Escape") setEditingSessionId(null);
                        }}
                        onBlur={() => handleRenameSubmit(session.session_id)}
                        maxLength={100}
                        className="w-full text-xs font-semibold bg-white dark:bg-[#0D192E] border border-blue-500 rounded-lg px-2 py-1 outline-none text-slate-900 dark:text-slate-100 shadow-xs"
                        placeholder="Tên cuộc hội thoại..."
                      />
                    ) : (
                      <div
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.session_id);
                          setRenameVal(session.title || "");
                        }}
                      >
                        <TruncatedTooltip
                          text={session.title || "Cuộc hội thoại chưa đặt tên"}
                          className={cn(
                            "text-xs font-semibold truncate transition-colors duration-200 leading-snug cursor-pointer",
                            isActive
                              ? "text-blue-700 dark:text-cyan-400"
                              : "text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white",
                          )}
                        />
                      </div>
                    )}

                    {/* Metadata line */}
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
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
                      <span className="truncate font-medium text-[10.5px]">
                        {session.turn_count || 0} lượt gửi
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
                        setEditingSessionId(session.session_id);
                        setRenameVal(session.title || "");
                      }}
                      className="p-1 rounded-lg hover:bg-blue-100/80 dark:hover:bg-[#162644] text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200 active:scale-90"
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
                      className="p-1 rounded-lg hover:bg-red-100/80 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 active:scale-90"
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