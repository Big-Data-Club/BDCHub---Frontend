"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

export interface StudyAlert {
  user_id: number;
  course_id: number;
  node_id?: number | null;
  quiz_id?: number | null;
  alert_type: "concept_struggle" | "inactivity" | "recommendation" | "quiz_deadline" | "new_content";
  alert_message: string;
  detected_at: string;
}

interface NotificationContextType {
  alerts: StudyAlert[];
  unreadAlertsCount: number;
  unreadChatCount: number;
  isLoading: boolean;
  fetchAlerts: () => Promise<void>;
  markAlertAsRead: (alert: StudyAlert) => void;
  resetChatCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [alerts, setAlerts] = useState<StudyAlert[]>([]);
  const [readAlertKeys, setReadAlertKeys] = useState<Set<string>>(new Set());
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const wsRef = useRef<WebSocket | null>(null);

  // Load initial states from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedChat = localStorage.getItem("unread_chat_messages_count");
      if (storedChat) {
        setUnreadChatCount(Number(storedChat));
      }
      const storedReadKeys = localStorage.getItem("read_notification_keys");
      if (storedReadKeys) {
        try {
          const parsed = JSON.parse(storedReadKeys);
          if (Array.isArray(parsed)) {
            setReadAlertKeys(new Set(parsed));
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Listen to pathname changes: if user goes to /chat, clear the unread count
  useEffect(() => {
    if (pathname === "/chat") {
      setUnreadChatCount(0);
      localStorage.setItem("unread_chat_messages_count", "0");
    }
  }, [pathname]);

  const fetchAlerts = async () => {
    if (status !== "authenticated" || document.visibilityState === "hidden") return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/agents/notifications");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data = await res.json();
      const fetchedAlerts: StudyAlert[] = Array.isArray(data) ? data : (data.alerts || []);
      
      setAlerts((prev) => {
        // Compare to identify new alerts to trigger real-time toast
        const prevKeys = new Set(prev.map(a => `${a.alert_type}:${a.course_id}:${a.node_id ?? ""}:${a.quiz_id ?? ""}`));
        
        fetchedAlerts.forEach((alert) => {
          const key = `${alert.alert_type}:${alert.course_id}:${alert.node_id ?? ""}:${alert.quiz_id ?? ""}`;
          if (!prevKeys.has(key)) {
            // Trigger a beautiful, non-intrusive toast notification
            let iconStr = "🧠";
            let titleStr = "Cá nhân hóa học tập";
            if (alert.alert_type === "quiz_deadline") {
              iconStr = "⏰";
              titleStr = "Hạn chót làm bài";
            } else if (alert.alert_type === "new_content") {
              iconStr = "📖";
              titleStr = "Nội dung mới";
            } else if (alert.alert_type === "recommendation") {
              iconStr = "✨";
              titleStr = "Gợi ý khóa học";
            }

            toast.custom((t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <span className="text-xl">{iconStr}</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {titleStr}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {alert.alert_message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 focus:outline-none"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ), { duration: 6000 });
          }
        });
        
        return fetchedAlerts;
      });
    } catch (err) {
      console.error("[NotificationContext] fetchAlerts failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAlertAsRead = (alert: StudyAlert) => {
    const key = `${alert.alert_type}:${alert.course_id}:${alert.node_id ?? ""}:${alert.quiz_id ?? ""}`;
    setReadAlertKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      if (typeof window !== "undefined") {
        localStorage.setItem("read_notification_keys", JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  const resetChatCount = () => {
    setUnreadChatCount(0);
    localStorage.setItem("unread_chat_messages_count", "0");
  };

  const activeAlerts = alerts.filter(
    (alert) => !readAlertKeys.has(`${alert.alert_type}:${alert.course_id}:${alert.node_id ?? ""}:${alert.quiz_id ?? ""}`)
  );

  const unreadAlertsCount = activeAlerts.length;

  useEffect(() => {
    if (status === "authenticated") {
      fetchAlerts();
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          fetchAlerts();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Throttled poll: once every 3 minutes
      intervalRef.current = setInterval(fetchAlerts, 180000);

      return () => {
        clearInterval(intervalRef.current);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Background WebSocket listener for chat notifications
  useEffect(() => {
    if (status !== "authenticated" || !(session as any)?.accessToken) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const token = (session as any).accessToken;
    const WS_BASE_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL || "ws://localhost:8083/api/v1";
    const url = `${WS_BASE_URL}/chat/ws?token=${encodeURIComponent(token)}`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isUnmounted = false;

    const connectBgWs = () => {
      if (isUnmounted) return;
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        if (pathname === "/chat") return; // active in chat page, let useChat handle it

        const lines = (event.data as string).split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const wsEvent = JSON.parse(line);
            if (wsEvent.type === "message") {
              const p = wsEvent.payload;
              const currentUserId = session.user && (session.user as any).id;
              if (p && currentUserId && String(p.sender_id) !== String(currentUserId)) {
                setUnreadChatCount((prev) => {
                  const next = prev + 1;
                  localStorage.setItem("unread_chat_messages_count", String(next));
                  return next;
                });
              }
            }
          } catch {
            // ignore malformed
          }
        }
      };

      ws.onclose = () => {
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(connectBgWs, 5000);
        }
      };
      
      ws.onerror = () => {
        ws?.close();
      };
    };

    connectBgWs();

    return () => {
      isUnmounted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [status, session, pathname]);

  return (
    <NotificationContext.Provider
      value={{
        alerts: activeAlerts,
        unreadAlertsCount,
        unreadChatCount,
        isLoading,
        fetchAlerts,
        markAlertAsRead,
        resetChatCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
