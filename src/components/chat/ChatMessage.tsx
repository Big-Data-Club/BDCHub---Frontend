"use client";

import { useRef, useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Trash2 } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
  prevMessage?: ChatMessageType;
  onDelete?: (msgId: number) => void;
}

function getAvatar(name: string, avatarUrl?: string): string {
  if (avatarUrl) return avatarUrl;
  return `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(name)}`;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return `Hôm qua ${format(date, "HH:mm")}`;
  return format(date, "dd/MM/yyyy HH:mm");
}

function formatDateDivider(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return "Hôm nay";
  if (isYesterday(date)) return "Hôm qua";
  return format(date, "dd MMMM yyyy");
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function isSameSender(a: ChatMessageType, b: ChatMessageType): boolean {
  return a.senderId === b.senderId;
}

export default function ChatMessage({ message, prevMessage, onDelete }: ChatMessageProps) {
  const { data: session } = useSession();
  const { isAdmin } = useAuth();

  const isOwnMessage = (session as any)?.user?.id === String(message.senderId) ||
                       (session as any)?.user?.email === message.senderEmail;

  const canDelete = isOwnMessage || isAdmin;

  const showDateDivider = !prevMessage || !isSameDay(prevMessage.createdAt, message.createdAt);
  const showAvatar = !prevMessage ||
    showDateDivider ||
    !isSameSender(prevMessage, message) ||
    (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 5 * 60 * 1000;

  return (
    <div className="group">
      {/* Date divider */}
      {showDateDivider && (
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2">
            {formatDateDivider(message.createdAt)}
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
      )}

      {/* Message row */}
      <div className={cn(
        "flex gap-3 px-4 py-0.5 rounded-lg",
        "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-100",
        showAvatar && "mt-3"
      )}>
        {/* Avatar column — always takes up space to align messages */}
        <div className="w-9 flex-shrink-0 mt-0.5">
          {showAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getAvatar(message.senderName, message.senderAvatar)}
              alt={message.senderName}
              width={36}
              height={36}
              className="rounded-full w-9 h-9 object-cover ring-2 ring-white dark:ring-slate-900"
            />
          ) : null}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {showAvatar && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className={cn(
                "text-sm font-semibold",
                isOwnMessage
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-800 dark:text-slate-100"
              )}>
                {message.senderName}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {formatTimestamp(message.createdAt)}
              </span>
            </div>
          )}

          <div className="flex items-start gap-2">
            <p className={cn(
              "text-sm leading-relaxed break-words flex-1",
              message.isDeleted
                ? "italic text-slate-400 dark:text-slate-500"
                : "text-slate-700 dark:text-slate-300"
            )}>
              {message.body}
            </p>

            {/* Delete button — hover only, own message or admin */}
            {!message.isDeleted && onDelete && canDelete && (
              <button
                onClick={() => onDelete(message.id)}
                title="Xóa tin nhắn"
                className={cn(
                  "flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100",
                  "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40",
                  "transition-all duration-150"
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
