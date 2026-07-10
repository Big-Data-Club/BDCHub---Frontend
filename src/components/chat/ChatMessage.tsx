"use client";

import { format, isToday, isYesterday } from "date-fns";
import { Trash2, Reply, Pencil, CornerUpRight } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

interface ChatMessageProps {
  message: ChatMessageType;
  prevMessage?: ChatMessageType;
  onDelete?: (msgId: number) => void;
  onReply?: (message: ChatMessageType) => void;
  onEdit?: (message: ChatMessageType) => void;
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

export default function ChatMessage({
  message,
  prevMessage,
  onDelete,
  onReply,
  onEdit,
}: ChatMessageProps) {
  const { data: session } = useSession();
  const { isAdmin } = useAuth();

  const isOwnMessage =
    (session as any)?.user?.id === String(message.senderId) ||
    (session as any)?.user?.email === message.senderEmail;

  const canDelete = isOwnMessage || isAdmin;
  const canEdit = isOwnMessage && !message.isDeleted;

  const showDateDivider =
    !prevMessage || !isSameDay(prevMessage.createdAt, message.createdAt);
  const showAvatar =
    !prevMessage ||
    showDateDivider ||
    !isSameSender(prevMessage, message) ||
    new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() >
      5 * 60 * 1000;

  return (
    <div className="group">
      {/* Date divider */}
      {showDateDivider && (
        <div className="flex items-center gap-3 my-4 px-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase px-2 bg-white dark:bg-slate-900">
            {formatDateDivider(message.createdAt)}
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
        </div>
      )}

      {/* Message row */}
      <div
        className={cn(
          "relative flex gap-3 px-4 py-0.5 rounded-lg",
          "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-100",
          showAvatar && "mt-3"
        )}
      >
        {/* Avatar column */}
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
          {/* Sender name + timestamp */}
          {showAvatar && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span
                className={cn(
                  "text-sm font-semibold",
                  isOwnMessage
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-800 dark:text-slate-100"
                )}
              >
                {message.senderName}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {formatTimestamp(message.createdAt)}
              </span>
              {message.isEdited && (
                <span className="text-[10px] text-slate-400 dark:text-slate-600 italic">
                  (đã chỉnh sửa)
                </span>
              )}
            </div>
          )}

          {/* Reply preview banner */}
          {message.parentId && message.parentSenderName && (
            <div className="flex items-start gap-2 mb-1.5 pl-2.5 border-l-2 border-blue-400/70 dark:border-blue-500/60 bg-blue-50/60 dark:bg-blue-950/20 rounded-r-md py-1 pr-2">
              <CornerUpRight className="h-3 w-3 text-blue-400 dark:text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  @{message.parentSenderName}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs leading-tight">
                  {message.parentBody}
                </p>
              </div>
            </div>
          )}

          {/* Message body */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              {message.isDeleted ? (
                <p className="text-sm italic text-slate-400 dark:text-slate-500">
                  [Tin nhắn đã bị xóa]
                </p>
              ) : (
                <MarkdownRenderer content={message.body} variant="chat" />
              )}
              {/* Show isEdited on grouped (no-header) messages */}
              {!showAvatar && message.isEdited && !message.isDeleted && (
                <span className="text-[10px] text-slate-400 dark:text-slate-600 italic ml-1">
                  (đã chỉnh sửa)
                </span>
              )}
            </div>

            {/* Hover action buttons */}
            {!message.isDeleted && (
              <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150">
                {onReply && (
                  <button
                    onClick={() => onReply(message)}
                    title="Trả lời"
                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-150 active:scale-95"
                  >
                    <Reply className="h-3.5 w-3.5" />
                  </button>
                )}
                {canEdit && onEdit && (
                  <button
                    onClick={() => onEdit(message)}
                    title="Chỉnh sửa tin nhắn"
                    className="p-1.5 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all duration-150 active:scale-95"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                {canDelete && onDelete && (
                  <button
                    onClick={() => onDelete(message.id)}
                    title="Xóa tin nhắn"
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-150 active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
