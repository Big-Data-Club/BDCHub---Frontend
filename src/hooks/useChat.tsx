"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChatChannel,
  ChatMessage,
  WSEvent,
  WSMessagePayload,
  WSDeletePayload,
  WSEditPayload,
} from "@/types/chat";
import {
  listChannels,
  listMessages,
  sendMessageRest,
  getOrCreateDM,
} from "@/services/chatService";

// ─── Notification helpers ─────────────────────────────────────────────────────

/** Play a short "ting" chime using Web Audio API - no file/network needed. */
function playChatSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
    osc.onended = () => ctx.close();
  } catch {
    // AudioContext blocked or unavailable - silently ignore
  }
}

const DEFAULT_TITLE = "BDC Chat";

// ─── Context ──────────────────────────────────────────────────────────────────

interface ChatContextValue {
  channels: ChatChannel[];
  channelsLoading: boolean;

  activeChannelId: number | null;
  setActiveChannelId: (id: number) => void;

  messages: ChatMessage[];
  messagesLoading: boolean;
  hasMoreMessages: boolean;
  loadMoreMessages: () => Promise<void>;

  sendMessage: (body: string, parentId?: number | null) => Promise<void>;
  deleteMessage: (msgId: number) => void;
  editMessage: (msgId: number, newBody: string) => Promise<void>;

  unreadCounts: Record<number, number>;
  isConnected: boolean;
  refreshChannels: () => Promise<void>;
  addChannel: (channel: ChatChannel) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// ─── Constants ────────────────────────────────────────────────────────────────

const WS_BASE_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL || "ws://localhost:8083/api/v1";
const RECONNECT_INITIAL_DELAY = 1000;
const RECONNECT_MAX_DELAY = 30000;
const HISTORY_LIMIT = 50;

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const currentUserId = (session as any)?.user?.id as string | undefined;
  const currentEmail = (session as any)?.user?.email as string | undefined;

