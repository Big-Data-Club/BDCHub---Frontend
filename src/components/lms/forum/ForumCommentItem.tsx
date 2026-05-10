"use client";

import { useState } from "react";
import forumService, { ForumComment } from "@/services/forumService";
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
  onCommentChanged: () => void;
  isPostLocked: boolean;
  isTeacherOrAdmin: boolean;
  postOwnerId: number;
  depth: number;
}

export default function ForumCommentItem({
  comment,
  postId,
  onCommentChanged,
  isPostLocked,
  isTeacherOrAdmin,
  postOwnerId,
  depth,
}: ForumCommentItemProps) {
  const [localComment, setLocalComment] = useState(comment);
  const [voting, setVoting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [showActions, setShowActions] = useState(false);

  const maxDepth = 5;
  const canReply = !isPostLocked && depth < maxDepth;

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (voting) return;
    
    try {
      setVoting(true);
      const response = await forumService.voteComment(localComment.id, voteType);
      
      setLocalComment({
        ...localComment,
        upvotes: response.data.upvotes,
        downvotes: response.data.downvotes,
        score: response.data.new_score,
        current_user_vote: localComment.current_user_vote === voteType ? undefined : voteType,
      });
    } catch (error) {
      console.error("Error voting:", error);
      alert("Không thể vote");
    } finally {
      setVoting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      await forumService.createComment(postId, {
        body: replyText,
        parent_comment_id: localComment.id,
      });
      setReplyText("");
      setShowReplyForm(false);
      onCommentChanged();
      alert("Đã thêm phản hồi!");
    } catch (error: any) {
      console.error("Error creating reply:", error);
      alert(error.response?.data?.error || "Không thể thêm phản hồi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;

    try {
      await forumService.updateComment(localComment.id, editText);
      setLocalComment({ ...localComment, body: editText });
      setEditing(false);
      alert("Đã cập nhật!");
    } catch (error: any) {
      console.error("Error updating comment:", error);
      alert(error.response?.data?.error || "Không thể cập nhật");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa câu trả lời này?")) return;

    try {
      await forumService.deleteComment(localComment.id);
      alert("Đã xóa");
      onCommentChanged();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Không thể xóa");
    }
  };

  const handleAccept = async () => {
    try {
      await forumService.acceptComment(localComment.id);
      alert("Đã đánh dấu là câu trả lời được chấp nhận!");
      onCommentChanged();
    } catch (error: any) {
      console.error("Error accepting comment:", error);
      alert(error.response?.data?.error || "Không thể thực hiện");
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0) return "text-green-600";
    if (score < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : ''}`}>
      <div className={`border rounded-2xl p-6 shadow-sm transition-all ${
        localComment.is_accepted 
          ? 'border-green-300 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30' 
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}>
        <div className="flex gap-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleVote('upvote')}
              disabled={voting}
              className={`p-1.5 rounded transition-colors ${
                localComment.current_user_vote === 'upvote'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <span className={`text-sm font-semibold ${getScoreColor(localComment.score)}`}>
              {localComment.score}
            </span>
            <button
              onClick={() => handleVote('downvote')}
              disabled={voting}
              className={`p-1.5 rounded transition-colors ${
                localComment.current_user_vote === 'downvote'
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            {localComment.is_accepted && (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-2" />
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-slate-900 dark:text-slate-50">{localComment.user_name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {formatDistanceToNow(new Date(localComment.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
              {localComment.is_accepted && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs rounded-lg font-medium">
                  <Check className="w-3 h-3" />
                  Được chấp nhận
                </span>
              )}
            </div>

            {/* Body */}
            {editing ? (
              <div className="mb-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                             text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600
                             bg-slate-50 dark:bg-slate-800
                             focus:bg-white dark:focus:bg-slate-900
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                             transition-all"
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
                      setEditText(localComment.body);
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-95"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 mb-3 whitespace-pre-wrap">{localComment.body}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 text-sm">
              {canReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  Phản hồi
                </button>
              )}

              {/* Accept button (post owner or teacher/admin) */}
              {!localComment.is_accepted && depth === 0 && (isTeacherOrAdmin || postOwnerId === localComment.user_id) && (
                <button
                  onClick={handleAccept}
                  className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
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

            {/* Reply Form */}
            {showReplyForm && (
              <form onSubmit={handleReply} className="mt-4 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Viết phản hồi..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                             text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600
                             bg-slate-50 dark:bg-slate-800
                             focus:bg-white dark:focus:bg-slate-900
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                             transition-all"
                  disabled={submitting}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting || !replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all active:scale-95"
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
      {localComment.replies && localComment.replies.length > 0 && (
        <div className="space-y-4">
          {localComment.replies.map((reply) => (
            <ForumCommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onCommentChanged={onCommentChanged}
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