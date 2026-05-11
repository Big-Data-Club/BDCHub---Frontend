"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import forumService, {
  ForumPost,
  ForumComment,
} from "@/services/forumService";
import toast from "react-hot-toast";
import { useCurrentUser } from "./useCurrentUser";

/**
 * useForumPost — Optimistic state management for a forum post detail page.
 *
 * Key design decisions:
 * - Optimistic insert: new comments appear instantly (< 50ms)
 * - Background reconciliation: silent refetch after mutation to sync with server
 * - Debounced reconciliation: prevents rapid-fire refetches when multiple actions happen
 * - No blocking alerts: all feedback via react-hot-toast
 */
export function useForumPost(postId: number) {
  const { user } = useCurrentUser();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Track ongoing reconciliation to prevent duplicates
  const reconcileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const loadPost = useCallback(async () => {
    try {
      const response = await forumService.getPost(postId);
      setPost(response.data);
    } catch {
      toast.error("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const loadComments = useCallback(async () => {
    try {
      const response = await forumService.listComments(postId);
      setComments(response.data || []);
    } catch {
      // Silent fail on comment load — don't block the UI
    } finally {
      setCommentsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
    loadComments();

    return () => {
      if (reconcileTimerRef.current) {
        clearTimeout(reconcileTimerRef.current);
      }
    };
  }, [loadPost, loadComments]);

  // ─── Background Reconciliation ──────────────────────────────────────────────

  /**
   * Schedule a background refetch after a short delay.
   * This ensures the UI has the optimistic state first, then silently syncs.
   */
  const scheduleReconcile = useCallback(() => {
    if (reconcileTimerRef.current) {
      clearTimeout(reconcileTimerRef.current);
    }
    reconcileTimerRef.current = setTimeout(() => {
      loadComments();
      loadPost(); // refresh comment_count etc.
    }, 300);
  }, [loadComments, loadPost]);

  // ─── Optimistic Helpers ─────────────────────────────────────────────────────

  const buildOptimisticComment = useCallback(
    (body: string, parentCommentId?: number): ForumComment => ({
      id: -Date.now(), // Temporary negative ID, will be replaced on reconcile
      post_id: postId,
      parent_comment_id: parentCommentId,
      user_id: Number(user?.id ?? 0),
      user_name: user?.name || user?.email || "Bạn",
      user_email: user?.email || "",
      body,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      is_accepted: false,
      depth: parentCommentId ? 1 : 0,
      replies: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    [postId, user]
  );

  /**
   * Insert a comment into the nested comment tree.
   * If parentId is provided, find the parent and append to its replies.
   * Otherwise, append to root level.
   */
  const insertCommentInTree = useCallback(
    (
      tree: ForumComment[],
      newComment: ForumComment,
      parentId?: number
    ): ForumComment[] => {
      if (!parentId) {
        return [...tree, newComment];
      }

      return tree.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment],
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: insertCommentInTree(comment.replies, newComment, parentId),
          };
        }
        return comment;
      });
    },
    []
  );

  /**
   * Remove a comment from the nested comment tree by ID.
   */
  const removeCommentFromTree = useCallback(
    (tree: ForumComment[], commentId: number): ForumComment[] => {
      return tree
        .filter((c) => c.id !== commentId)
        .map((c) => ({
          ...c,
          replies: c.replies
            ? removeCommentFromTree(c.replies, commentId)
            : [],
        }));
    },
    []
  );

  /**
   * Update a comment in the nested comment tree.
   */
  const updateCommentInTree = useCallback(
    (
      tree: ForumComment[],
      commentId: number,
      updater: (c: ForumComment) => ForumComment
    ): ForumComment[] => {
      return tree.map((c) => {
        if (c.id === commentId) {
          return updater(c);
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: updateCommentInTree(c.replies, commentId, updater),
          };
        }
        return c;
      });
    },
    []
  );

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const submitComment = useCallback(
    async (body: string) => {
      const optimistic = buildOptimisticComment(body);

      // 1. Optimistic insert
      setComments((prev) => [...prev, optimistic]);
      setPost((prev) =>
        prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev
      );

      try {
        // 2. Server call
        await forumService.createComment(postId, { body });
        toast.success("Đã thêm câu trả lời!");

        // 3. Background reconcile
        scheduleReconcile();
      } catch (error: any) {
        // Rollback optimistic insert
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        setPost((prev) =>
          prev ? { ...prev, comment_count: prev.comment_count - 1 } : prev
        );
        toast.error(
          error.response?.data?.error || "Không thể thêm câu trả lời"
        );
      }
    },
    [postId, buildOptimisticComment, scheduleReconcile]
  );

  const submitReply = useCallback(
    async (parentCommentId: number, body: string) => {
      const optimistic = buildOptimisticComment(body, parentCommentId);

      // 1. Optimistic insert into nested tree
      setComments((prev) =>
        insertCommentInTree(prev, optimistic, parentCommentId)
      );
      setPost((prev) =>
        prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev
      );

      try {
        // 2. Server call
        await forumService.createComment(postId, {
          body,
          parent_comment_id: parentCommentId,
        });
        toast.success("Đã thêm phản hồi!");

        // 3. Background reconcile
        scheduleReconcile();
      } catch (error: any) {
        // Rollback
        setComments((prev) => removeCommentFromTree(prev, optimistic.id));
        setPost((prev) =>
          prev ? { ...prev, comment_count: prev.comment_count - 1 } : prev
        );
        toast.error(error.response?.data?.error || "Không thể thêm phản hồi");
      }
    },
    [
      postId,
      buildOptimisticComment,
      insertCommentInTree,
      removeCommentFromTree,
      scheduleReconcile,
    ]
  );

  const votePost = useCallback(
    async (voteType: "upvote" | "downvote") => {
      if (!post) return;

      const previousVote = post.current_user_vote;
      const newVote = previousVote === voteType ? undefined : voteType;

      // Optimistic update
      setPost((prev) =>
        prev ? { ...prev, current_user_vote: newVote } : prev
      );

      try {
        const response = await forumService.votePost(post.id, voteType);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                upvotes: response.data.upvotes,
                downvotes: response.data.downvotes,
                score: response.data.new_score,
                current_user_vote: newVote,
              }
            : prev
        );
      } catch {
        // Rollback
        setPost((prev) =>
          prev ? { ...prev, current_user_vote: previousVote } : prev
        );
        toast.error("Không thể vote");
      }
    },
    [post]
  );

  const voteComment = useCallback(
    async (commentId: number, voteType: "upvote" | "downvote") => {
      try {
        const response = await forumService.voteComment(commentId, voteType);
        setComments((prev) =>
          updateCommentInTree(prev, commentId, (c) => ({
            ...c,
            upvotes: response.data.upvotes,
            downvotes: response.data.downvotes,
            score: response.data.new_score,
            current_user_vote:
              c.current_user_vote === voteType ? undefined : voteType,
          }))
        );
      } catch {
        toast.error("Không thể vote");
      }
    },
    [updateCommentInTree]
  );

  const deletePost = useCallback(async () => {
    try {
      await forumService.deletePost(postId);
      toast.success("Đã xóa bài viết");
      return true; // Signal to navigate away
    } catch {
      toast.error("Không thể xóa bài viết");
      return false;
    }
  }, [postId]);

  const deleteComment = useCallback(
    async (commentId: number) => {
      // Optimistic removal
      setComments((prev) => removeCommentFromTree(prev, commentId));
      setPost((prev) =>
        prev ? { ...prev, comment_count: Math.max(0, prev.comment_count - 1) } : prev
      );

      try {
        await forumService.deleteComment(commentId);
        toast.success("Đã xóa");
        scheduleReconcile();
      } catch {
        // Rollback — full refetch since tree manipulation is complex
        toast.error("Không thể xóa");
        loadComments();
        loadPost();
      }
    },
    [removeCommentFromTree, scheduleReconcile, loadComments, loadPost]
  );

  const editComment = useCallback(
    async (commentId: number, newBody: string) => {
      // Optimistic update
      setComments((prev) =>
        updateCommentInTree(prev, commentId, (c) => ({
          ...c,
          body: newBody,
          updated_at: new Date().toISOString(),
        }))
      );

      try {
        await forumService.updateComment(commentId, newBody);
        toast.success("Đã cập nhật!");
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Không thể cập nhật");
        loadComments(); // Rollback via refetch
      }
    },
    [updateCommentInTree, loadComments]
  );

  const acceptComment = useCallback(
    async (commentId: number) => {
      // Optimistic update
      setComments((prev) =>
        updateCommentInTree(prev, commentId, (c) => ({
          ...c,
          is_accepted: true,
        }))
      );

      try {
        await forumService.acceptComment(commentId);
        toast.success("Đã đánh dấu là câu trả lời được chấp nhận!");
        scheduleReconcile();
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Không thể thực hiện");
        loadComments(); // Rollback
      }
    },
    [updateCommentInTree, scheduleReconcile, loadComments]
  );

  return {
    // State
    post,
    comments,
    loading,
    commentsLoading,

    // Post mutations
    votePost,
    deletePost,

    // Comment mutations (all optimistic)
    submitComment,
    submitReply,
    voteComment,
    deleteComment,
    editComment,
    acceptComment,
  };
}
