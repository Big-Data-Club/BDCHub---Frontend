"use client";

import { ForumComment } from "@/services/forumService";
import ForumCommentItem from "./ForumCommentItem";

interface ForumCommentSectionProps {
  postId: number;
  comments: ForumComment[];
  onSubmitReply: (parentCommentId: number, body: string) => Promise<void>;
  onVoteComment: (commentId: number, voteType: "upvote" | "downvote") => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onEditComment: (commentId: number, newBody: string) => Promise<void>;
  onAcceptComment: (commentId: number) => Promise<void>;
  isPostLocked: boolean;
  isTeacherOrAdmin: boolean;
  postOwnerId: number;
}

export default function ForumCommentSection({
  postId,
  comments,
  onSubmitReply,
  onVoteComment,
  onDeleteComment,
  onEditComment,
  onAcceptComment,
  isPostLocked,
  isTeacherOrAdmin,
  postOwnerId,
}: ForumCommentSectionProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>Chưa có câu trả lời nào</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Hãy là người đầu tiên trả lời!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <ForumCommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          onSubmitReply={onSubmitReply}
          onVoteComment={onVoteComment}
          onDeleteComment={onDeleteComment}
          onEditComment={onEditComment}
          onAcceptComment={onAcceptComment}
          isPostLocked={isPostLocked}
          isTeacherOrAdmin={isTeacherOrAdmin}
          postOwnerId={postOwnerId}
          depth={0}
        />
      ))}
    </div>
  );
}