  const searchParams = useSearchParams();
  const router = useRouter();

  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [activeChannelId, setActiveChannelIdRaw] = useState<number | null>(null);
  const [messagesByChannel, setMessagesByChannel] = useState<Record<number, ChatMessage[]>>({});
  const [cursorByChannel, setCursorByChannel] = useState<Record<number, number>>({});
  const [hasMoreByChannel, setHasMoreByChannel] = useState<Record<number, boolean>>({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const activeChannelIdRef = useRef<number | null>(null);
  useEffect(() => {
    activeChannelIdRef.current = activeChannelId;
  }, [activeChannelId]);

  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chat_unread_counts");
      if (stored) {
        try { return JSON.parse(stored); } catch { return {}; }
      }
    }
    return {};
  });

  // Debounced localStorage sync: batches rapid successive updates (e.g. burst
  // of incoming messages) into a single write + event dispatch after 200ms.
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        localStorage.setItem("chat_unread_counts", JSON.stringify(unreadCounts));
        const total = Object.values(unreadCounts).reduce((s, n) => s + n, 0);
        localStorage.setItem("unread_chat_messages_count", String(total));
        window.dispatchEvent(new Event("unread-chat-change"));
      }, 200);
    }
  }, [unreadCounts]);

  const totalUnreadRef = useRef(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(RECONNECT_INITIAL_DELAY);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load channels ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setChannelsLoading(true);
    listChannels()
      .then(setChannels)
      .catch(() => setChannels([]))
      .finally(() => setChannelsLoading(false));
  }, [token]);

  const refreshChannels = useCallback(async () => {
    if (!token) return;
    try {
      const list = await listChannels();
      setChannels(list);
    } catch (err) {
      console.error("Refresh channels error:", err);
    }
  }, [token]);

  const addChannel = useCallback((channel: ChatChannel) => {
    setChannels((prev) => {
      if (prev.some((c) => c.id === channel.id)) return prev;
      return [...prev, channel];
    });
  }, []);

  // ── WebSocket lifecycle ───────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!token || unmounted.current) return;

    const url = `${WS_BASE_URL}/chat/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectDelay.current = RECONNECT_INITIAL_DELAY;
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (!unmounted.current) scheduleReconnect();
    };

    ws.onerror = () => { ws.close(); };

    ws.onmessage = (event) => {
      const lines = (event.data as string).split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const wsEvent: WSEvent = JSON.parse(line);
          handleWsEvent(wsEvent);
        } catch {
          // ignore malformed frames
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    reconnectTimer.current = setTimeout(() => {
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, RECONNECT_MAX_DELAY);
      connect();
    }, reconnectDelay.current);
  }, [connect]);

  useEffect(() => {
    unmounted.current = false;
    if (token) connect();
    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [token, connect]);

  // ── Handle incoming WS events ─────────────────────────────────────────────────
  const handleWsEvent = useCallback((event: WSEvent) => {
    const channelId = event.channel_id;

    switch (event.type) {
      case "message": {
        const p = event.payload as WSMessagePayload;
        const newMsg: ChatMessage = {
          id: p.id,
          channelId,
          senderId: p.sender_id,
          senderName: p.sender_name,
          senderEmail: "",
          senderAvatar: p.sender_avatar ?? "",
          body: p.body,
          isDeleted: false,
          isEdited: p.is_edited ?? false,
          parentId: p.parent_id ?? null,
          parentSenderName: p.parent_sender_name ?? "",
          parentBody: p.parent_body ?? "",
          createdAt: event.ts,
        };

        setMessagesByChannel((prev) => {
          const existing = prev[channelId] ?? [];
          const idx = existing.findIndex((m) => m.id === p.id);
          if (idx >= 0) {
            // Update in-place (de-duplicate optimistic inserts)
            const updated = [...existing];
            updated[idx] = { ...updated[idx], ...newMsg };
            return { ...prev, [channelId]: updated };
          }
          return { ...prev, [channelId]: [...existing, newMsg] };
        });

        setActiveChannelIdRaw((active) => {
          if (active !== channelId) {
            setUnreadCounts((counts) => {
              const next = { ...counts, [channelId]: (counts[channelId] ?? 0) + 1 };
              totalUnreadRef.current = Object.values(next).reduce((s, n) => s + n, 0);
              return next;
            });

            const isOwnMsg =
              currentUserId ? String(p.sender_id) === currentUserId
              : currentEmail ? p.sender_name === currentEmail
              : false;

            if (document.hidden && !isOwnMsg) {
              playChatSound();
              document.title = `(${totalUnreadRef.current}) ${DEFAULT_TITLE}`;
            }
          }
          return active;
        });
        break;
      }

      case "edit": {
        const p = event.payload as WSEditPayload;
        setMessagesByChannel((prev) => ({
          ...prev,
          [channelId]: (prev[channelId] ?? []).map((m) =>
            m.id === p.id ? { ...m, body: p.body, isEdited: true } : m
          ),
        }));
        break;
      }

      case "delete": {
        const p = event.payload as WSDeletePayload;
        setMessagesByChannel((prev) => ({
          ...prev,
          [channelId]: (prev[channelId] ?? []).map((m) =>
            m.id === p.id ? { ...m, isDeleted: true, body: "[deleted]" } : m
          ),
        }));
        break;
      }

      default:
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, currentEmail]);

  // ── Page-visibility listener: reset title when user returns to tab ───────────
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) {
        const active = activeChannelIdRef.current;
        if (active !== null) {
          setUnreadCounts((counts) => {
            const next = { ...counts, [active]: 0 };
            totalUnreadRef.current = Object.values(next).reduce((s, n) => s + n, 0);
            if (totalUnreadRef.current === 0) {
              document.title = DEFAULT_TITLE;
            } else {
              document.title = `(${totalUnreadRef.current}) ${DEFAULT_TITLE}`;
            }
            return next;
          });
        }
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // ── Active channel management ─────────────────────────────────────────────────
  const setActiveChannelId = useCallback(
    (id: number) => {
      setActiveChannelIdRaw(id);
      setUnreadCounts((u) => {
        const next = { ...u, [id]: 0 };
        totalUnreadRef.current = Object.values(next).reduce((s, n) => s + n, 0);
        if (totalUnreadRef.current === 0) {
          document.title = DEFAULT_TITLE;
        } else {
          document.title = `(${totalUnreadRef.current}) ${DEFAULT_TITLE}`;
        }
        return next;
      });

      if (!messagesByChannel[id]) {
        setMessagesLoading(true);
        listMessages(id, undefined, HISTORY_LIMIT)
          .then((res) => {
            setMessagesByChannel((prev) => ({ ...prev, [id]: res.messages }));
            setCursorByChannel((prev) => ({ ...prev, [id]: res.nextCursor }));
            setHasMoreByChannel((prev) => ({ ...prev, [id]: res.hasMore }));
          })
          .catch(() => {})
          .finally(() => setMessagesLoading(false));
      }
    },
    [messagesByChannel]
  );

  // ── Load more (older) messages ────────────────────────────────────────────────
  const loadMoreMessages = useCallback(async () => {
    if (!activeChannelId) return;
    const cursor = cursorByChannel[activeChannelId];
    if (!cursor) return;

    setMessagesLoading(true);
    try {
      const res = await listMessages(activeChannelId, cursor, HISTORY_LIMIT);
      setMessagesByChannel((prev) => ({
        ...prev,
        [activeChannelId]: [...res.messages, ...(prev[activeChannelId] ?? [])],
      }));
      setCursorByChannel((prev) => ({ ...prev, [activeChannelId]: res.nextCursor }));
      setHasMoreByChannel((prev) => ({ ...prev, [activeChannelId]: res.hasMore }));
    } catch {
      // silently ignore
    } finally {
      setMessagesLoading(false);
    }
  }, [activeChannelId, cursorByChannel]);

  // ── Send message ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (body: string, parentId?: number | null) => {
      if (!activeChannelId || !body.trim()) return;

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "message",
            channel_id: activeChannelId,
            body: body.trim(),
            parent_id: parentId ?? null,
          })
        );
      } else {
        // REST fallback
        const msg = await sendMessageRest(activeChannelId, body.trim(), parentId);
        setMessagesByChannel((prev) => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] ?? []), msg],
        }));
      }
    },
    [activeChannelId]
  );

  // ── Delete message ────────────────────────────────────────────────────────────
  const deleteMessage = useCallback((msgId: number) => {
    if (!activeChannelId) return;
    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannelId]: (prev[activeChannelId] ?? []).map((m) =>
        m.id === msgId ? { ...m, isDeleted: true, body: "[deleted]" } : m
      ),
    }));
    import("@/services/chatService").then(({ deleteMessage: del }) =>
      del(activeChannelId, msgId)
    );
  }, [activeChannelId]);

  // ── Edit message ──────────────────────────────────────────────────────────────
  const editMessage = useCallback(
    async (msgId: number, newBody: string) => {
      if (!activeChannelId) return;
      // Optimistic update
      setMessagesByChannel((prev) => ({
        ...prev,
        [activeChannelId]: (prev[activeChannelId] ?? []).map((m) =>
          m.id === msgId ? { ...m, body: newBody, isEdited: true } : m
        ),
      }));
      try {
        await import("@/services/chatService").then(({ editMessage: edit }) =>
          edit(activeChannelId, msgId, newBody)
        );
      } catch (err) {
        console.error("editMessage failed:", err);
      }
    },
    [activeChannelId]
  );

  // Auto-select DM channel if userId parameter is present
  useEffect(() => {
    if (!token || channelsLoading) return;
    const userIdStr = searchParams.get("userId");
    if (!userIdStr) return;

    const targetUserId = parseInt(userIdStr, 10);
    if (isNaN(targetUserId)) return;

    const existingDm = channels.find(
      (c) => c.isDm && c.dmUser?.id === targetUserId
    );

    if (existingDm) {
      setActiveChannelId(existingDm.id);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("userId");
      const cleanUrl = `/chat${newParams.toString() ? `?${newParams.toString()}` : ""}`;
      router.replace(cleanUrl);
    } else {
      setMessagesLoading(true);
      getOrCreateDM(targetUserId)
        .then((channel) => {
          addChannel(channel);
          setActiveChannelId(channel.id);
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.delete("userId");
          const cleanUrl = `/chat${newParams.toString() ? `?${newParams.toString()}` : ""}`;
          router.replace(cleanUrl);
        })
        .catch((err) => {
          console.error("Failed to auto-create DM channel:", err);
        })
        .finally(() => {
          setMessagesLoading(false);
        });
    }
  }, [token, channelsLoading, searchParams, channels, addChannel, setActiveChannelId, router]);

  // ── Computed values ───────────────────────────────────────────────────────────
  const messages = activeChannelId ? (messagesByChannel[activeChannelId] ?? []) : [];
  const hasMoreMessages = activeChannelId ? (hasMoreByChannel[activeChannelId] ?? false) : false;

  return (
    <ChatContext.Provider
      value={{
        channels,
        channelsLoading,
        activeChannelId,
        setActiveChannelId,
        messages,
        messagesLoading,
        hasMoreMessages,
        loadMoreMessages,
        sendMessage,
        deleteMessage,
        editMessage,
        unreadCounts,
        isConnected,
        refreshChannels,
        addChannel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// ─── Consumer hook ────────────────────────────────────────────────────────────

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within <ChatProvider>");
  return ctx;
}
