"use client";

import { useState, useCallback } from "react";
import { latexService } from "@/services/latexService";
import type { LatexComment } from "@/types";

export function useComments(projectId: number) {
  const [comments, setComments] = useState<LatexComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFileComments = useCallback(async (fileId: number) => {
    if (!projectId || !fileId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await latexService.listFileComments(projectId, fileId);
      if (res.success && res.data) {
        setComments(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createComment = async (data: {
    file_id: number;
    content: string;
    selection_start?: number;
    selection_end?: number;
    selected_text?: string;
    parent_id?: number;
  }) => {
    const res = await latexService.createComment(projectId, data);
    if (res.success && res.data) {
      const newComment = res.data as LatexComment;
      if (newComment.parent_id) {
        // Add as reply to parent
        setComments((prev) =>
          prev.map((c) =>
            c.id === newComment.parent_id
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
          )
        );
      } else {
        setComments((prev) => [...prev, newComment]);
      }
      return newComment;
    }
    throw new Error(res.message || "Thêm bình luận thất bại");
  };

  const updateComment = async (commentId: number, content: string) => {
    const res = await latexService.updateComment(projectId, commentId, content);
    if (res.success && res.data) {
      const updated = res.data as LatexComment;
      setComments((prev) => updateCommentInTree(prev, commentId, updated));
      return updated;
    }
    throw new Error(res.message || "Cập nhật bình luận thất bại");
  };

  const deleteComment = async (commentId: number) => {
    const res = await latexService.deleteComment(projectId, commentId);
    if (res.success) {
      setComments((prev) => removeCommentFromTree(prev, commentId));
    } else {
      throw new Error(res.message || "Xóa bình luận thất bại");
    }
  };

  const resolveComment = async (commentId: number) => {
    const res = await latexService.resolveComment(projectId, commentId);
    if (res.success) {
      setComments((prev) =>
        updateCommentInTree(prev, commentId, { resolved: true } as Partial<LatexComment>)
      );
    } else {
      throw new Error(res.message || "Giải quyết bình luận thất bại");
    }
  };

  const unresolveComment = async (commentId: number) => {
    const res = await latexService.unresolveComment(projectId, commentId);
    if (res.success) {
      setComments((prev) =>
        updateCommentInTree(prev, commentId, { resolved: false } as Partial<LatexComment>)
      );
    } else {
      throw new Error(res.message || "Mở lại bình luận thất bại");
    }
  };

  return {
    comments,
    loading,
    error,
    loadFileComments,
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
    unresolveComment,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function updateCommentInTree(
  comments: LatexComment[],
  id: number,
  patch: Partial<LatexComment>
): LatexComment[] {
  return comments.map((c) => {
    if (c.id === id) return { ...c, ...patch };
    if (c.replies?.length) {
      return { ...c, replies: updateCommentInTree(c.replies, id, patch) };
    }
    return c;
  });
}

function removeCommentFromTree(comments: LatexComment[], id: number): LatexComment[] {
  return comments
    .filter((c) => c.id !== id)
    .map((c) => ({
      ...c,
      replies: c.replies ? removeCommentFromTree(c.replies, id) : undefined,
    }));
}
