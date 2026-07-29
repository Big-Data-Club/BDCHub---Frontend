"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";
import { Send, Loader2, X, Eye, Pencil, CornerUpRight, Paperclip, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, ChatUser } from "@/types/chat";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import ChatAvatar from "./ChatAvatar";

interface ChatInputProps {
  channelId: number;
  channelName: string;
  onSend: (body: string, parentId?: number | null) => Promise<void>;
  onSendAttachments: (files: File[], body: string, parentId?: number | null) => Promise<void>;
  disabled?: boolean;
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
  editingMessage?: ChatMessage | null;
  onCancelEdit?: () => void;
  onSaveEdit?: (msgId: number, body: string) => Promise<void>;
}

export default function ChatInput({
  channelId,
  channelName,
  onSend,
  onSendAttachments,
  disabled,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onSaveEdit,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // @ mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionUsers, setMentionUsers] = useState<ChatUser[]>([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(0);
  const mentionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-fill when editing a message
  useEffect(() => {
    if (editingMessage) {
      setValue(editingMessage.body);
      setPreview(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    } else {
      setValue("");
    }
  }, [editingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [value]);

  // Detect @ trigger and query users
  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setValue(text);
      const cursor = e.target.selectionStart ?? text.length;

      // Find if cursor is inside a @word segment
      const before = text.slice(0, cursor);
      const atIdx = before.lastIndexOf("@");
      if (
        atIdx >= 0 &&
        (atIdx === 0 || /\s/.test(before[atIdx - 1]))
      ) {
        const word = before.slice(atIdx + 1);
        if (!word.includes(" ") && !word.includes("\n")) {
          setMentionStart(atIdx);
          setMentionIndex(0);
          if (mentionDebounceRef.current) clearTimeout(mentionDebounceRef.current);
          mentionDebounceRef.current = setTimeout(async () => {
            try {
              const { searchChannelMembers } = await import("@/services/chatService");
              const users = await searchChannelMembers(channelId, word);
              setMentionQuery(word);
              setMentionUsers(users.slice(0, 8));
            } catch {
              setMentionQuery(null);
              setMentionUsers([]);
            }
          }, 150);
          return;
        }
      }
      setMentionQuery(null);
      setMentionUsers([]);
    },
    [channelId]
  );

  const insertMention = useCallback(
    (user: ChatUser) => {
      const cursor = textareaRef.current?.selectionStart ?? value.length;
      const before = value.slice(0, mentionStart);
      const after = value.slice(cursor);
      const tag = `@[${user.fullName}](mention://${user.id})`;
      const newVal = before + tag + " " + after;
      setValue(newVal);
      setMentionQuery(null);
      setMentionUsers([]);
      setTimeout(() => {
        const pos = before.length + tag.length + 1;
        textareaRef.current?.setSelectionRange(pos, pos);
        textareaRef.current?.focus();
      }, 0);
    },
    [value, mentionStart]
  );

  const handleSend = async () => {
    const body = value.trim();
    if ((!body && attachments.length === 0) || sending || disabled) return;
    setSending(true);
    try {
      if (editingMessage && onSaveEdit) {
        await onSaveEdit(editingMessage.id, body);
      } else if (attachments.length > 0) {
        await onSendAttachments(attachments, body, replyingTo?.id ?? null);
      } else {
        await onSend(body, replyingTo?.id ?? null);
      }
      setValue("");
      setAttachments([]);
      setPreview(false);
      textareaRef.current?.focus();
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Navigate autocomplete list
    if (mentionQuery !== null && mentionUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % mentionUsers.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + mentionUsers.length) % mentionUsers.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(mentionUsers[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        setMentionUsers([]);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEditMode = !!editingMessage;
  const selectAttachments = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const tooLarge = incoming.find((file) => file.size > 20 * 1024 * 1024);
    if (tooLarge) { window.alert(`“${tooLarge.name}” vượt quá 20MB.`); return; }
    setAttachments((current) => {
      const next = [...current, ...incoming].slice(0, 10);
      if (current.length + incoming.length > 10) window.alert("Mỗi tin nhắn tối đa 10 file.");
      const total = next.reduce((sum, file) => sum + file.size, 0);
      if (total > 100 * 1024 * 1024) { window.alert("Tổng dung lượng tối đa 100MB."); return current; }
      return next;
    });
    setPreview(false);
  };

  return (
    <div className="px-4 pb-4 pt-2 relative">
      {/* Reply / Edit context bar */}
      {(replyingTo || isEditMode) && (
        <div
          className={cn(
            "flex items-start justify-between gap-2 mb-2 px-3 py-2 rounded-xl text-xs",
            isEditMode
              ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40"
              : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40"
          )}
        >
          <div className="flex items-start gap-2 min-w-0">
            {isEditMode ? (
              <Pencil className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            ) : (
              <CornerUpRight className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p
                className={cn(
                  "font-semibold",
                  isEditMode
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-blue-700 dark:text-blue-400"
                )}
              >
                {isEditMode
                  ? "Đang chỉnh sửa tin nhắn"
                  : `Đang trả lời @${replyingTo?.senderName}`}
              </p>
              {!isEditMode && replyingTo?.body && (
                <p className="text-slate-500 dark:text-slate-400 truncate max-w-sm">
                  {replyingTo.body}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={isEditMode ? onCancelEdit : onCancelReply}
            className="flex-shrink-0 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* @ Mention autocomplete dropdown */}
      {mentionQuery !== null && mentionUsers.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Gợi ý thành viên
            </span>
          </div>
          {mentionUsers.map((user, idx) => (
            <button
              key={user.id}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent textarea blur
                insertMention(user);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                idx === mentionIndex
                  ? "bg-blue-50 dark:bg-blue-950/40"
                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <ChatAvatar name={user.fullName} src={user.profilePicture} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div
        className={cn(
          "rounded-xl border overflow-hidden",
          "bg-white dark:bg-slate-800",
          "border-slate-200 dark:border-slate-700",
          "focus-within:border-blue-500 dark:focus-within:border-blue-500",
          "focus-within:ring-2 focus-within:ring-blue-500/20",
          "transition-all duration-150",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        {/* Toolbar: Write / Preview toggle */}
        <div className="flex items-center gap-1 px-3 pt-2 pb-1 border-b border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium transition-colors",
              !preview
                ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            <Pencil className="h-3 w-3" />
            Viết
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium transition-colors",
              preview
                ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            <Eye className="h-3 w-3" />
            Xem trước
          </button>
          <div className="flex-1" />
          {!isEditMode && (
            <>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(event) => { selectAttachments(event.target.files); event.currentTarget.value = ""; }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled || sending} className="mr-1 flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 disabled:cursor-not-allowed" title="Đính kèm file (tối đa 20MB)">
                <Paperclip className="h-3.5 w-3.5" /> Đính kèm
              </button>
            </>
          )}
          {value.length > 3500 && (
            <span
              className={cn(
                "text-xs tabular-nums",
                value.length > 3900 ? "text-red-500" : "text-slate-400"
              )}
            >
              {4000 - value.length}
            </span>
          )}
        </div>

        {/* Write / Preview area */}
        {attachments.length > 0 && !isEditMode && (
          <div className="mx-3 mt-2 space-y-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-2 dark:border-blue-900/50 dark:bg-blue-950/20">
            {attachments.map((attachment, index) => (
              <div key={`${attachment.name}-${index}`} className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-blue-500" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700 dark:text-slate-200">{attachment.name}</span>
                <span className="text-[11px] text-slate-400">{(attachment.size / 1024 / 1024).toFixed(1)} MB</span>
                <button type="button" onClick={() => setAttachments((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="rounded p-0.5 text-slate-400 hover:bg-white hover:text-red-500 dark:hover:bg-slate-800" title="Bỏ file"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        )}
        {preview ? (
          <div className="px-3 py-2 min-h-[2.5rem] max-h-40 overflow-y-auto">
            {value.trim() ? (
              <MarkdownRenderer content={value} variant="chat" />
            ) : (
              <span className="text-sm text-slate-400 italic">Chưa có nội dung...</span>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
            placeholder={`Nhắn tin trong #${channelName}… (hỗ trợ Markdown, @ để tag)`}
            rows={1}
            maxLength={4000}
            className={cn(
              "w-full resize-none bg-transparent text-sm text-slate-800 dark:text-slate-100",
              "placeholder-slate-400 dark:placeholder-slate-500",
              "outline-none min-h-[2.5rem] max-h-40",
              "leading-relaxed px-3 py-2",
              (disabled || sending) && "cursor-not-allowed"
            )}
          />
        )}

        {/* Bottom bar: hints + send */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
            <kbd className="font-mono">Enter</kbd> gửi ·{" "}
            <kbd className="font-mono">Shift+Enter</kbd> xuống dòng ·{" "}
            <kbd className="font-mono">@</kbd> tag thành viên
          </p>
          <div className="flex-1" />
          <button
            onClick={handleSend}
            disabled={(!value.trim() && attachments.length === 0) || sending || disabled}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
              "transition-all duration-150 active:scale-95",
              (value.trim() || attachments.length > 0) && !sending && !disabled
                ? isEditMode
                  ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/25"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/25"
                : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
            )}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isEditMode ? "Lưu" : attachments.length > 0 ? `Gửi ${attachments.length} file` : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
}
