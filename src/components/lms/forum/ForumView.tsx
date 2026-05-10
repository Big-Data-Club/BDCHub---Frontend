"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import forumService, { ForumPost } from "@/services/forumService";
import ForumPostList from "./ForumPostList";
import ForumSearchBar from "./ForumSearchBar";
import ForumCreatePost from "./ForumCreatePost";
import { Plus } from "lucide-react";

interface ForumViewProps {
  contentId: number;
  isTeacherOrAdmin?: boolean;
}

export default function ForumView({ contentId, isTeacherOrAdmin = false }: ForumViewProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState<'votes' | 'newest' | 'oldest' | 'views'>('votes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPosts();
  }, [contentId, sortBy, searchTerm, selectedTags, page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await forumService.listPosts(contentId, {
        sort_by: sortBy,
        search: searchTerm,
        tags: selectedTags,
        page,
        limit: 20,
      });
      
      setPosts(response.data?.items || []);
      setTotalPages(response.data?.pagination?.total_pages || 1);
    } catch (error) {
      console.error("Error loading posts:", error);
      alert("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setShowCreateModal(false);
    setPage(1);
    loadPosts();
  };

  const handlePostDeleted = () => {
    loadPosts();
  };

  const handleSearch = (search: string, tags: string) => {
    setSearchTerm(search);
    setSelectedTags(tags);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Diễn đàn thảo luận</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Đặt câu hỏi mới
        </Button>
      </div>

      {/* Search and Filter */}
      <ForumSearchBar
        sortBy={sortBy}
        onSortChange={setSortBy}
        onSearch={handleSearch}
      />

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400">Chưa có bài viết nào</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Hãy là người đầu tiên đặt câu hỏi!</p>
        </div>
      ) : (
        <>
          <ForumPostList
            posts={posts}
            onPostDeleted={handlePostDeleted}
            isTeacherOrAdmin={isTeacherOrAdmin}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4 py-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </Button>
              <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                Trang {page} / {totalPages}
              </span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4 py-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <ForumCreatePost
          contentId={contentId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  );
}