import React, { useEffect, useRef } from "react";
import { Eye } from "lucide-react";
import type { LatexFile } from "@/types";

interface TextSelection {
  start: number;
  end: number;
  text: string;
}

interface TexEditorProps {
  file: LatexFile | null;
  content: string;
  isDirty: boolean;
  loading: boolean;
  userRole?: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onTextSelect?: (selection: TextSelection | null) => void;
}

export function TexEditor({ file, content, isDirty, loading, userRole, onChange, onSave, onTextSelect }: TexEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isReadOnly = userRole === "viewer" || userRole === "reviewer";
  const canEdit = !isReadOnly;

  // Auto-resize line numbers based on content line count
  const lineCount = content.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1);

  // Tab key indent helper
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      const nextValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(nextValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      onSave();
    }
  };

  // Capture text selection for comment creation
  const handleMouseUp = () => {
    if (!onTextSelect) return;
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start !== end) {
      const text = ta.value.substring(start, end);
      onTextSelect({ start, end, text });
    } else {
      onTextSelect(null);
    }
  };

  if (!file) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-center text-center p-8 select-none">
        <span className="text-slate-400 text-sm">Chọn một tệp tài liệu để bắt đầu soạn thảo.</span>
      </div>
    );
  }

  const isEditable =
    file.filename.endsWith(".tex") ||
    file.filename.endsWith(".bib") ||
    file.filename.endsWith(".cls") ||
    file.filename.endsWith(".txt") ||
    file.mime_type.startsWith("text/");

  if (!isEditable) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950/40 flex flex-col items-center justify-center text-center p-8 select-none">
        <span className="text-slate-500 font-semibold mb-2">Tệp không hỗ trợ xem trực tiếp</span>
        <span className="text-slate-400 text-xs max-w-xs">
          Hệ thống không hỗ trợ soạn thảo tệp nhị phân ({file.filename}) trực tiếp trong editor.
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950/20 overflow-hidden">
      {/* Editor Header */}
      <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
            {file.filename}
          </span>
          {isDirty && canEdit && (
            <span className="text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200/40">
              Đã chỉnh sửa
            </span>
          )}
          {isReadOnly && (
            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 dark:border-slate-700">
              <Eye size={10} />
              Chỉ đọc
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          {canEdit ? "Ctrl + S để lưu tệp nhanh" : isReadOnly && userRole === "reviewer" ? "Chọn văn bản để bình luận" : ""}
        </span>
      </div>

      {/* Editor Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-slate-400 text-sm">Đang tải nội dung tệp...</span>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden font-mono text-sm leading-relaxed relative">
          {/* Line Numbers Gutter */}
          <div className="bg-slate-100/60 dark:bg-slate-900/60 border-r border-slate-200/80 dark:border-slate-800/80 text-slate-400 dark:text-slate-600 py-4 select-none text-right pr-3 pl-4 min-w-[3.5rem] overflow-hidden">
            {lineNumbers.map((ln) => (
              <div key={ln} className="h-6">
                {ln}
              </div>
            ))}
          </div>

          {/* Code Area */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => !isReadOnly && onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onMouseUp={handleMouseUp}
            readOnly={isReadOnly}
            className={`flex-1 bg-transparent py-4 px-4 h-full w-full outline-none resize-none overflow-y-auto ${
              isReadOnly
                ? "text-slate-600 dark:text-slate-400 cursor-text"
                : "text-slate-800 dark:text-slate-100"
            }`}
            style={{ lineHeight: "1.5rem" }}
            spellCheck={false}
          />

          {/* Read-only overlay hint */}
          {isReadOnly && userRole === "reviewer" && (
            <div className="absolute bottom-3 right-3 pointer-events-none">
              <span className="text-[10px] text-slate-400/70 dark:text-slate-500/70 italic">Chọn văn bản để bình luận</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
