"use client";

import { useState } from "react";
import { ForumComment } from "@/services/forumService";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { ForumMarkdownEditor } from "./ForumMarkdownEditor";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Check,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ForumCommentItemProps {
  comment: ForumComment;
  postId: number;
  onSubmitReply: (parentCommentId: number, body: string) => Promise<void>;
  onVoteComment: (commentId: number, voteType: "upvote" | "downvote") => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onEditComment: (commentId: number, newBody: string) => Promise<void>;
  onAcceptComment: (commentId: number) => Promise<void>;
  isPostLocked: boolean;
  isTeacherOrAdmin: boolean;
  postOwnerId: number;
  depth: number;
}

export default function ForumCommentItem({
  comment,
  postId,
  onSubmitReply,
  onVoteComment,
  onDeleteComment,
  onEditComment,
  onAcceptComment,
  isPostLocked,
  isTeacherOrAdmin,
  postOwnerId,
  depth,
}: ForumCommentItemProps) {
  const [voting, setVoting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [showActions, setShowActions] = useState(false);

  const maxDepth = 5;
  const canReply = !isPostLocked && depth < maxDepth;

  // Detect optimistic comments (temporary negative IDs)
  const isOptimistic = comment.id < 0;

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (voting || isOptimistic) return;
    setVoting(true);
    await onVoteComment(comment.id, voteType);
    setVoting(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;

    setSubmitting(true);
    await onSubmitReply(comment.id, replyText);
    setReplyText("");
    setShowReplyForm(false);
    setSubmitting(false);
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    await onEditComment(comment.id, editText);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa câu trả lời này?")) return;
    await onDeleteComment(comment.id);
  };

  const handleAccept = async () => {
    await onAcceptComment(comment.id);
  };

  const getScoreColor = (score: number) => {
    if (score > 0) return "text-green-600";
    if (score < 0) return "text-red-600";
    return "text-slate-500 dark:text-slate-400";
  };

  return (
    <div className={`${depth > 0 ? "ml-8 mt-4" : ""}`}>
      <div
        className={`border rounded-2xl p-6 shadow-sm transition-all ${
          comment.is_accepted
            ? "border-green-300 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        } ${isOptimistic ? "opacity-70 animate-pulse" : ""}`}
      >
        <div className="flex gap-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleVote("upvote")}
              disabled={voting || isOptimistic}
              className={`p-1.5 rounded transition-colors ${
                comment.current_user_vote === "upvote"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <span
              className={`text-sm font-semibold ${getScoreColor(comment.score)}`}
            >
              {comment.score}
            </span>
            <button
              onClick={() => handleVote("downvote")}
              disabled={voting || isOptimistic}
              className={`p-1.5 rounded transition-colors ${
                comment.current_user_vote === "downvote"
                  ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            {comment.is_accepted && (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-2" />
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                {comment.user_name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
              {comment.is_accepted && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs rounded-lg font-medium">
                  <Check className="w-3 h-3" />
                  Được chấp nhận
                </span>
              )}
              {isOptimistic && (
                <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                  Đang gửi...
                </span>
              )}
            </div>

            {/* Body */}
            {editing ? (
              <div className="mb-3">
                <ForumMarkdownEditor
                  value={editText}
                  onChange={setEditText}
                  rows={4}
                  compact
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all active:scale-95"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditText(comment.body);
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-95"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <MarkdownRenderer content={comment.body} />
              </div>
            )}

            {/* Actions */}
            {!isOptimistic && (
              <div className="flex items-center gap-3 text-sm">
                {canReply && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Phản hồi
                  </button>
                )}

                {/* Accept button (post owner or teacher/admin) */}
                {!comment.is_accepted &&
                  depth === 0 &&
                  (isTeacherOrAdmin ||
                    postOwnerId === comment.user_id) && (
                    <button
                      onClick={handleAccept}
                      className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Chấp nhận
                    </button>
                  )}

                <div className="flex-1" />

                {/* More actions */}
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>

                  {showActions && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowActions(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                        <button
                          onClick={() => {
                            setEditing(true);
                            setShowActions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            handleDelete();
                            setShowActions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Reply Form */}
            {showReplyForm && (
              <form onSubmit={handleReply} className="mt-4 space-y-2">
                <ForumMarkdownEditor
                  value={replyText}
                  onChange={setReplyText}
                  placeholder="Viết phản hồi... (Hỗ trợ Markdown)"
                  rows={3}
                  disabled={submitting}
                  compact
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting || !replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all active:scale-95 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Đang gửi..." : "Gửi"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyText("");
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-95"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map((reply) => (
            <ForumCommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onSubmitReply={onSubmitReply}
              onVoteComment={onVoteComment}
              onDeleteComment={onDeleteComment}
              onEditComment={onEditComment}
              onAcceptComment={onAcceptComment}
              isPostLocked={isPostLocked}
              isTeacherOrAdmin={isTeacherOrAdmin}
              postOwnerId={postOwnerId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}