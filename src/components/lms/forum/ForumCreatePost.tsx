"use client";

import { useState } from "react";
import forumService, { ForumPost } from "@/services/forumService";
import { ForumMarkdownEditor } from "./ForumMarkdownEditor";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface ForumCreatePostProps {
  contentId: number;
  onClose: () => void;
  onSuccess: (newPost?: ForumPost) => void;
}

export default function ForumCreatePost({
  contentId,
  onClose,
  onSuccess,
}: ForumCreatePostProps) {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 5) {
      newErrors.title = "Tiêu đề phải có ít nhất 5 ký tự";
    }
    if (!formData.body || formData.body.length < 10) {
      newErrors.body = "Nội dung phải có ít nhất 10 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const response = await forumService.createPost(contentId, {
        title: formData.title,
        body: formData.body,
        tags: tags.length > 0 ? tags : undefined,
      });

      toast.success("Đã tạo bài viết thành công!");
      onSuccess(response?.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Không thể tạo bài viết");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Đặt câu hỏi mới
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💡 Mẹo viết câu hỏi tốt:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Viết tiêu đề rõ ràng, súc tích</li>
              <li>• Mô tả chi tiết vấn đề bạn gặp phải</li>
              <li>
                • Hỗ trợ Markdown - dùng **đậm**, *nghiêng*, `code`,
                ```code block```
              </li>
              <li>• Thêm tags để dễ tìm kiếm</li>
            </ul>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="vd: Làm thế nào để sử dụng React Hooks?"
              className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all ${
                errors.title
                  ? "border-red-500 dark:border-red-500"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Body - Markdown Editor */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <ForumMarkdownEditor
              value={formData.body}
              onChange={(val) => setFormData({ ...formData, body: val })}
              placeholder="Mô tả chi tiết vấn đề của bạn... (Hỗ trợ Markdown)"
              rows={10}
              disabled={loading}
            />
            {errors.body && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.body}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formData.body.length} ký tự (tối thiểu 10)
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Tags (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="vd: javascript, react, hooks"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tối đa 5 tags, mỗi tag tối đa 50 ký tự
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo..." : "Đăng câu hỏi"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-all active:scale-95"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}