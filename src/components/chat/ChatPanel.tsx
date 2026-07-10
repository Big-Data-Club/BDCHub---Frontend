"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Hash, Lock, Loader2, ChevronUp, Wifi, WifiOff } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChatMessage as ChatMessageType } from "@/types/chat";

export default function ChatPanel() {
  const {
    activeChannelId,
    channels,
    messages,
    messagesLoading,
    hasMoreMessages,
    loadMoreMessages,
    sendMessage,
    deleteMessage,
    editMessage,
    isConnected,
  } = useChat();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  const [replyingTo, setReplyingTo] = useState<ChatMessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessageType | null>(null);

  const activeChannel = channels.find((ch) => ch.id === activeChannelId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const isFirstLoad = prevMessageCount.current === 0;
    const isNewMessage = messages.length > prevMessageCount.current;
    prevMessageCount.current = messages.length;

    if (messages.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      if (isFirstLoad) {
        // Instant snap on first load
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        }, 60);
        return;
      }

      if (isNewMessage) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 250;
        if (isNearBottom) {
          container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        }
      }
    }
  }, [messages]);

  // Reset state on channel switch
  useEffect(() => {
    if (activeChannelId) {
      prevMessageCount.current = 0;
      setReplyingTo(null);
      setEditingMessage(null);
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [activeChannelId]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMoreMessages || messagesLoading) return;
    if (container.scrollTop < 120) loadMoreMessages();
  }, [hasMoreMessages, messagesLoading, loadMoreMessages]);

  const handleSend = useCallback(
    async (body: string, parentId?: number | null) => {
      await sendMessage(body, parentId);
      setReplyingTo(null);
    },
    [sendMessage]
  );

  const handleSaveEdit = useCallback(
    async (msgId: number, body: string) => {
      await editMessage(msgId, body);
      setEditingMessage(null);
    },
    [editMessage]
  );

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (!activeChannelId || !activeChannel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
            <Hash className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-500 dark:text-slate-400">
              Chọn một kênh để bắt đầu
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">
              Chọn kênh hoặc người dùng từ danh sách bên trái
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isDm = activeChannel.isDm;
  const displayName = isDm
    ? activeChannel.dmUser?.fullName || activeChannel.name
    : activeChannel.name;
  const displayDesc = isDm
    ? activeChannel.dmUser?.email || activeChannel.description
    : activeChannel.description;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {isDm ? (
            <div className="relative h-7 w-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 border border-slate-300/30 dark:border-slate-600/30">
              <Image
                src={
                  activeChannel.dmUser?.profilePicture ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`
                }
                alt={displayName}
                fill
                sizes="28px"
                className="object-cover"
              />
            </div>
          ) : activeChannel.isPrivate ? (
            <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          ) : (
            <Hash className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          )}
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            {displayName}
          </h2>
          {displayDesc && (
            <>
              <span className="text-slate-300 dark:text-slate-700 flex-shrink-0">·</span>
              <p className="text-sm text-slate-400 dark:text-slate-500 truncate">{displayDesc}</p>
            </>
          )}
        </div>

        {/* Connection status indicator */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0",
            isConnected
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          )}
        >
          {isConnected ? (
            <><Wifi className="h-3 w-3" />Live</>
          ) : (
            <><WifiOff className="h-3 w-3" />Offline</>
          )}
        </div>
      </div>

      {/* ── Load more (older messages) ── */}
      {hasMoreMessages && (
        <button
          onClick={loadMoreMessages}
          disabled={messagesLoading}
          className={cn(
            "mx-4 mt-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5",
            "border border-slate-200 dark:border-slate-700",
            "text-slate-500 dark:text-slate-400",
            "hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150",
            messagesLoading && "opacity-60 cursor-not-allowed"
          )}
        >
          {messagesLoading ? (
            <><Loader2 className="h-3 w-3 animate-spin" />Đang tải…</>
          ) : (
            <><ChevronUp className="h-3 w-3" />Xem thêm tin nhắn cũ hơn</>
          )}
        </button>
      )}

      {/* ── Message list ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-2 scroll-smooth"
      >
        {messagesLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              {isDm ? (
                <div className="relative h-7 w-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <Image
                    src={
                      activeChannel.dmUser?.profilePicture ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`
                    }
                    alt={displayName}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <Hash className="h-6 w-6 text-blue-400" />
              )}
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center px-4">
              {isDm ? (
                <>Bắt đầu cuộc trò chuyện với <strong>{displayName}</strong></>
              ) : (
                <>Đây là đầu kênh <strong>#{activeChannel.name}</strong>. Gửi tin nhắn đầu tiên!</>
              )}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              prevMessage={messages[i - 1]}
              onDelete={deleteMessage}
              onReply={(m) => {
                setEditingMessage(null);
                setReplyingTo(m);
                textareaFocus();
              }}
              onEdit={(m) => {
                setReplyingTo(null);
                setEditingMessage(m);
              }}
            />
          ))
        )}
      </div>

      {/* ── Input ── */}
      <ChatInput
        channelName={isDm ? displayName : activeChannel.slug}
        onSend={handleSend}
        onSaveEdit={handleSaveEdit}
        disabled={!isConnected && messages.length === 0}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
      />
    </div>
  );
}

// helper — focuses the hidden textarea inside ChatInput
function textareaFocus() {
  setTimeout(() => {
    const ta = document.querySelector<HTMLTextAreaElement>("textarea");
    ta?.focus();
  }, 50);
}
