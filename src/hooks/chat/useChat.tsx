"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import type { ChatChannel, ChatMessage, WSEvent, WSMessagePayload, WSEditPayload, WSDeletePayload } from "@/types/chat/chat";
import type { ChatConnectionState, ChatPreferences } from "@/types/chat/preferences";
import { listChannels, listMessages, sendMessageRest, sendAttachments as uploadAttachments,
  deleteMessage as removeMessage, editMessage as updateMessage, getOrCreateDM } from "@/services/chat/chatService";
import { mergeMessages, chatWebSocketUrl } from "@/utils/chat/messages";
import { useChatPreferences } from "./useChatPreferences";

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
  sendAttachments: (files: File[], body: string, parentId?: number | null) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
  editMessage: (id: number, body: string) => Promise<void>;
  unreadCounts: Record<number, number>;
  isConnected: boolean;
  connectionState: ChatConnectionState;
  refreshChannels: () => Promise<void>;
  addChannel: (channel: ChatChannel) => void;
  reconnect: () => void;
  error: string | null;
  clearError: () => void;
  showSidebar: boolean;
  openSidebar: () => void;
  preferences: ChatPreferences;
  updatePreferences: (patch: Partial<ChatPreferences>) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);
const HISTORY_LIMIT = 50;

function playChatSound() {
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.frequency.setValueAtTime(880, audio.currentTime);
    gain.gain.setValueAtTime(.1, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .15);
    oscillator.start(); oscillator.stop(audio.currentTime + .15);
    oscillator.onended = () => { void audio.close(); };
  } catch { /* Browsers may require user interaction before playing audio. */ }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const identity = session as unknown as { accessToken?: string; user?: { id?: string | number } } | null;
  const token = identity?.accessToken;
  const userId = identity?.user?.id == null ? undefined : String(identity.user.id);
  const { preferences, updatePreferences } = useChatPreferences(userId);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [activeChannelId, setActiveChannelIdRaw] = useState<number | null>(null);
  const [cache, setCache] = useState<Record<number, ChatMessage[]>>({});
  const [cursors, setCursors] = useState<Record<number, number>>({});
  const [hasMore, setHasMore] = useState<Record<number, boolean>>({});
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [unreadIdentity, setUnreadIdentity] = useState<string>();
  const [connectionState, setConnectionState] = useState<ChatConnectionState>("connecting");
  const [connectionEpoch, setConnectionEpoch] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef<number | null>(null);
  const accountEpoch = useRef(0);
  const loaded = useRef(new Set<number>());
  const inFlight = useRef(new Set<number>());
  const seenEvents = useRef(new Set<string>());
  const wsRef = useRef<WebSocket | null>(null);
  const eventHandler = useRef<(events: WSEvent[]) => void>(() => {});

  useEffect(() => {
    accountEpoch.current++;
    activeRef.current = null;
    loaded.current.clear(); inFlight.current.clear(); seenEvents.current.clear();
    setChannels([]); setCache({}); setCursors({}); setHasMore({}); setLoadingIds(new Set());
    setActiveChannelIdRaw(null); setShowSidebar(true); setError(null);
    let counts: Record<number, number> = {};
    try {
      const stored = JSON.parse(localStorage.getItem(`bdc.chat.unread:${userId}`) || "{}");
      counts = Object.fromEntries(Object.entries(stored).filter(([id, count]) =>
        Number(id) > 0 && typeof count === "number" && Number.isFinite(count) && count >= 0)) as Record<number, number>;
    } catch { /* optional storage */ }
    setUnreadCounts(counts); setUnreadIdentity(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId || userId !== unreadIdentity) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(`bdc.chat.unread:${userId}`, JSON.stringify(unreadCounts));
        const total = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
        localStorage.setItem("unread_chat_messages_count", String(total));
        window.dispatchEvent(new Event("unread-chat-change"));
      } catch { /* optional storage */ }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [unreadCounts, userId, unreadIdentity]);

  const refreshChannels = useCallback(async () => {
    if (!token) { setChannelsLoading(false); return; }
    const epoch = accountEpoch.current;
    try {
      const next = await listChannels();
      if (epoch !== accountEpoch.current) return;
      setChannels(next);
      const accessible = new Set(next.map((channel) => channel.id));
      setCache((previous) => Object.fromEntries(Object.entries(previous).filter(([id]) => accessible.has(Number(id)))));
      for (const id of loaded.current) if (!accessible.has(id)) loaded.current.delete(id);
      if (activeRef.current && !accessible.has(activeRef.current)) {
        activeRef.current = null; setActiveChannelIdRaw(null); setShowSidebar(true);
      }
    } catch { if (epoch === accountEpoch.current) setError("Không thể tải kênh chat. Hãy thử tải lại."); }
    finally { if (epoch === accountEpoch.current) setChannelsLoading(false); }
  }, [token]);

  const loadHistory = useCallback(async (id: number, reset = false, beforeId?: number) => {
    if (inFlight.current.has(id)) return;
    const epoch = accountEpoch.current;
    inFlight.current.add(id); setLoadingIds((previous) => new Set(previous).add(id));
    try {
      const page = await listMessages(id, beforeId, HISTORY_LIMIT);
      if (epoch !== accountEpoch.current) return;
      setCache((previous) => ({ ...previous, [id]: reset ? page.messages : mergeMessages(page.messages, previous[id] || []) }));
      loaded.current.add(id);
      setCursors((previous) => ({ ...previous, [id]: page.nextCursor }));
      // The browser retains a bounded history window; older pages remain on the server.
      setHasMore((previous) => ({ ...previous, [id]: page.hasMore && (!beforeId || (cache[id]?.length || 0) + page.messages.length < 500) }));
    } catch { if (epoch === accountEpoch.current) setError("Không thể tải tin nhắn. Bạn có thể thử lại."); }
    finally {
      if (epoch === accountEpoch.current) {
        inFlight.current.delete(id);
        setLoadingIds((previous) => { const next = new Set(previous); next.delete(id); return next; });
      }
    }
  }, [cache]);
  const loadHistoryRef = useRef(loadHistory);
  useEffect(() => { loadHistoryRef.current = loadHistory; }, [loadHistory]);

  const setActiveChannelId = useCallback((id: number) => {
    activeRef.current = id; setActiveChannelIdRaw(id); setShowSidebar(false); setError(null);
    setUnreadCounts((previous) => ({ ...previous, [id]: 0 }));
    if (!loaded.current.has(id)) void loadHistoryRef.current(id);
  }, []);
  const reconnect = useCallback(() => setConnectionEpoch((value) => value + 1), []);
  const addChannel = useCallback((channel: ChatChannel) => {
    setChannels((previous) => previous.some((entry) => entry.id === channel.id) ? previous : [...previous, channel]);
    reconnect(); // Subscription membership is resolved by the server during upgrade.
  }, [reconnect]);

  useEffect(() => {
    eventHandler.current = (events) => {
      const updates: Record<number, ChatMessage[]> = {};
      const mutations: WSEvent[] = [];
      const unread: Record<number, number> = {};
      let notify = false;
      for (const event of events) {
        const id = event.channel_id;
        if (!Number.isSafeInteger(id) || id <= 0) continue;
        if (event.type === "message") {
          const payload = event.payload as WSMessagePayload;
          if (!payload || !Number.isSafeInteger(payload.id)) continue;
          const eventId = `${id}:${payload.id}`;
          if (seenEvents.current.has(eventId)) continue;
          seenEvents.current.add(eventId);
          if (seenEvents.current.size > 2000) seenEvents.current.delete(seenEvents.current.values().next().value!);
          if (loaded.current.has(id) || activeRef.current === id) {
            (updates[id] ||= []).push({
              id: payload.id, channelId: id, senderId: payload.sender_id,
              senderName: payload.sender_name, senderEmail: "", senderAvatar: payload.sender_avatar || "",
              body: payload.body, isDeleted: false, isEdited: payload.is_edited || false,
              parentId: payload.parent_id, parentSenderName: payload.parent_sender_name,
              parentBody: payload.parent_body, createdAt: event.ts,
              attachments: (payload.attachments || []).map((attachment) => ({ id: attachment.id,
                fileName: attachment.file_name, mimeType: attachment.mime_type,
                sizeBytes: attachment.size_bytes, createdAt: attachment.created_at })),
            });
          }
          if (String(payload.sender_id) !== userId && (activeRef.current !== id || document.hidden)) {
            unread[id] = (unread[id] || 0) + 1; notify = true;
          }
        } else if (event.type === "edit" || event.type === "delete") mutations.push(event);
      }
      if (Object.keys(updates).length || mutations.length) setCache((previous) => {
        const next = { ...previous };
        for (const [id, incoming] of Object.entries(updates)) next[Number(id)] = mergeMessages(next[Number(id)] || [], incoming);
        for (const event of mutations) {
          const payload = event.payload as WSEditPayload | WSDeletePayload;
          if (!payload || !next[event.channel_id]) continue;
          next[event.channel_id] = next[event.channel_id].map((message) => message.id !== payload.id ? message
            : event.type === "delete" ? { ...message, body: "[deleted]", isDeleted: true }
            : { ...message, body: (payload as WSEditPayload).body, isEdited: true });
        }
        return next;
      });
      if (Object.keys(unread).length) setUnreadCounts((previous) => {
        const next = { ...previous };
        for (const [id, count] of Object.entries(unread)) next[Number(id)] = (next[Number(id)] || 0) + count;
        return next;
      });
      if (notify && document.hidden && preferences.sound) playChatSound();
    };
  }, [userId, preferences.sound]);

  useEffect(() => {
    let disposed = false;
    let delay = 1000;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame: number | undefined;
    let pending: WSEvent[] = [];
    const flush = () => { frame = undefined; const batch = pending; pending = []; eventHandler.current(batch); };
    const connect = () => {
      if (disposed || !token) return;
      setConnectionState(delay === 1000 ? "connecting" : "reconnecting");
      const socket = new WebSocket(chatWebSocketUrl(window.location.origin, token, process.env.NEXT_PUBLIC_CHAT_WS_URL));
      wsRef.current = socket;
      socket.onopen = () => {
        if (disposed) { socket.close(); return; }
        setConnectionState("connected"); delay = 1000;
        void refreshChannels().then(() => { if (!disposed && activeRef.current) void loadHistoryRef.current(activeRef.current, true); });
      };
      socket.onclose = () => {
        if (disposed) return;
        setConnectionState("reconnecting");
        timer = setTimeout(connect, delay * (.8 + Math.random() * .4));
        delay = Math.min(delay * 2, 30000);
      };
      socket.onerror = () => socket.close();
      socket.onmessage = (event: MessageEvent) => {
        if (typeof event.data !== "string") return;
        for (const line of event.data.split("\n")) {
          try { pending.push(JSON.parse(line) as WSEvent); } catch { /* malformed frame */ }
        }
        if (pending.length > 1000) { pending = []; socket.close(); return; }
        // A short batch also works in background tabs where animation frames pause.
        if (frame === undefined) frame = window.setTimeout(flush, 16);
      };
    };
    void refreshChannels();
    if (token) connect(); else setConnectionState("offline");
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      if (frame !== undefined) clearTimeout(frame);
      wsRef.current?.close(); wsRef.current = null;
    };
  }, [token, refreshChannels, connectionEpoch]);

  useEffect(() => {
    const markRead = () => { if (!document.hidden && activeRef.current) setUnreadCounts((previous) => ({ ...previous, [activeRef.current!]: 0 })); };
    document.addEventListener("visibilitychange", markRead);
    return () => document.removeEventListener("visibilitychange", markRead);
  }, []);

  const sendMessage = useCallback(async (body: string, parentId?: number | null) => {
    const id = activeRef.current;
    if (!id || !body.trim()) return;
    // HTTP acknowledges persistence; WebSocket is delivery, not a send receipt.
    const message = await sendMessageRest(id, body.trim(), parentId);
    setCache((previous) => ({ ...previous, [id]: mergeMessages(previous[id] || [], [message]) }));
  }, []);
  const sendAttachments = useCallback(async (files: File[], body: string, parentId?: number | null) => {
    const id = activeRef.current; if (!id) return;
    const message = await uploadAttachments(id, files, body, parentId);
    setCache((previous) => ({ ...previous, [id]: mergeMessages(previous[id] || [], [message]) }));
  }, []);
  const deleteMessage = useCallback(async (messageId: number) => {
    const id = activeRef.current; if (!id) return;
    try {
      await removeMessage(id, messageId);
      setCache((previous) => ({ ...previous, [id]: (previous[id] || []).map((message) => message.id === messageId ? { ...message, body: "[deleted]", isDeleted: true } : message) }));
    } catch { setError("Chưa xóa được tin nhắn. Hãy thử lại."); }
  }, []);
  const editMessage = useCallback(async (messageId: number, body: string) => {
    const id = activeRef.current; if (!id) return;
    const message = await updateMessage(id, messageId, body);
    setCache((previous) => ({ ...previous, [id]: mergeMessages(previous[id] || [], [message]) }));
  }, []);
  const loadMoreMessages = useCallback(async () => {
    if (activeChannelId && hasMore[activeChannelId]) await loadHistory(activeChannelId, false, cursors[activeChannelId]);
  }, [activeChannelId, hasMore, cursors, loadHistory]);

  const dmTarget = searchParams.get("userId");
  const requestedDm = useRef<string | null>(null);
  useEffect(() => {
    if (!token || channelsLoading || !dmTarget || requestedDm.current === dmTarget) return;
    const target = Number(dmTarget);
    if (!Number.isSafeInteger(target) || target <= 0) return;
    requestedDm.current = dmTarget;
    const existing = channels.find((channel) => channel.isDm && channel.dmUser?.id === target);
    const open = async () => {
      try {
        const channel = existing || await getOrCreateDM(target);
        if (!existing) addChannel(channel);
        setActiveChannelId(channel.id);
        const params = new URLSearchParams(searchParams.toString()); params.delete("userId");
        router.replace(`/chat${params.size ? `?${params}` : ""}`);
      } catch { requestedDm.current = null; setError("Không thể mở cuộc trò chuyện này."); }
    };
    void open();
  }, [dmTarget, token, channelsLoading, channels, addChannel, setActiveChannelId, searchParams, router]);

  return <ChatContext.Provider value={{ channels, channelsLoading, activeChannelId, setActiveChannelId,
    messages: activeChannelId ? cache[activeChannelId] || [] : [],
    messagesLoading: !!activeChannelId && loadingIds.has(activeChannelId),
    hasMoreMessages: !!activeChannelId && !!hasMore[activeChannelId], loadMoreMessages,
    sendMessage, sendAttachments, deleteMessage, editMessage, unreadCounts,
    isConnected: connectionState === "connected", connectionState, refreshChannels, addChannel, reconnect,
    error, clearError: () => setError(null), showSidebar, openSidebar: () => setShowSidebar(true),
    preferences, updatePreferences }}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within <ChatProvider>");
  return context;
}
