import { lmsApiClient } from "./lmsApiClient";

export interface ForumPost {
  id: number;
  content_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  score: number;
  comment_count: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  current_user_vote?: "upvote" | "downvote";
  created_at: string;
  updated_at: string;
}

export interface ForumComment {
  id: number;
  post_id: number;
  parent_comment_id?: number;
  user_id: number;
  user_name: string;
  user_email: string;
  body: string;
  upvotes: number;
  downvotes: number;
  score: number;
  is_accepted: boolean;
  depth: number;
  current_user_vote?: "upvote" | "downvote";
  replies?: ForumComment[];
  created_at: string;
  updated_at: string;
}

export interface CreatePostRequest {
  title: string;
  body: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  body: string;
  parent_comment_id?: number;
}

export interface VoteResponse {
  success: boolean;
  vote_type: string;
  new_score: number;
  upvotes: number;
  downvotes: number;
}

class ForumService {
  // ─── Posts ────────────────────────────────────────────────────────────────

  async createPost(contentId: number, data: CreatePostRequest) {
    const response = await lmsApiClient.post(
      `/content/${contentId}/forum/posts`,
      data
    );
    return response.data;
  }

  async listPosts(
    contentId: number,
    params?: {
      sort_by?: "votes" | "newest" | "oldest" | "views";
      search?: string;
      tags?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const response = await lmsApiClient.get(
      `/content/${contentId}/forum/posts`,
      { params }
    );
    return response.data;
  }

  async getPost(postId: number) {
    const response = await lmsApiClient.get(`/forum/posts/${postId}`);
    return response.data;
  }

  async updatePost(postId: number, data: Partial<CreatePostRequest>) {
    const response = await lmsApiClient.put(`/forum/posts/${postId}`, data);
    return response.data;
  }

  async deletePost(postId: number) {
    const response = await lmsApiClient.delete(`/forum/posts/${postId}`);
    return response.data;
  }

  async pinPost(postId: number, isPinned: boolean) {
    const response = await lmsApiClient.post(`/forum/posts/${postId}/pin`, {
      is_pinned: isPinned,
    });
    return response.data;
  }

  async lockPost(postId: number, isLocked: boolean) {
    const response = await lmsApiClient.post(`/forum/posts/${postId}/lock`, {
      is_locked: isLocked,
    });
    return response.data;
  }

  async votePost(postId: number, voteType: "upvote" | "downvote") {
    const response = await lmsApiClient.post(`/forum/posts/${postId}/vote`, {
      vote_type: voteType,
    });
    return response.data;
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  async createComment(postId: number, data: CreateCommentRequest) {
    const response = await lmsApiClient.post(
      `/forum/posts/${postId}/comments`,
      data
    );
    return response.data;
  }

  async listComments(postId: number) {
    const response = await lmsApiClient.get(`/forum/posts/${postId}/comments`);
    return response.data;
  }

  async updateComment(commentId: number, body: string) {
    const response = await lmsApiClient.put(`/forum/comments/${commentId}`, {
      body,
    });
    return response.data;
  }

  async deleteComment(commentId: number) {
    const response = await lmsApiClient.delete(`/forum/comments/${commentId}`);
    return response.data;
  }

  async acceptComment(commentId: number) {
    const response = await lmsApiClient.post(
      `/forum/comments/${commentId}/accept`
    );
    return response.data;
  }

  async voteComment(commentId: number, voteType: "upvote" | "downvote") {
    const response = await lmsApiClient.post(
      `/forum/comments/${commentId}/vote`,
      { vote_type: voteType }
    );
    return response.data;
  }
}

export const forumService = new ForumService();
export default forumService;