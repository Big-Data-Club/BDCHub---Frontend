"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, Trash2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { CloudinaryFile } from "../types";

interface FileUploadCloudinaryProps {
  label: string;
  hint?: string;
  accept?: string;
  maxSizeMB?: number;
  folder?: string;
  value?: CloudinaryFile | null;
  values?: CloudinaryFile[];
  isMulti?: boolean;
  maxFiles?: number;
  onChange?: (file: CloudinaryFile | null) => void;
  onMultiChange?: (files: CloudinaryFile[]) => void;
  error?: string;
  required?: boolean;
}

export const FileUploadCloudinary: React.FC<FileUploadCloudinaryProps> = ({
  label,
  hint,
  accept = "application/pdf,image/png,image/jpeg",
  maxSizeMB = 10,
  folder = "bdc_recruitment_2026",
  value = null,
  values = [],
  isMulti = false,
  maxFiles = 5,
  onChange,
  onMultiChange,
  error,
  required = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const uploadFileToCloudinary = async (fileToUpload: File): Promise<CloudinaryFile | null> => {
    if (fileToUpload.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`File vượt quá dung lượng tối đa ${maxSizeMB}MB.`);
      return null;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload-cloudinary", {
        method: "POST",
        body: formData,
      });

      // Read as text first — avoids crashing when server returns HTML (e.g. 502/504 nginx page)
      const rawText = await res.text();
      let data: { success?: boolean; message?: string; url?: string; publicId?: string; filename?: string; size?: number } = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        // Server returned non-JSON (HTML error page, gateway timeout, etc.)
        console.error("Upload: server returned non-JSON response:", res.status, rawText.slice(0, 300));
        throw new Error(
          res.status === 413
            ? "File quá lớn — server từ chối nhận (413)."
            : `Lỗi server (${res.status}): không nhận được phản hồi hợp lệ. Vui lòng thử lại.`
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Upload thất bại (HTTP ${res.status}).`);
      }

      return {
        url: data.url ?? "",
        filename: data.filename || fileToUpload.name,
        publicId: data.publicId,
        size: data.size || fileToUpload.size,
      };
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Lỗi khi kết nối server Cloudinary.");
      return null;
    } finally {
      setUploading(false);
    }
  };


  const handleFileSelect = async (filesToProcess: FileList | null) => {
    if (!filesToProcess || filesToProcess.length === 0) return;

    if (!isMulti) {
      const fileObj = filesToProcess[0];
      const uploaded = await uploadFileToCloudinary(fileObj);
      if (uploaded && onChange) {
        onChange(uploaded);
      }
    } else {
      if (values.length >= maxFiles) {
        setUploadError(`Chỉ được tải lên tối đa ${maxFiles} file.`);
        return;
      }

      const availableSlots = maxFiles - values.length;
      const filesArray = Array.from(filesToProcess).slice(0, availableSlots);

      const newUploadedFiles: CloudinaryFile[] = [];
      for (const fileObj of filesArray) {
        const uploaded = await uploadFileToCloudinary(fileObj);
        if (uploaded) {
          newUploadedFiles.push(uploaded);
        }
      }

      if (newUploadedFiles.length > 0 && onMultiChange) {
        onMultiChange([...values, ...newUploadedFiles]);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemoveSingle = () => {
    if (onChange) onChange(null);
    setUploadError(null);
  };

  const handleRemoveMulti = (index: number) => {
    if (onMultiChange) {
      const next = values.filter((_, i) => i !== index);
      onMultiChange(next);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {isMulti && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {values.length}/{maxFiles} file
          </span>
        )}
      </div>

      {hint && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{hint}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={isMulti}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drag & drop dropzone if single file not uploaded OR multi file under max */}
      {(!isMulti && !value) || (isMulti && values.length < maxFiles) ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-cyan-400 bg-blue-50/80 dark:bg-cyan-500/10 shadow-[0_0_25px_rgba(34,211,238,0.2)]"
              : error
              ? "border-rose-400/80 dark:border-rose-500/80 bg-rose-50/50 dark:bg-rose-950/20"
              : "border-slate-300 dark:border-blue-500/20 bg-slate-50/80 dark:bg-[#0D192E] hover:border-blue-500 dark:hover:border-cyan-400/50 hover:bg-white dark:hover:bg-[#0F1E35] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-500 dark:text-cyan-400 animate-spin" />
              <p className="text-sm text-blue-600 dark:text-cyan-300 font-semibold">Đang tải file lên hệ thống Cloudinary...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2.5">
              <div className="p-3.5 bg-blue-100/70 dark:bg-cyan-500/10 rounded-2xl text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20 shadow-sm">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-200">
                <span className="font-bold text-blue-600 dark:text-cyan-400 hover:underline">Nhấp để chọn file</span> hoặc kéo thả file vào đây
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">Định dạng hỗ trợ: PDF, PNG, JPG, JPEG (Tối đa {maxSizeMB}MB)</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Upload error display */}
      {(uploadError || error) && (
        <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError || error}</span>
        </div>
      )}

      {/* Single File Uploaded Preview */}
      {!isMulti && value && (
        <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-500/40 rounded-xl shadow-sm dark:shadow-lg group">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
              <FileText className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{value.filename}</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{formatBytes(value.size)}</span>
                <span className="text-blue-500 dark:text-blue-400 flex items-center gap-1">
                  Cloudinary Hosted <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={value.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
              title="Xem file"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={handleRemoveSingle}
              className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
              title="Xóa file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Multi File Uploaded List */}
      {isMulti && values.length > 0 && (
        <div className="space-y-2">
          {values.map((f, idx) => (
            <div
              key={f.url + idx}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 rounded-xl hover:border-slate-300 dark:hover:border-slate-600"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{f.filename}</span>
                {f.size && <span className="text-xs text-slate-500 dark:text-slate-400">({formatBytes(f.size)})</span>}
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-blue-400"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveMulti(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
