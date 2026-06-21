import React, { useState } from "react";
import { Terminal, ChevronUp, ChevronDown, Trash2 } from "lucide-react";

interface CompileLogPanelProps {
  log: string | null;
  errorMsg: string | null;
  onClear: () => void;
}

export function CompileLogPanel({ log, errorMsg, onClear }: CompileLogPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!log && !errorMsg) return null;

  return (
    <div className="bg-slate-950 border-t border-slate-800 text-slate-300 font-mono text-xs flex flex-col transition-all duration-200 select-none">
      {/* Header bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60"
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} className={errorMsg ? "text-red-500 animate-pulse" : "text-blue-500"} />
          <span className="font-bold text-xs">
            {errorMsg ? "Trạng thái: Lỗi biên dịch" : "Trạng thái: Thành công"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 active:scale-95 transition-all duration-150"
            title="Xóa Log"
          >
            <Trash2 size={12} />
          </button>
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Log Details Console */}
      {expanded && (
        <div className="p-4 max-h-56 overflow-y-auto select-text selection:bg-slate-800">
          {errorMsg && (
            <div className="text-red-400 font-semibold mb-2 border-l-2 border-red-500 pl-2">
              Lỗi: {errorMsg}
            </div>
          )}
          {log ? (
            <pre className="whitespace-pre-wrap leading-relaxed text-slate-400 font-mono">
              {log}
            </pre>
          ) : (
            <div className="text-slate-500 italic">Không có log chi tiết.</div>
          )}
        </div>
      )}
    </div>
  );
}
