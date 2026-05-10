"use client";

import { CheckCircle } from "lucide-react";
import FileUpload from "@/components/lms/teacher/upload/FileUpload";
import { FileInfo } from "@/types";
import type { ContentFormProps } from "@/types";

// ─── Shared upload success badge ──────────────────────────────────────────────

function UploadSuccess({ fileName, fileSize }: { fileName: string; fileSize?: number }) {
  const mb = fileSize ? (fileSize / (1024 * 1024)).toFixed(1) : null;
  return (
    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
          Đã upload thành công
        </p>
        <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
          {fileName}{mb ? ` · ${mb} MB` : ""}
        </p>
      </div>
    </div>
  );
}

// ─── DocumentContentForm ──────────────────────────────────────────────────────

/**
 * DocumentContentForm
 *
 * Renders a file upload control for DOCUMENT type content (PDF, Word, Excel…).
 */
export function DocumentContentForm({ formData, onChange, onFileUploaded, disabled }: ContentFormProps) {
  const uploaded = !!formData.metadata?.file_path;

  const handleFileUploaded = (fileInfo: FileInfo) => {
    onFileUploaded(fileInfo);
    onChange({
      metadata: {
        ...formData.metadata,
        file_path: fileInfo.file_path,
        file_name: fileInfo.file_name,
        file_size: fileInfo.file_size,
        file_id:   fileInfo.file_id,
        document_type: "uploaded",
      },
    });
    if (!formData.title) onChange({ title: fileInfo.file_name });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Tải lên tài liệu *
      </label>
      {uploaded ? (
        <UploadSuccess
          fileName={formData.metadata?.file_name ?? ""}
          fileSize={formData.metadata?.file_size}
        />
      ) : (
        <FileUpload fileType="document" onFileUploaded={handleFileUploaded} />
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Định dạng: PDF, Word, Excel, PowerPoint, CSV, TXT
      </p>
    </div>
  );
}

// ─── ImageContentForm ─────────────────────────────────────────────────────────

/**
 * ImageContentForm
 *
 * Supports both file upload and external URL for IMAGE type content.
 */
export function ImageContentForm({ formData, onChange, onFileUploaded, disabled }: ContentFormProps) {
  const uploaded   = !!formData.metadata?.file_path;
  const hasExtUrl  = !!formData.metadata?.image_url;

  const handleFileUploaded = (fileInfo: FileInfo) => {
    onFileUploaded(fileInfo);
    onChange({
      metadata: {
        ...formData.metadata,
        file_path:  fileInfo.file_path,
        file_name:  fileInfo.file_name,
        file_size:  fileInfo.file_size,
        file_id:    fileInfo.file_id,
        image_type: "uploaded",
      },
    });
    if (!formData.title) onChange({ title: fileInfo.file_name });
  };

  const handleUrlChange = (url: string) => {
    onChange({
      metadata: { ...formData.metadata, image_url: url, image_type: "external" },
    });
  };

  return (
    <div className="space-y-4">
      {/* File upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Upload hình ảnh
        </label>
        {uploaded ? (
          <UploadSuccess
            fileName={formData.metadata?.file_name ?? ""}
            fileSize={formData.metadata?.file_size}
          />
        ) : (
          <FileUpload
            fileType="image"
            onFileUploaded={handleFileUploaded}
            disabled={disabled || hasExtUrl}
          />
        )}
      </div>

      {/* OR external URL */}
      {!uploaded && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              hoặc
            </span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
          </div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            URL hình ảnh từ internet
          </label>
          <input
            type="url"
            value={formData.metadata?.image_url ?? ""}
            onChange={e => handleUrlChange(e.target.value)}
            disabled={disabled}
            placeholder="https://example.com/image.jpg"
            className="
              w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl
              bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
              placeholder:text-slate-400 focus:outline-none focus:ring-2
              focus:ring-blue-500/20 focus:border-blue-500 transition-all
            "
          />
        </div>
      )}
    </div>
  );
}
