import React from "react";
import Link from "next/link";
import { Play, Save, ArrowLeft, Loader2, Cpu } from "lucide-react";

interface EditorToolbarProps {
  projectTitle: string;
  compiler: string;
  isDirty: boolean;
  compiling: boolean;
  onSave: () => void;
  onCompile: () => void;
  onCompilerChange: (newCompiler: "pdflatex" | "xelatex" | "lualatex") => void;
}

export function EditorToolbar({
  projectTitle,
  compiler,
  isDirty,
  compiling,
  onSave,
  onCompile,
  onCompilerChange,
}: EditorToolbarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between select-none">
      {/* Left: Back & Project Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/bdctex"
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 active:scale-95 transition-all duration-200"
          title="Trở lại danh sách dự án"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 truncate max-w-xs md:max-w-md">
            {projectTitle}
          </h2>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">
            BDCTex Editor Workspace
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Compiler Select */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200/55 dark:border-slate-700/60">
          <Cpu size={14} className="text-slate-500 dark:text-slate-400" />
          <select
            value={compiler}
            onChange={(e) => onCompilerChange(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer border-none"
          >
            <option value="pdflatex">PDFLaTeX</option>
            <option value="xelatex">XeLaTeX</option>
            <option value="lualatex">LuaLaTeX</option>
          </select>
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={!isDirty}
          className={`flex items-center gap-1.5 font-semibold text-xs rounded-xl px-4 py-2.5 shadow-sm active:scale-95 transition-all duration-200 ${
            isDirty
              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent"
          }`}
          title="Lưu file (Ctrl + S)"
        >
          <Save size={14} />
          Lưu tệp
        </button>

        {/* Compile button */}
        <button
          onClick={onCompile}
          disabled={compiling}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl px-4.5 py-2.5 text-xs shadow-sm active:scale-95 transition-all duration-200 flex items-center gap-1.5"
        >
          {compiling ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Đang Build...
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              Biên dịch
            </>
          )}
        </button>
      </div>
    </div>
  );
}
