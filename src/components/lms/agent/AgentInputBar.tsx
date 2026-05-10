"use client";

import { useState } from "react";
import { Send, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentInputBarProps {
  onSend: (text: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AgentInputBar({
  onSend,
  isStreaming,
  onStop,
  disabled,
  placeholder = "Nhập tin nhắn...",
}: AgentInputBarProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming || disabled) return;
    onSend(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 p-4 border-t border-slate-200 dark:border-slate-800
                 bg-white dark:bg-slate-900"
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled || isStreaming}
        className={cn(
          "flex-1 resize-none rounded-xl p-3.5",
          "border border-slate-300 dark:border-slate-700",
          "bg-slate-50 dark:bg-slate-800",
          "text-slate-900 dark:text-slate-100",
          "placeholder:text-slate-400 dark:placeholder:text-slate-600",
          "focus:bg-white dark:focus:bg-slate-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          "transition-all duration-200",
          "max-h-32 min-h-[48px]",
          "disabled:opacity-50",
        )}
        style={{
          height: "auto",
          minHeight: "48px",
          maxHeight: "128px",
        }}
        onInput={(e) => {
          const el = e.target as HTMLTextAreaElement;
          el.style.height = "auto";
          el.style.height = Math.min(el.scrollHeight, 128) + "px";
        }}
      />

      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl",
            "bg-red-500 hover:bg-red-600 text-white",
            "transition-all duration-200 active:scale-95",
            "shadow-sm",
          )}
          title="Dừng"
        >
          <Square className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl",
            "bg-blue-600 hover:bg-blue-700 text-white",
            "transition-all duration-200 active:scale-95",
            "shadow-sm",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
          )}
          title="Gửi"
        >
          <Send className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
