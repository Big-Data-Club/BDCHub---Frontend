"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FolderPlus, FolderEdit, X, Loader2, Tag, AlignLeft, Hash, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import lmsService from "@/services/lmsService";
import { Section } from "@/types";

export interface SectionModalProps {
  courseId: number;
  section: Section | null;
  onClose: () => void;
  onSuccess: (section: Section) => void;
  existingSections: Section[];
}

export function SectionModal({
  courseId,
  section,
  onClose,
  onSuccess,
  existingSections,
}: SectionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: section?.title || "",
    description: section?.description || "",
    order_index: section?.order_index ?? existingSections.length + 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mount check & scroll lock & escape listener
  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tên chương học.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let savedSection: Section;

      if (section) {
        await lmsService.updateSection(section.id, formData);
        savedSection = { ...section, ...formData };
      } else {
        const response = await lmsService.createSection(courseId, formData);
        savedSection = response.data as Section;
      }

      onSuccess(savedSection);
    } catch (err: any) {
      console.error("Save section error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Có lỗi xảy ra khi lưu thông tin chương học."
      );
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(section);

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 dark:border-blue-500/10 bg-slate-50/50 dark:bg-[#070E1C]/40">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-cyan-400 shrink-0">
              {isEditing ? (
                <FolderEdit className="w-5 h-5" />
              ) : (
                <FolderPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? "Chỉnh sửa chương học" : "Tạo chương mới"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEditing
                  ? "Cập nhật thông tin chi tiết và vị trí của chương học"
                  : "Tạo chương mới để sắp xếp các bài học và tài liệu"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 dark:text-red-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Tên chương */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Tên chương</span>
              <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (error) setError(null);
              }}
              placeholder="VD: Chương 1: Tổng quan về Khoa học Dữ liệu"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all duration-200 text-sm"
              required
              autoFocus
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <AlignLeft className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Mô tả chương</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập tóm tắt nội dung chính hoặc mục tiêu học tập của chương..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all duration-200 text-sm resize-none"
            />
          </div>

          {/* Thứ tự */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Thứ tự xuất hiện</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order_index: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                className="w-32 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all duration-200 text-sm font-medium"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Thứ tự trong danh sách khóa học (bắt đầu từ 1)
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-blue-500/10 mt-6">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-sm active:scale-[0.98] transition-all"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? "Cập nhật chương" : "Tạo chương mới"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
