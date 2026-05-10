"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import forumService, { ForumPost, ForumComment } from "@/services/forumService";
import { Button } from "@/components/ui/button";
import ForumCommentSection from "./ForumCommentSection";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Eye, 
  ArrowLeft,
  Pin,
  Lock,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ForumPostDetailProps {
  postId: number;
  isTeacherOrAdmin?: boolean;
}

export default function ForumPostDetail({ postId, isTeacherOrAdmin = false }: ForumPostDetailProps) {
  const router = useRouter();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    try {
      const response = await forumService.getPost(postId);
      setPost(response.data);
    } catch (error) {
      console.error("Error loading post:", error);
      alert("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await forumService.listComments(postId);
      setComments(response.data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!post || voting) return;
    
    try {
      setVoting(true);
      const response = await forumService.votePost(post.id, voteType);
      
      setPost({
        ...post,
        upvotes: response.data.upvotes,
        downvotes: response.data.downvotes,
        score: response.data.new_score,
        current_user_vote: post.current_user_vote === voteType ? undefined : voteType,
      });
    } catch (error) {
      console.error("Error voting:", error);
      alert("Không thể vote");
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await forumService.createComment(postId, { body: newComment });
      setNewComment("");
      loadComments();
      if (post) {
        setPost({ ...post, comment_count: post.comment_count + 1 });
      }
      alert("Đã thêm câu trả lời!");
    } catch (error: any) {
      console.error("Error creating comment:", error);
      alert(error.response?.data?.error || "Không thể thêm câu trả lời");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await forumService.deletePost(postId);
      alert("Đã xóa bài viết");
      router.back();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Không thể xóa bài viết");
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0) return "text-green-600";
    if (score < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy bài viết</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4 py-2 font-medium transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </Button>

      {/* Post Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex gap-6">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => handleVote('upvote')}
              disabled={voting}
              className={`p-3 rounded-lg transition-colors ${
                post.current_user_vote === 'upvote'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}
            >
              <ThumbsUp className="w-6 h-6" />
            </button>
            <span className={`text-2xl font-bold ${getScoreColor(post.score)}`}>
              {post.score}
            </span>
            <button
              onClick={() => handleVote('downvote')}
              disabled={voting}
              className={`p-3 rounded-lg transition-colors ${
                post.current_user_vote === 'downvote'
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}
            >
              <ThumbsDown className="w-6 h-6" />
            </button>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              {post.is_pinned && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs rounded-lg font-medium">
                  <Pin className="w-3 h-3" />
                  Đã ghim
                </span>
              )}
              {post.is_locked && (
                <span className="flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-xs rounded-lg font-medium">
                  <Lock className="w-3 h-3" />
                  Đã khóa
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight mb-4">
              {post.title}
            </h1>

            {/* Body */}
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                {post.body}
              </p>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{post.comment_count} câu trả lời</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.view_count} lượt xem</span>
              </div>
              <div className="flex-1" />
              <span>
                Đăng bởi <strong className="text-slate-700 dark:text-slate-300">{post.user_name}</strong>
              </span>
              <span>
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>

            {/* Actions (for owner or admin) */}
            {isTeacherOrAdmin && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl px-4 py-2 font-medium transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa bài viết
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Comment Form */}
      {!post.is_locked && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
            Thêm câu trả lời của bạn
          </h3>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết câu trả lời của bạn..."
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl
                         text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600
                         bg-slate-50 dark:bg-slate-800
                         focus:bg-white dark:focus:bg-slate-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                         transition-all"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl px-6 py-3 shadow-sm transition-all active:scale-95"
            >
              {submitting ? "Đang gửi..." : "Gửi câu trả lời"}
            </button>
          </form>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
          {post.comment_count} câu trả lời
        </h3>
        <ForumCommentSection
          postId={postId}
          comments={comments}
          onCommentChanged={loadComments}
          isPostLocked={post.is_locked}
          isTeacherOrAdmin={isTeacherOrAdmin}
          postOwnerId={post.user_id}
        />
      </div>
    </div>
  );
}