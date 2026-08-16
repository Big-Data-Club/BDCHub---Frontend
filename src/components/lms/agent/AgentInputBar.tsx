"use client";

import { useState, useRef, useLayoutEffect, memo } from "react";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentInputBarProps {
  onSend: (text: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const MIN_HEIGHT = 36;
const MAX_HEIGHT = 192;

export const AgentInputBar = memo(function AgentInputBar({
  onSend,
  isStreaming,
  onStop,
  disabled,
  placeholder = "Nhập tin nhắn...",
  className,
}: AgentInputBarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = `${MIN_HEIGHT}px`;
    const nextHeight = Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    el.style.height = `${nextHeight}px`;
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-end gap-2 p-2 sm:p-2.5 rounded-2xl",
        "bg-white dark:bg-[#070E1C]",
        "border border-slate-200/90 dark:border-blue-500/20",
        "shadow-lg dark:shadow-none shadow-blue-500/5",
        "focus-within:border-blue-500/50 dark:focus-within:border-cyan-500/40",
        "transition-all duration-200",
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isStreaming}
        rows={1}
        className={cn(
          "flex-1 bg-transparent resize-none border-none outline-none",
          "text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
          "px-2 py-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800",
        )}
      />

      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          className={cn(
            "flex items-center justify-center w-8.5 h-8.5 rounded-xl flex-shrink-0",
            "bg-red-500 hover:bg-red-600 active:scale-95 text-white",
            "transition-all duration-200 shadow-xs cursor-pointer mb-0.5",
          )}
          title="Dừng phản hồi"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className={cn(
            "flex items-center justify-center w-8.5 h-8.5 rounded-xl flex-shrink-0",
            "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white",
            "transition-all duration-200 shadow-xs cursor-pointer mb-0.5",
            "disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100",
          )}
          title="Gửi tin nhắn (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      )}
    </form>
  );
});
