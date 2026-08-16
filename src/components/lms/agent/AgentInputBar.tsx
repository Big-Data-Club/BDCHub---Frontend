"use client";

import { useState, useRef, useLayoutEffect } from "react";
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

export function AgentInputBar({
  onSend,
  isStreaming,
  onStop,
  disabled,
  placeholder = "Nhập tin nhắn...",
  className,
}: AgentInputBarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronous bidirectional height calculation BEFORE paint to eliminate scrollbar flicker & ensure collapse
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // Reset height to "auto" to force browser DOM layout engine to recompute exact scrollHeight for current string
    el.style.height = "auto";

    const scrollHeight = el.scrollHeight;
    const targetHeight = Math.min(Math.max(scrollHeight, MIN_HEIGHT), MAX_HEIGHT);

    el.style.height = `${targetHeight}px`;

    // Strictly hide overflow-y until max height is reached to prevent scrollbar flicker
    el.style.overflowY = scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [input]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isStreaming || disabled) return;
    onSend(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Prevent premature send during IME composition (Vietnamese Telex/Unikey, Japanese, Chinese)
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-end gap-2 p-1.5 sm:p-2 rounded-2xl",
        "bg-white dark:bg-[#0D192E]",
        "border border-slate-300/80 dark:border-blue-500/20",
        "focus-within:border-blue-500 dark:focus-within:border-cyan-400/50",
        "focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-cyan-400/20",
        "shadow-md shadow-slate-200/50 dark:shadow-cyan-950/20 transition-all duration-200",
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled || isStreaming}
        className={cn(
          "flex-1 resize-none bg-transparent px-3 py-2",
          "text-xs sm:text-sm leading-5 text-slate-900 dark:text-slate-100",
          "placeholder:text-slate-400 dark:placeholder:text-slate-500",
          "focus:outline-none",
          "disabled:opacity-50",
          "custom-scrollbar",
          "transition-[height] duration-150 ease-out",
        )}
        style={{
          height: `${MIN_HEIGHT}px`,
          overflowY: "hidden",
        }}
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
          title="Dừng sinh trả lời"
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
}
