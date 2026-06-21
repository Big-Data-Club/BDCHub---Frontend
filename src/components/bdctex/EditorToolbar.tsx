import React from "react";
import Link from "next/link";
import { Play, Save, ArrowLeft, Loader2, Cpu, Users, MessageSquare, Crown, Edit3, Eye, Shield } from "lucide-react";
import type { Collaborator } from "@/types";

interface EditorToolbarProps {
  projectTitle: string;
  compiler: string;
  isDirty: boolean;
  compiling: boolean;
  userRole?: string;
  collaborators?: Collaborator[];
  commentsOpen?: boolean;
  onSave: () => void;
  onCompile: () => void;
  onCompilerChange: (newCompiler: "pdflatex" | "xelatex" | "lualatex") => void;
  onShareClick?: () => void;
  onToggleComments?: () => void;
}

const ROLE_ICON: Record<string, React.ElementType> = {
  owner: Crown,
  editor: Edit3,
  reviewer: Shield,
  viewer: Eye,
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Chủ sở hữu",
  editor: "Biên soạn",
  reviewer: "Nhận xét",
  viewer: "Chỉ xem",
};

const ROLE_BADGE: Record<string, string> = {
  owner:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40",
  editor:   "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40",
  reviewer: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40",
  viewer:   "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};

export function EditorToolbar({
  projectTitle,
  compiler,
  isDirty,
  compiling,
  userRole,
  collaborators,
  commentsOpen,
  onSave,
  onCompile,
  onCompilerChange,
  onShareClick,
  onToggleComments,
}: EditorToolbarProps) {
  const canEdit = userRole === "owner" || userRole === "editor";
  const canCompile = userRole === "owner" || userRole === "editor";
  const isOwner = userRole === "owner";

  const RoleIcon = userRole ? ROLE_ICON[userRole] ?? Eye : null;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between select-none gap-3">
      {/* Left: Back & Project Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/bdctex"
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 active:scale-95 transition-all duration-200 shrink-0"
          title="Trở lại danh sách dự án"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate max-w-[200px] md:max-w-sm">
              {projectTitle}
            </h2>
            {/* Role badge */}
            {userRole && RoleIcon && (
              <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${ROLE_BADGE[userRole]}`}>
                <RoleIcon size={10} />
                {ROLE_LABEL[userRole]}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">BDCTex Editor Workspace</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Collaborator avatars */}
        {collaborators && collaborators.length > 0 && (
          <div className="hidden md:flex items-center -space-x-1.5">
            {collaborators.slice(0, 4).map((c) => {
              const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-rose-500"];
              const color = colors[c.user_email.charCodeAt(0) % colors.length];
              return (
                <div
                  key={c.id}
                  title={c.user_email}
                  className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-white text-[9px] font-bold border-2 border-white dark:border-slate-900`}
                >
                  {c.user_email.charAt(0).toUpperCase()}
                </div>
              );
            })}
            {collaborators.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center text-white text-[9px] font-bold border-2 border-white dark:border-slate-900">
                +{collaborators.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Compiler Select */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200/55 dark:border-slate-700/60">
          <Cpu size={14} className="text-slate-500 dark:text-slate-400" />
          <select
            value={compiler}
            onChange={(e) => onCompilerChange(e.target.value as any)}
            disabled={!canCompile}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="pdflatex">PDFLaTeX</option>
            <option value="xelatex">XeLaTeX</option>
            <option value="lualatex">LuaLaTeX</option>
          </select>
        </div>

        {/* Comments toggle */}
        {onToggleComments && (
          <button
            onClick={onToggleComments}
            className={`flex items-center gap-1.5 font-semibold text-xs rounded-xl px-3 py-2.5 active:scale-95 transition-all duration-200 border ${
              commentsOpen
                ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            }`}
            title="Bình luận"
          >
            <MessageSquare size={14} />
            <span className="hidden sm:inline">Bình luận</span>
          </button>
        )}

        {/* Share button (owner only) */}
        {isOwner && onShareClick && (
          <button
            onClick={onShareClick}
            className="flex items-center gap-1.5 font-semibold text-xs rounded-xl px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all duration-200"
            title="Chia sẻ dự án"
          >
            <Users size={14} />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        )}

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={!isDirty || !canEdit}
          className={`flex items-center gap-1.5 font-semibold text-xs rounded-xl px-4 py-2.5 shadow-sm active:scale-95 transition-all duration-200 ${
            isDirty && canEdit
              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent"
          }`}
          title={!canEdit ? "Bạn không có quyền chỉnh sửa" : "Lưu file (Ctrl + S)"}
        >
          <Save size={14} />
          Lưu tệp
        </button>

        {/* Compile button */}
        {canCompile && (
          <button
            onClick={onCompile}
            disabled={compiling}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl px-4 py-2.5 text-xs shadow-sm active:scale-95 transition-all duration-200 flex items-center gap-1.5"
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
        )}
      </div>
    </div>
  );
}
