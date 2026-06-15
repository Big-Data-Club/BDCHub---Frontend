"use client";

import { useRef, useState, useEffect, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  channelName: string;
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
}

export default function ChatInput({ channelName, onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [value]);

  const handleSend = async () => {
    const body = value.trim();
    if (!body || sending || disabled) return;

    setSending(true);
    try {
      await onSend(body);
      setValue("");
      textareaRef.current?.focus();
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className={cn(
        "flex items-end gap-2 rounded-xl border px-3 py-2",
        "bg-white dark:bg-slate-800",
        "border-slate-200 dark:border-slate-700",
        "focus-within:border-blue-500 dark:focus-within:border-blue-500",
        "transition-colors duration-150",
        disabled && "opacity-60 cursor-not-allowed"
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder={`Nhắn tin trong #${channelName}…`}
          rows={1}
          maxLength={4000}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm text-slate-800 dark:text-slate-100",
            "placeholder-slate-400 dark:placeholder-slate-500",
            "outline-none min-h-[1.5rem] max-h-40",
            "leading-relaxed py-0.5",
            (disabled || sending) && "cursor-not-allowed"
          )}
        />

        {/* Character count when nearing limit */}
        {value.length > 3500 && (
          <span className={cn(
            "text-xs self-end mb-0.5",
            value.length > 3900 ? "text-red-500" : "text-slate-400"
          )}>
            {4000 - value.length}
          </span>
        )}

        <button
          onClick={handleSend}
          disabled={!value.trim() || sending || disabled}
          className={cn(
            "flex-shrink-0 p-1.5 rounded-lg transition-all duration-150 self-end mb-0.5",
            value.trim() && !sending && !disabled
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
          )}
        >
          {sending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />
          }
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-1 px-1">
        <kbd className="font-mono">Enter</kbd> để gửi · <kbd className="font-mono">Shift+Enter</kbd> để xuống dòng
      </p>
    </div>
  );
}
