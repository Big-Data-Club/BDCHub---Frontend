"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ForumPost } from "@/services/forumService";
import forumService from "@/services/forumService";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  Pin,
  Lock,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

interface ForumPostCardProps {
  post: ForumPost;
  onPostDeleted: () => void;
  isTeacherOrAdmin: boolean;
}

/**
 * Strip markdown syntax for plain-text preview in the post card.
 * This avoids rendering heavy MarkdownRenderer in the list view.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "[code]") // code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/#{1,6}\s+/g, "") // headings
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "[image]") // images
    .replace(/^\s*[-*+]\s+/gm, "• ") // list items
    .replace(/^\s*\d+\.\s+/gm, "") // numbered lists
    .replace(/>\s+/g, "") // blockquotes
    .replace(/\n{2,}/g, " ") // multiple newlines
    .trim();
}

export default function ForumPostCard({
  post,
  onPostDeleted,
  isTeacherOrAdmin,
}: ForumPostCardProps) {
  const router = useRouter();
  const [localPost, setLocalPost] = useState(post);
  const [voting, setVoting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (voting) return;

    try {
      setVoting(true);
      const response = await forumService.votePost(localPost.id, voteType);

      // Update local state
      setLocalPost({
        ...localPost,
        upvotes: response.data.upvotes,
        downvotes: response.data.downvotes,
        score: response.data.new_score,
        current_user_vote:
          localPost.current_user_vote === voteType ? undefined : voteType,
      });
    } catch {
      toast.error("Không thể vote");
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await forumService.deletePost(localPost.id);
      toast.success("Đã xóa bài viết");
      onPostDeleted();
    } catch {
      toast.error("Không thể xóa bài viết");
    }
  };

  const handlePin = async () => {
    try {
      await forumService.pinPost(localPost.id, !localPost.is_pinned);
      setLocalPost({ ...localPost, is_pinned: !localPost.is_pinned });
      toast.success(localPost.is_pinned ? "Đã bỏ ghim" : "Đã ghim bài viết");
    } catch {
      toast.error("Không thể thực hiện");
    }
  };

  const handleLock = async () => {
    try {
      await forumService.lockPost(localPost.id, !localPost.is_locked);
      setLocalPost({ ...localPost, is_locked: !localPost.is_locked });
      toast.success(
        localPost.is_locked ? "Đã mở khóa" : "Đã khóa bài viết"
      );
    } catch {
      toast.error("Không thể thực hiện");
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0) return "text-green-600";
    if (score < 0) return "text-red-600";
    return "text-slate-500 dark:text-slate-400";
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 hover:shadow-md transition-all cursor-pointer ${
        localPost.is_pinned
          ? "border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
          : "border-slate-200 dark:border-slate-800"
      }`}
      onClick={() => router.push(`/lms/forums/posts/${localPost.id}`)}
    >
      <div className="flex gap-6">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-2 min-w-[70px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote("upvote");
            }}
            disabled={voting}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              localPost.current_user_vote === "upvote"
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
          <span
            className={`text-lg font-bold ${getScoreColor(localPost.score)}`}
          >
            {localPost.score}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote("downvote");
            }}
            disabled={voting}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              localPost.current_user_vote === "downvote"
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Title and Badges */}
          <div className="flex items-start gap-2 mb-3">
            {localPost.is_pinned && (
              <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            )}
            {localPost.is_locked && (
              <Lock className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
            )}
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 hover:text-blue-600 dark:hover:text-blue-400 flex-1 transition-colors">
              {localPost.title}
            </h3>
          </div>

          {/* Body Preview - stripped markdown for performance */}
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
            {stripMarkdown(localPost.body)}
          </p>

          {/* Tags */}
          {localPost.tags && localPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {localPost.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{localPost.comment_count} câu trả lời</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{localPost.view_count} lượt xem</span>
            </div>
            <div className="flex-1" />
            <span>
              bởi{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                {localPost.user_name}
              </strong>
            </span>
            <span>
              {formatDistanceToNow(new Date(localPost.created_at), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        {isTeacherOrAdmin && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-20 min-w-[150px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePin();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <Pin className="w-4 h-4" />
                    {localPost.is_pinned ? "Bỏ ghim" : "Ghim bài viết"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLock();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    {localPost.is_locked ? "Mở khóa" : "Khóa bài viết"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}