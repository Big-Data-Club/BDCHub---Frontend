"use client";
import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import { Hash, Lock, Loader2, ChevronUp, Wifi, WifiOff, ArrowLeft, ArrowDown, MessageSquare, RefreshCw, X } from "lucide-react";
import { useChat } from "@/hooks/chat/useChat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatAvatar from "./ChatAvatar";
import { cn } from "@/lib/utils";
import type { ChatMessage as Message } from "@/types/chat/chat";
import { getChannelPresence } from "@/services/chat/chatService";

export default function ChatPanel() {
  const { activeChannelId, channels, messages, messagesLoading, hasMoreMessages, loadMoreMessages,
    sendMessage, sendAttachments, deleteMessage, editMessage, isConnected, connectionState,
    showSidebar, openSidebar, preferences, error, clearError, reconnect } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const previousChannel = useRef<number | null>(null);
  const pagination = useRef<{ height: number; top: number; channelId: number | null } | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [dmOnline, setDmOnline] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const channel = channels.find((entry) => entry.id === activeChannelId);
  const dmUserId = channel?.dmUser?.id;

  useEffect(() => {
    setReplyingTo(null); setEditingMessage(null); setShowJump(false);
    pinned.current = true; pagination.current = null;
  }, [activeChannelId]);

  useEffect(() => {
    if (!activeChannelId || !dmUserId) { setDmOnline(false); return; }
    let cancelled = false;
    const refresh = async () => {
      if (document.hidden) return;
      try { const users = await getChannelPresence(activeChannelId); if (!cancelled) setDmOnline(users.some((user) => user.userId === dmUserId && user.online)); }
      catch { if (!cancelled) setDmOnline(false); }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [activeChannelId, dmUserId]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (previousChannel.current !== activeChannelId) {
      previousChannel.current = activeChannelId; pinned.current = true; pagination.current = null;
    }
    if (pagination.current?.channelId === activeChannelId) {
      container.scrollTop = pagination.current.top + container.scrollHeight - pagination.current.height;
      pagination.current = null;
    } else if (pinned.current) container.scrollTop = container.scrollHeight;
    else setShowJump(true);
  }, [messages, activeChannelId]);

  const loadOlder = useCallback(async () => {
    const container = scrollRef.current;
    if (!container || messagesLoading || !hasMoreMessages || pagination.current) return;
    pagination.current = { height: container.scrollHeight, top: container.scrollTop, channelId: activeChannelId };
    await loadMoreMessages();
    // Failure/empty-page responses still release the guard.
    requestAnimationFrame(() => { pagination.current = null; });
  }, [activeChannelId, messagesLoading, hasMoreMessages, loadMoreMessages]);
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    pinned.current = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (pinned.current) setShowJump(false);
    if (container.scrollTop < 60 && !pinned.current) void loadOlder();
  }, [loadOlder]);
  const jumpToLatest = useCallback(() => {
    pinned.current = true; setShowJump(false);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);
  const handleReply = useCallback((message: Message) => { setEditingMessage(null); setReplyingTo(message); }, []);
  const handleEdit = useCallback((message: Message) => { setReplyingTo(null); setEditingMessage(message); }, []);
  const handleSend = useCallback(async (body: string, parentId?: number | null) => {
    await sendMessage(body, parentId); setReplyingTo(null); jumpToLatest();
  }, [sendMessage, jumpToLatest]);
  const handleSendAttachments = useCallback(async (files: File[], body: string, parentId?: number | null) => {
    await sendAttachments(files, body, parentId); setReplyingTo(null); jumpToLatest();
  }, [sendAttachments, jumpToLatest]);
  const handleSaveEdit = useCallback(async (id: number, body: string) => { await editMessage(id, body); setEditingMessage(null); }, [editMessage]);

  if (!channel) return <section className={cn("min-w-0 flex-1 flex-col items-center justify-center bg-muted/25 p-8 text-center md:flex", showSidebar ? "hidden" : "flex")}>
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card text-blue-600 dark:text-blue-400"><MessageSquare className="h-9 w-9" strokeWidth={1.5} /></div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">BDC / Cộng đồng</p>
    <h2 className="text-2xl font-semibold tracking-tight text-foreground">Một ý tưởng hay bắt đầu từ cuộc trò chuyện.</h2>
    <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Chọn kênh để cùng thảo luận, hoặc bắt đầu tin nhắn riêng với một thành viên.</p>
    {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
    <button onClick={openSidebar} className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white md:hidden">Chọn cuộc trò chuyện</button>
  </section>;
  const name = channel.dmUser?.fullName || channel.name;
  const description = channel.isDm ? channel.dmUser?.email : channel.description;
  const Icon = channel.isPrivate ? Lock : Hash;
  return <section aria-label={`Trò chuyện ${name}`} className={cn("relative h-full min-h-0 min-w-0 flex-1 flex-col bg-card md:flex", showSidebar ? "hidden" : "flex")}>
    <header className="flex min-w-0 shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3"><button onClick={openSidebar} aria-label="Quay về danh sách trò chuyện" className="rounded-xl p-2 text-muted-foreground hover:bg-muted md:hidden"><ArrowLeft className="h-5 w-5" /></button>
        {channel.isDm ? <ChatAvatar name={name} src={channel.dmUser?.profilePicture} size="sm" showPresence={dmOnline} /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground"><Icon className="h-5 w-5" /></div>}
        <div className="min-w-0"><h2 className="truncate text-base font-semibold tracking-tight text-foreground">{name}</h2><p className="mt-0.5 truncate text-xs text-muted-foreground">{description || (channel.isDm ? "Cuộc trò chuyện riêng tư" : "Trao đổi, chia sẻ và cùng tiến bộ")}</p></div>
      </div>
      <div className="flex shrink-0 items-center gap-2"><span role="status" className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium", isConnected ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400")}>{isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{isConnected ? "Trực tuyến" : connectionState === "offline" ? "Ngoại tuyến" : "Kết nối lại"}</span></span>{!isConnected && <button aria-label="Kết nối lại ngay" onClick={reconnect} className="rounded-xl p-2 text-muted-foreground hover:bg-muted"><RefreshCw className="h-4 w-4" /></button>}</div>
    </header>
    {error && <div role="alert" className="flex items-center justify-between gap-3 border-b border-red-500/10 bg-red-500/5 px-5 py-3 text-sm text-red-600 dark:text-red-400"><span>{error}</span><button onClick={clearError} aria-label="Đóng thông báo lỗi" className="shrink-0 p-1"><X className="h-4 w-4" /></button></div>}
    <div ref={scrollRef} onScroll={handleScroll} aria-label="Lịch sử tin nhắn" className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain py-4", preferences.compact && "[&_.chat-message]:py-1 [&_.chat-message]:mt-0")}>
      {hasMoreMessages && <div className="mb-4 flex justify-center"><button onClick={() => void loadOlder()} disabled={messagesLoading} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50">{messagesLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronUp className="h-3.5 w-3.5" />}Tin nhắn trước đó</button></div>}
      {messagesLoading && !messages.length ? <div className="flex h-40 items-center justify-center" role="status"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /><span className="sr-only">Đang tải tin nhắn</span></div> : !messages.length ? <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><MessageSquare className="h-6 w-6" /></div><h3 className="font-semibold text-foreground">Bắt đầu một cuộc trò chuyện</h3><p className="mt-2 max-w-xs text-sm text-muted-foreground">Gửi lời chào hoặc chia sẻ điều bạn đang tìm hiểu với {channel.isDm ? name : "mọi người"}.</p></div> : messages.map((message, index) => <ChatMessage key={message.id} message={message} prevMessage={messages[index - 1]} onDelete={deleteMessage} onReply={handleReply} onEdit={handleEdit} />)}
    </div>
    {showJump && <button onClick={jumpToLatest} className="absolute bottom-44 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground shadow-md"><ArrowDown className="h-3.5 w-3.5" />Tin nhắn mới nhất</button>}
    <ChatInput key={channel.id} channelId={channel.id} channelName={channel.isDm ? name : channel.slug} onSend={handleSend} onSendAttachments={handleSendAttachments} onSaveEdit={handleSaveEdit} replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} editingMessage={editingMessage} onCancelEdit={() => setEditingMessage(null)} />
  </section>;
}
