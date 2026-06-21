import React, { useState, useRef } from "react";
import { X, Upload, FileArchive, CheckCircle } from "lucide-react";

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadFiles: (files: File[]) => Promise<void>;
  onUploadZip: (file: File) => Promise<void>;
}

export function FileUploadModal({ open, onClose, onUploadFiles, onUploadZip }: FileUploadModalProps) {
  const [tab, setTab] = useState<"files" | "zip">("files");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [filesSelected, setFilesSelected] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      if (tab === "zip") {
        setFilesSelected(droppedFiles.slice(0, 1));
      } else {
        setFilesSelected(droppedFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (tab === "zip") {
        setFilesSelected(selected.slice(0, 1));
      } else {
        setFilesSelected(selected);
      }
    }
  };

  const handleUpload = async () => {
    if (filesSelected.length === 0) return;
    setUploading(true);
    try {
      if (tab === "zip") {
        await onUploadZip(filesSelected[0]);
      } else {
        await onUploadFiles(filesSelected);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFilesSelected([]);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Tải tài liệu lên</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setTab("files");
              setFilesSelected([]);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all duration-200 ${
              tab === "files"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Tải tệp tin
          </button>
          <button
            onClick={() => {
              setTab("zip");
              setFilesSelected([]);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all duration-200 ${
              tab === "zip"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Tải lưu trữ ZIP
          </button>
        </div>

        {/* Dropzone */}
        <div className="p-6 space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <CheckCircle size={48} className="text-emerald-500 animate-bounce" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tải lên thành công!
              </span>
            </div>
          ) : (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/10"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple={tab === "files"}
                  accept={tab === "zip" ? ".zip" : "*"}
                  className="hidden"
                />

                {tab === "zip" ? (
                  <FileArchive size={36} className="text-blue-500 mb-3" />
                ) : (
                  <Upload size={36} className="text-blue-500 mb-3" />
                )}

                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Kéo và thả tệp vào đây, hoặc <span className="text-blue-500">duyệt tệp</span>
                </span>
                <span className="text-xs text-slate-400 mt-1.5">
                  {tab === "zip" ? "Chỉ hỗ trợ tệp .zip (tự động giải nén)" : "Hỗ trợ nhiều loại tệp .tex, .png, .jpg..."}
                </span>
              </div>

              {filesSelected.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Danh sách đã chọn:
                  </span>
                  <div className="max-h-24 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-2 space-y-1 bg-slate-50 dark:bg-slate-900/60">
                    {filesSelected.map((f, i) => (
                      <div key={i} className="text-xs text-slate-700 dark:text-slate-300 truncate">
                        {f.name} ({parseFloat((f.size / 1024).toFixed(1))} KB)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {!success && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <button
              onClick={onClose}
              disabled={uploading}
              className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl px-4 py-2 text-sm active:scale-95 transition-all duration-200"
            >
              Hủy
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || filesSelected.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-semibold rounded-xl px-4 py-2 text-sm shadow-sm active:scale-95 transition-all duration-200"
            >
              {uploading ? "Đang tải..." : "Tải lên"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
