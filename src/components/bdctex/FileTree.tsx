import React from "react";
import { Folder, FolderOpen, FileText, Image, Trash2, Plus } from "lucide-react";
import type { LatexFile } from "@/types";

interface FileTreeProps {
  files: LatexFile[];
  activeFile: LatexFile | null;
  onSelect: (file: LatexFile) => void;
  onDelete?: (id: number) => void;
  onUploadClick?: () => void;
}

export function FileTree({ files, activeFile, onSelect, onDelete, onUploadClick }: FileTreeProps) {
  // Determine icon based on filename extension
  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) {
      return <Image size={16} className="text-emerald-500" />;
    }
    return <FileText size={16} className="text-blue-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50 uppercase tracking-wider">
          Tài liệu dự án
        </h4>
        <button
          onClick={onUploadClick}
          className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg active:scale-95 transition-all duration-200"
          title="Tải lên file / ZIP"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">Không có tệp nào.</p>
          </div>
        ) : (
          files.map((file) => {
            const isActive = activeFile?.id === file.id;
            return (
              <div
                key={file.id}
                onClick={() => onSelect(file)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {getFileIcon(file.filename)}
                  <div className="overflow-hidden">
                    <span className="text-sm truncate block" title={file.filename}>
                      {file.filename}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      {formatSize(file.file_size)}
                    </span>
                  </div>
                </div>

                {/* Delete button (hidden by default, shown on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Bạn có chắc chắn muốn xóa tệp "${file.filename}"?`)) {
                      onDelete(file.id);
                    }
                  }}
                  className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 active:scale-95"
                  title="Xóa tệp"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
