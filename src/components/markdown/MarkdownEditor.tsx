"use client";

import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useMarkdownImage } from '@/hooks/useMarkdownImage';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
}: MarkdownEditorProps) {
  const { uploadImage, uploading } = useMarkdownImage();
  const [uploadError, setUploadError] = useState<string>('');

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        // Prevent default only if it's an image
        e.preventDefault();
        
        try {
          const file = item.getAsFile();
          if (!file) return;

          const imageUrl = await uploadImage(file);
          // Insert the image markdown at the current position or just append
          // Here we just append to the content
          const imageMarkdown = `![image](${imageUrl})`;
          onChange(value + (value.endsWith('\n') ? '' : '\n') + imageMarkdown + '\n');
          setUploadError('');
        } catch (err: any) {
          setUploadError(err.message);
        }
      }
    }
  };

  return (
    <div className="w-full" data-color-mode="light">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div
        onPaste={handlePaste}
        className={`border rounded-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-500/20 ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}
      >
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview="live"
          height={350}
          visibleDragbar={false}
          hideToolbar={disabled}
          textareaProps={{
            disabled: disabled || uploading,
            placeholder: placeholder || 'Nhập nội dung bài học... (Hỗ trợ Markdown)',
          }}
          previewOptions={{
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          }}
          className="font-sans"
        />
      </div>

      {/* Error / Loading Indicators */}
      {error && (
        <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          {error}
        </p>
      )}
      
      {uploadError && (
        <p className="text-sm text-amber-600 mt-1.5 flex items-center gap-1.5 font-medium">
          ⚠️ <span>Lỗi tải ảnh: {uploadError}</span>
        </p>
      )}

      {uploading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 font-medium animate-pulse">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Đang tải ảnh lên hệ thống...
        </div>
      )}

      {/* Help text */}
      <div className="flex justify-between items-center mt-2.5">
        <p className="text-[11px] text-gray-400">
          💡 <strong>Mẹo:</strong> Dán ảnh trực tiếp từ clipboard để tự động tải lên.
        </p>
        <p className="text-[11px] text-gray-400">
          Hỗ trợ: **đậm**, *nghiêng*, `code`, [liên kết](url), # Tiêu đề, $math$, v.v.
        </p>
      </div>
    </div>
  );
}
