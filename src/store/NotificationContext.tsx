"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "@/lib/tenant/navigation";
import toast from "react-hot-toast";
import { type StudyAlert, notificationKey, notificationToastKey, notificationTitle, notificationMessage, notificationHref } from "@/lib/notifications/model";
export type { StudyAlert } from "@/lib/notifications/model";

interface NotificationContextType {
  alerts: StudyAlert[];
  readAlertKeys: Set<string>;
  unreadAlertsCount: number;
  unreadChatCount: number;
  isLoading: boolean;
  error: string;
  fetchAlerts: () => Promise<void>;
  markAlertAsRead: (alert: StudyAlert) => void;
  markAllAlertsAsRead: () => void;
  resetChatCount: () => void;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const boundedKeys = (keys: Iterable<string>) => new Set([...keys].slice(-300));

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const userId = Number((session?.user as any)?.id ?? (session?.user as any)?.userId ?? 0);
  const pathname = usePathname();
  const router = useRouter();
  const [alerts, setAlerts] = useState<StudyAlert[]>([]);
  const [readAlertKeys, setReadAlertKeys] = useState<Set<string>>(new Set());
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const activeUser = useRef(0);
  const alertsRef = useRef<StudyAlert[]>([]);
  const readRef = useRef(new Set<string>());
  const loaded = useRef(false);
  const inFlight = useRef<AbortController | null>(null);
  const refreshPending = useRef(false);
  const fetchRef = useRef<() => Promise<void>>(async () => {});
  const pendingReads = useRef(new Set<string>());
  const storageKey = `read_notification_keys:${userId}`;

