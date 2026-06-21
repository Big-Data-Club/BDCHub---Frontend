import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";
import type { CreateProjectRequest } from "@/types";

interface ProjectCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateProjectRequest) => Promise<void>;
}

export function ProjectCreateModal({ open, onClose, onCreate }: ProjectCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [compiler, setCompiler] = useState<"pdflatex" | "xelatex" | "lualatex">("pdflatex");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề dự án.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        compiler,
        template_id: templateId || undefined,
      });
      // Reset state
      setTitle("");
      setDescription("");
      setCompiler("pdflatex");
      setTemplateId(null);
      onClose();
    } catch (err: any) {
      setError(err.message || "Tạo dự án thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Plus size={20} className="text-blue-600" />
            Tạo dự án BDCTex mới
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-950 dark:text-slate-200">
              Tiêu đề dự án <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Báo cáo Khoa học Máy tính"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-900 dark:text-slate-50 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-950 dark:text-slate-200">
              Mô tả dự án
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả ngắn gọn..."
              rows={3}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-900 dark:text-slate-50 outline-none resize-none"
            />
          </div>

          {/* Compiler */}
          <div className="space-y-2">
            <label htmlFor="compiler" className="text-sm font-medium text-slate-950 dark:text-slate-200">
              Bộ biên dịch (LaTeX Engine)
            </label>
            <select
              id="compiler"
              value={compiler}
              onChange={(e) => setCompiler(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-900 dark:text-slate-50 outline-none"
            >
              <option value="pdflatex">PDFLaTeX (Mặc định, nhanh nhất)</option>
              <option value="xelatex">XeLaTeX (Hỗ trợ UTF-8 và system fonts tốt)</option>
              <option value="lualatex">LuaLaTeX (Hiện đại, linh hoạt)</option>
            </select>
          </div>

          {/* Template Selector */}
          <TemplateSelector selectedTemplateId={templateId} onSelect={setTemplateId} />
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl px-5 py-2.5 text-sm active:scale-95 transition-all duration-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl px-5 py-2.5 text-sm shadow-sm active:scale-95 transition-all duration-200"
          >
            {submitting ? "Đang tạo..." : "Tạo dự án"}
          </button>
        </div>
      </div>
    </div>
  );
}
