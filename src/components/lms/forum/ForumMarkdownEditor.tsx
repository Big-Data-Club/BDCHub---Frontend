"use client";

import { useState, useCallback } from "react";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

interface ForumMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  /** Compact mode for reply forms — smaller, no toolbar description */
  compact?: boolean;
}

/**
 * Lightweight markdown editor for forum textareas.
 * Uses a Write/Preview tab approach instead of the full MDEditor (which is heavy
 * and designed for long-form lesson content). This is optimized for quick
 * forum posts and comments where speed matters more than a rich toolbar.
 */
export function ForumMarkdownEditor({
  value,
  onChange,
  placeholder = "Viết nội dung... (Hỗ trợ Markdown)",
  rows = 6,
  disabled = false,
  compact = false,
}: ForumMarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = "") => {
      const textarea = document.querySelector(
        "[data-forum-editor]"
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);
      const before = value.substring(0, start);
      const after = value.substring(end);

      const newValue = `${before}${prefix}${selected || "text"}${suffix}${after}`;
      onChange(newValue);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = start + prefix.length + (selected || "text").length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value, onChange]
  );

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
      {/* Tabs + Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "write"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Viết
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "preview"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Xem trước
          </button>
        </div>

        {/* Quick format toolbar (write mode only) */}
        {activeTab === "write" && !compact && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => insertMarkdown("**", "**")}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="In đậm"
            >
              <span className="text-xs font-bold">B</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("*", "*")}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="In nghiêng"
            >
              <span className="text-xs italic">I</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("`", "`")}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Code inline"
            >
              <span className="text-xs font-mono">{`<>`}</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("\n```\n", "\n```\n")}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Code block"
            >
              <span className="text-xs font-mono">{`{}`}</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("[", "](url)")}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Liên kết"
            >
              <span className="text-xs">🔗</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("\n- ", "")}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Danh sách"
            >
              <span className="text-xs">≡</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === "write" ? (
        <textarea
          data-forum-editor
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={compact ? Math.min(rows, 3) : rows}
          disabled={disabled}
          className={`w-full px-4 py-3 text-slate-900 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-600
                     bg-white dark:bg-slate-900
                     focus:outline-none resize-none
                     transition-all ${compact ? "text-sm" : ""}`}
        />
      ) : (
        <div
          className={`px-4 py-3 bg-white dark:bg-slate-900 ${
            compact ? "min-h-[80px]" : "min-h-[150px]"
          }`}
        >
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-slate-400 dark:text-slate-600 italic text-sm">
              Chưa có nội dung để xem trước
            </p>
          )}
        </div>
      )}

      {/* Markdown hint */}
      {!compact && (
        <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Hỗ trợ Markdown: **đậm**, *nghiêng*, `code`, ```code block```,
            [liên kết](url), # Tiêu đề, - danh sách
          </p>
        </div>
      )}
    </div>
  );
}
