"use client";

import React, { useState } from "react";
import {
  X, MessageSquare, CheckCircle2, Circle,
  CornerDownRight, Send, Trash2, ChevronDown,
} from "lucide-react";
import type { LatexComment, LatexFile } from "@/types";
import { useComments } from "@/hooks/useComments";

interface CommentPanelProps {
  projectId: number;
  activeFile: LatexFile | null;
  userRole?: string;
  currentUserId?: number;
  textSelection?: { start: number; end: number; text: string } | null;
  onClearSelection?: () => void;
  onClose: () => void;
}

type Filter = "all" | "open" | "resolved";

function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function Avatar({ email, size = 7 }: { email: string; size?: number }) {
  const initial = email.charAt(0).toUpperCase();
  const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500", "bg-cyan-500"];
  const color = colors[email.charCodeAt(0) % colors.length];
  const sizeClass = `w-${size} h-${size}`;
  return (
    <div className={`${sizeClass} rounded-full ${color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
      {initial}
    </div>
  );
}

interface CommentCardProps {
  comment: LatexComment;
  isOwner: boolean;
  canComment: boolean;
  currentUserId?: number;
  onResolve: (id: number) => void;
  onUnresolve: (id: number) => void;
  onDelete: (id: number) => void;
  onReply: (comment: LatexComment) => void;
  depth?: number;
}

function CommentCard({ comment, isOwner, canComment, currentUserId, onResolve, onUnresolve, onDelete, onReply, depth = 0 }: CommentCardProps) {
  const isAuthor = comment.user_id === currentUserId;
  const canDelete = isAuthor || isOwner;

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-slate-100 dark:border-slate-800 pl-3" : ""}`}>
      <div className={`p-3 rounded-xl border transition-colors ${comment.resolved
        ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/50 opacity-70"
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
      }`}>
        {/* Selected text quote */}
        {comment.selected_text && !comment.parent_id && (
          <div className="mb-2 px-2 py-1.5 bg-amber-50 dark:bg-amber-950/20 border-l-2 border-amber-400 dark:border-amber-600 rounded-r-lg">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono line-clamp-2 italic">
              "{comment.selected_text}"
            </p>
          </div>
        )}

        {/* Comment header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar email={comment.user_email} size={6} />
            <div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{comment.user_email.split("@")[0]}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5">{timeAgo(comment.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* Resolve toggle */}
            {canComment && (
              <button
                onClick={() => comment.resolved ? onUnresolve(comment.id) : onResolve(comment.id)}
                className={`p-1 rounded-lg transition-all duration-150 active:scale-95 ${comment.resolved
                  ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                }`}
                title={comment.resolved ? "Mở lại" : "Đánh dấu đã giải quyết"}
              >
                {comment.resolved ? <CheckCircle2 size={13} /> : <Circle size={13} />}
              </button>
            )}
            {/* Delete */}
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1 rounded-lg text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95 transition-all duration-150"
                title="Xóa bình luận"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

        {/* Reply button */}
        {canComment && depth === 0 && (
          <button
            onClick={() => onReply(comment)}
            className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 active:scale-95 transition-all duration-150"
          >
            <CornerDownRight size={11} />
            Trả lời
          </button>
        )}
      </div>

      {/* Replies */}
      {comment.replies?.map((reply) => (
        <CommentCard
          key={reply.id}
          comment={reply}
          isOwner={isOwner}
          canComment={canComment}
          currentUserId={currentUserId}
          onResolve={onResolve}
          onUnresolve={onUnresolve}
          onDelete={onDelete}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function CommentPanel({
  projectId,
  activeFile,
  userRole,
  currentUserId,
  textSelection,
  onClearSelection,
  onClose,
}: CommentPanelProps) {
  const {
    comments,
    loading,
    loadFileComments,
    createComment,
    deleteComment,
    resolveComment,
    unresolveComment,
  } = useComments(projectId);

  const [filter, setFilter] = useState<Filter>("open");
  const [newContent, setNewContent] = useState("");
  const [replyTo, setReplyTo] = useState<LatexComment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const prevFileId = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (activeFile && activeFile.id !== prevFileId.current) {
      prevFileId.current = activeFile.id;
      loadFileComments(activeFile.id);
    }
  }, [activeFile, loadFileComments]);

  const canComment = userRole === "owner" || userRole === "editor" || userRole === "reviewer";
  const isOwner = userRole === "owner";

  const filtered = comments.filter((c) => {
    if (filter === "open") return !c.resolved;
    if (filter === "resolved") return c.resolved;
    return true;
  });

  const openCount = comments.filter((c) => !c.resolved).length;
  const resolvedCount = comments.filter((c) => c.resolved).length;

  const handleSubmit = async () => {
    if (!newContent.trim() || !activeFile) return;
    setSubmitting(true);
    try {
      await createComment({
        file_id: activeFile.id,
        content: newContent.trim(),
        selection_start: textSelection?.start,
        selection_end: textSelection?.end,
        selected_text: textSelection?.text,
        parent_id: replyTo?.id,
      });
      setNewContent("");
      setReplyTo(null);
      onClearSelection?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-80 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-slate-50">Bình luận</span>
          {openCount > 0 && (
            <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{openCount}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200"
        >
          <X size={14} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
        {(["all", "open", "resolved"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 active:scale-95 ${filter === f
              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {f === "all" ? `Tất cả (${comments.length})` : f === "open" ? `Đang mở (${openCount})` : `Đã xong (${resolvedCount})`}
          </button>
        ))}
      </div>

      {/* File label */}
      {activeFile && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
            📄 {activeFile.filename}
          </p>
        </div>
      )}

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : !activeFile ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <MessageSquare size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs">Chọn một tệp để xem bình luận</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <MessageSquare size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs">{filter === "resolved" ? "Chưa có bình luận nào đã giải quyết." : "Chưa có bình luận nào."}</p>
          </div>
        ) : (
          filtered.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              isOwner={isOwner}
              canComment={canComment}
              currentUserId={currentUserId}
              onResolve={resolveComment}
              onUnresolve={unresolveComment}
              onDelete={deleteComment}
              onReply={(parent) => setReplyTo(parent)}
            />
          ))
        )}
      </div>

      {/* New comment form (reviewer+) */}
      {canComment && activeFile && (
        <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
          {/* Text selection indicator */}
          {textSelection && (
            <div className="flex items-start gap-2 px-2 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">Bình luận về đoạn đã chọn:</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-500 font-mono truncate italic">"{textSelection.text.substring(0, 80)}{textSelection.text.length > 80 ? "..." : ""}"</p>
              </div>
              <button onClick={onClearSelection} className="text-amber-400 hover:text-amber-600 shrink-0">
                <X size={12} />
              </button>
            </div>
          )}

          {/* Reply indicator */}
          {replyTo && (
            <div className="flex items-center justify-between px-2 py-1.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-lg">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <CornerDownRight size={10} />
                Trả lời <span className="font-semibold">{replyTo.user_email.split("@")[0]}</span>
              </p>
              <button onClick={() => setReplyTo(null)} className="text-blue-400 hover:text-blue-600">
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Thêm bình luận... (Ctrl+Enter để gửi)"
              rows={2}
              className="flex-1 resize-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 leading-relaxed"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !newContent.trim()}
              className="self-end p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl active:scale-95 transition-all duration-200 shadow-sm"
            >
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                : <Send size={14} />
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
