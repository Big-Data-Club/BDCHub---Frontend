"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export interface StudyAlert {
  user_id: number;
  course_id: number;
  node_id?: number | null;
  alert_type: "concept_struggle" | "inactivity";
  alert_message: string;
  detected_at: string;
}

interface NotificationContextType {
  alerts: StudyAlert[];
  unreadAlertsCount: number;
  isLoading: boolean;
  fetchAlerts: () => Promise<void>;
  markAlertAsRead: (alert: StudyAlert) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<StudyAlert[]>([]);
  const [readAlertKeys, setReadAlertKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchAlerts = async () => {
    if (status !== "authenticated" || document.visibilityState === "hidden") return;
    
    try {
      const res = await fetch("/api/ai/agents/notifications");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data = await res.json();
      const fetchedAlerts: StudyAlert[] = data.alerts || [];
      
      setAlerts((prev) => {
        // Compare to identify new alerts to trigger real-time toast
        const prevKeys = new Set(prev.map(a => `${a.alert_type}:${a.course_id}:${a.node_id ?? ""}`));
        
        fetchedAlerts.forEach((alert) => {
          const key = `${alert.alert_type}:${alert.course_id}:${alert.node_id ?? ""}`;
          if (!prevKeys.has(key)) {
            // Trigger a beautiful, non-intrusive toast notification
            toast.custom((t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <span className="text-xl">🧠</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Cá nhân hóa học tập
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
            ), { duration: 5000 });
          }
        });
        
        return fetchedAlerts;
      });
    } catch (err) {
      console.error("[NotificationContext] fetchAlerts failed:", err);
    }
  };

  const markAlertAsRead = (alert: StudyAlert) => {
    const key = `${alert.alert_type}:${alert.course_id}:${alert.node_id ?? ""}`;
    setReadAlertKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const activeAlerts = alerts.filter(
    (alert) => !readAlertKeys.has(`${alert.alert_type}:${alert.course_id}:${alert.node_id ?? ""}`)
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

  return (
    <NotificationContext.Provider
      value={{
        alerts: activeAlerts,
        unreadAlertsCount,
        isLoading,
        fetchAlerts,
        markAlertAsRead,
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
