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
import { ChatChannel, ChatMessage, WSEvent, WSMessagePayload, WSDeletePayload } from "@/types/chat";
import { listChannels, listMessages, sendMessageRest, getOrCreateDM } from "@/services/chatService";

// ─── Notification helpers ─────────────────────────────────────────────────────

/** Play a short "ting" chime using Web Audio API — no file/network needed. */
function playChatSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    // Pitch sweep: 880 Hz -> 660 Hz over 120 ms
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
    // Release AudioContext after the chime finishes
    osc.onended = () => ctx.close();
  } catch {
    // AudioContext blocked or unavailable — silently ignore
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

  sendMessage: (body: string) => Promise<void>;
  deleteMessage: (msgId: number) => void;

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
  // Used to filter out own messages from notifications
  const currentUserId  = (session as any)?.user?.id  as string | undefined;
  const currentEmail   = (session as any)?.user?.email as string | undefined;

  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [activeChannelId, setActiveChannelIdRaw] = useState<number | null>(null);
  const [messagesByChannel, setMessagesByChannel] = useState<Record<number, ChatMessage[]>>({});
  const [cursorByChannel, setCursorByChannel] = useState<Record<number, number>>({});
  const [hasMoreByChannel, setHasMoreByChannel] = useState<Record<number, boolean>>({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [isConnected, setIsConnected] = useState(false);

  // Total unread across all channels (drives tab title)
  const totalUnreadRef = useRef(0);

  // WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(RECONNECT_INITIAL_DELAY);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);

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

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (event) => {
      // Server may batch multiple newline-separated events in one frame
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
      reconnectDelay.current = Math.min(
        reconnectDelay.current * 2,
        RECONNECT_MAX_DELAY
      );
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
          createdAt: event.ts,
        };

        setMessagesByChannel((prev) => ({
          ...prev,
          [channelId]: [...(prev[channelId] ?? []), newMsg],
        }));

        // Increment unread if not the active channel
        setActiveChannelIdRaw((active) => {
          if (active !== channelId) {
            setUnreadCounts((counts) => {
              const next = { ...counts, [channelId]: (counts[channelId] ?? 0) + 1 };
              // Recompute total for tab title
              totalUnreadRef.current = Object.values(next).reduce((s, n) => s + n, 0);
              return next;
            });

            // Notify only when:
            //  1. Tab is not visible (user is away)
            //  2. Message is NOT from the current user
            const isOwnMsg =
              currentUserId  ? String(p.sender_id) === currentUserId
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
        document.title = DEFAULT_TITLE;
        // Also clear all unread counts when user focuses the page
        setUnreadCounts((counts) => {
          const allZero: Record<number, number> = {};
          Object.keys(counts).forEach((k) => { allZero[Number(k)] = 0; });
          totalUnreadRef.current = 0;
          return allZero;
        });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // ── Active channel management ─────────────────────────────────────────────────
  const setActiveChannelId = useCallback(
    (id: number) => {
      setActiveChannelIdRaw(id);
      // Clear unread badge for this channel and update tab title
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

      // Load history if not yet loaded
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
    async (body: string) => {
      if (!activeChannelId || !body.trim()) return;

      // Prefer WebSocket — fall back to REST if WS not connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "message", channel_id: activeChannelId, body: body.trim() })
        );
      } else {
        // REST fallback — message will arrive via WS event from server
        await sendMessageRest(activeChannelId, body.trim());
      }
    },
    [activeChannelId]
  );

  // ── Delete message (WS only) ──────────────────────────────────────────────────
  const deleteMessage = useCallback((msgId: number) => {
    if (!activeChannelId) return;
    // Optimistically update UI — server will broadcast delete event
    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannelId]: (prev[activeChannelId] ?? []).map((m) =>
        m.id === msgId ? { ...m, isDeleted: true, body: "[deleted]" } : m
      ),
    }));
    // REST delete (WS doesn't have a delete frame from client)
    import("@/services/chatService").then(({ deleteMessage: del }) =>
      del(activeChannelId, msgId)
    );
  }, [activeChannelId]);

  // Auto-select DM channel if userId parameter is present
  useEffect(() => {
    if (!token || channelsLoading) return;
    const userIdStr = searchParams.get("userId");
    if (!userIdStr) return;

    const targetUserId = parseInt(userIdStr, 10);
    if (isNaN(targetUserId)) return;

    // Check if we already have a DM channel with this user
    const existingDm = channels.find(
      (c) => c.isDm && c.dmUser?.id === targetUserId
    );

    if (existingDm) {
      setActiveChannelId(existingDm.id);
      // Clean up the URL query parameter
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("userId");
      const cleanUrl = `/chat${newParams.toString() ? `?${newParams.toString()}` : ""}`;
      router.replace(cleanUrl);
    } else {
      // Create new DM
      setMessagesLoading(true);
      getOrCreateDM(targetUserId)
        .then((channel) => {
          addChannel(channel);
          setActiveChannelId(channel.id);
          // Clean up search param
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