  const storeReadKeys = useCallback((keys: Iterable<string>) => {
    const next = boundedKeys(keys);
    readRef.current = next;
    setReadAlertKeys(next);
    try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* Memory-only when storage is unavailable. */ }
  }, [storageKey]);

  const flushReads = useCallback(async () => {
    const owner = userId;
    const keys = [...pendingReads.current].slice(0,50);
    if (!owner || keys.length === 0) return;
    try {
      const response = await fetch("/api/ai/agents/notifications", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keys }),
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok && activeUser.current === owner) {
        keys.forEach(key => pendingReads.current.delete(key));
        try { localStorage.setItem(`${storageKey}:pending`, JSON.stringify([...pendingReads.current])); } catch { /* Memory fallback. */ }
      }
    } catch { /* Retain the bounded queue; retry on next visibility/open event. */ }
  }, [userId, storageKey]);

  const markRead = useCallback((items: StudyAlert[]) => {
    const allKeys = items.map(notificationKey);
    if (allKeys.length === 0) return;
    storeReadKeys([...readRef.current, ...allKeys]);
    const keys = allKeys.filter(key => !key.startsWith("legacy:"));
    if (keys.length === 0) return;
    pendingReads.current = boundedKeys([...pendingReads.current, ...keys]);
    try { localStorage.setItem(`${storageKey}:pending`, JSON.stringify([...pendingReads.current])); } catch { /* Memory fallback. */ }
    void flushReads();
  }, [storeReadKeys, flushReads, storageKey]);

  const fetchAlerts = useCallback(async () => {
    if (status !== "authenticated" || !userId || activeUser.current !== userId || document.visibilityState === "hidden") return;
    if (inFlight.current) { refreshPending.current = true; return; }
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 4500);
    inFlight.current = controller;
    setIsLoading(true);
    void flushReads();
    try {
      const response = await fetch("/api/ai/agents/notifications", { cache: "no-store", signal: controller.signal });
      if (!response.ok) { if (activeUser.current === userId && (!controller.signal.aborted || timedOut)) setError("Chưa cập nhật được thông báo. Vui lòng thử lại."); return; }
      const data = await response.json();
      if (activeUser.current !== userId || controller.signal.aborted) return;
      setError("");
      const fetched: StudyAlert[] = Array.isArray(data.alerts) ? data.alerts : [];
      const merged = boundedKeys([...(data.read_keys || []).slice().reverse(), ...readRef.current]);
      storeReadKeys(merged);
      const previous = new Set(alertsRef.current.map(notificationToastKey));
      const latest = fetched.find(alert => !previous.has(notificationToastKey(alert)) && !merged.has(notificationKey(alert)));
      if (loaded.current && latest) {
        toast((t) => (
          <button type="button" className="text-left text-sm" onClick={() => { toast.dismiss(t.id); markRead([latest]); router.push(notificationHref(latest)); }}>
            <strong className="block">{notificationTitle(latest)}</strong>
            <span className="mt-1 block text-xs">{notificationMessage(latest)}</span>
          </button>
        ), { id: "learning-notification", duration: 5000, position: "bottom-left" });
      }
      loaded.current = true;
      alertsRef.current = fetched;
      setAlerts(fetched);
    } catch { if (activeUser.current === userId && (!controller.signal.aborted || timedOut)) setError("Chưa cập nhật được thông báo. Vui lòng thử lại."); }
    finally {
      clearTimeout(timeout);
      if (inFlight.current === controller) {
        inFlight.current = null; setIsLoading(false);
        if (refreshPending.current) { refreshPending.current = false; queueMicrotask(() => void fetchRef.current()); }
      }
    }
  }, [status, userId, flushReads, storeReadKeys, router, markRead]);
  useEffect(() => { fetchRef.current = fetchAlerts; }, [fetchAlerts]);

  useEffect(() => {
    activeUser.current = userId;
    inFlight.current?.abort(); inFlight.current = null; refreshPending.current = false;
    alertsRef.current = []; loaded.current = false; pendingReads.current = new Set();
    setAlerts([]); setIsLoading(false); setError("");
    let cached: string[] = [];
    try { const raw = JSON.parse(localStorage.getItem(storageKey) || "[]"); if (Array.isArray(raw)) cached = raw.filter(key => typeof key === "string"); } catch { /* No stored state. */ }
    readRef.current = boundedKeys(cached); setReadAlertKeys(readRef.current);
    try { const queue = JSON.parse(localStorage.getItem(`${storageKey}:pending`) || "[]"); if (Array.isArray(queue)) pendingReads.current = boundedKeys(queue.filter(key => typeof key === "string")); } catch { /* Memory fallback. */ }
    return () => { inFlight.current?.abort(); inFlight.current = null; };
  }, [userId, storageKey]);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;
    let stream: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let refresh: ReturnType<typeof setTimeout> | undefined;
    let backoff = 3000;
    let disposed = false;
    const scheduleRefresh = () => { clearTimeout(refresh); refresh = setTimeout(() => void fetchAlerts(), 400); };
    const connect = () => {
      if (disposed || document.visibilityState === "hidden") return;
      stream?.close();
      const connection = new EventSource("/api/ai/agents/notifications/stream");
      stream = connection;
      connection.onopen = () => { if (stream === connection) backoff = 3000; };
      connection.addEventListener("refresh", scheduleRefresh);
      connection.onerror = () => { connection.close(); if (!disposed && stream === connection) { retry = setTimeout(connect, backoff); backoff = Math.min(backoff * 2, 60000); } };
    };
    const resume = () => {
      clearTimeout(retry);
      if (document.visibilityState === "hidden") { stream?.close(); return; }
      void fetchAlerts(); connect();
    };
    resume();
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    window.addEventListener("learning-notifications:scope-changed", resume);
    return () => {
      disposed = true; stream?.close(); clearTimeout(retry); clearTimeout(refresh);
      document.removeEventListener("visibilitychange", resume); window.removeEventListener("online", resume);
      window.removeEventListener("learning-notifications:scope-changed", resume);
    };
  }, [status, userId, fetchAlerts]);

  const resetChatCount = useCallback(() => {
    setUnreadChatCount(0);
    try { localStorage.setItem("unread_chat_messages_count", "0"); } catch { /* Memory fallback. */ }
  }, []);
  useEffect(() => { if (pathname === "/chat" || pathname.startsWith("/chat/")) resetChatCount(); }, [pathname, resetChatCount]);
  useEffect(() => {
    const syncCount = () => { try { setUnreadChatCount(Number(localStorage.getItem("unread_chat_messages_count") || 0)); } catch { /* No stored state. */ } };
    syncCount(); window.addEventListener("unread-chat-change", syncCount);
    return () => window.removeEventListener("unread-chat-change", syncCount);
  }, []);

  return <NotificationContext.Provider value={{ alerts, readAlertKeys, unreadAlertsCount: alerts.filter(alert => !readAlertKeys.has(notificationKey(alert))).length,
    unreadChatCount, isLoading, error, fetchAlerts, markAlertAsRead: alert => markRead([alert]), markAllAlertsAsRead: () => markRead(alerts), resetChatCount }}>{children}</NotificationContext.Provider>;
};
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
};
