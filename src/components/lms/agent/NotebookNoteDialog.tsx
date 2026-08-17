"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Save, Edit3, Loader2, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

interface NoteData {
  id?: string;
  title: string;
  content: string;
  created_at?: string;
}

interface NotebookNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "create" | "edit";
  note?: NoteData;
  onSave?: (title: string, content: string) => Promise<void>;
  saving?: boolean;
}

export function NotebookNoteDialog({
  isOpen,
  onOpenChange,
  mode: initialMode,
  note,
  onSave,
  saving = false,
}: NotebookNoteDialogProps) {
  const [mode, setMode] = useState<"view" | "create" | "edit">(initialMode);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Sync state with note prop
  useEffect(() => {
    setMode(initialMode);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note, initialMode, isOpen]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !onSave) return;
    try {
      await onSave(title, content);
      onOpenChange(false);
    } catch (err) {
      console.error("Lỗi khi lưu ghi chú:", err);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl p-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {mode === "create" ? "Tạo ghi chú mới" : mode === "edit" ? "Chỉnh sửa ghi chú" : "Chi tiết ghi chú"}
            </span>
          </div>
          {mode === "view" ? (
            <>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                {title || "Không có tiêu đề"}
              </DialogTitle>
              {note?.created_at && (
                <DialogDescription className="flex items-center text-xs text-slate-400 dark:text-slate-500 gap-1.5 mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Ghi vào {formatDate(note.created_at)}
                </DialogDescription>
              )}
            </>
          ) : (
            <>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                {mode === "create" ? "Thêm ghi chú vào Notebook" : "Cập nhật ghi chú"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 dark:text-slate-500">
                Ghi nhanh điều bạn muốn nhớ. Có thể dùng định dạng Markdown.
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {mode === "view" ? (
            <div className="text-slate-800 dark:text-slate-200 prose prose-slate dark:prose-invert max-w-none pb-4">
              <MarkdownRenderer content={content} />
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tiêu đề</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề ghi chú..."
                  maxLength={180}
                  className="rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all duration-200"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nội dung</label>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Hỗ trợ Markdown</span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung ghi chú..."
                  className="min-h-[250px] w-full resize-y rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all duration-200 outline-none"
                  maxLength={100000}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 mt-auto">
          {mode === "view" ? (
            <>
              {onSave && (
                <Button
                  onClick={() => setMode("edit")}
                  variant="outline"
                  className="rounded-xl px-4 border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold active:scale-95 transition-all"
                >
                  <Edit3 className="w-4 h-4 mr-1.5" />
                  Sửa
                </Button>
              )}
              <Button
                onClick={() => onOpenChange(false)}
                className="rounded-xl px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm active:scale-95 transition-all duration-200"
              >
                Đóng
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  if (initialMode === "view") {
                    setMode("view");
                  } else {
                    onOpenChange(false);
                  }
                }}
                className="rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim() || saving}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold px-5 active:scale-95 transition-all shadow-sm flex items-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-4 w-4" />
                    Lưu ghi chú
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
