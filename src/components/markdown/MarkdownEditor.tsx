"use client";

import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useMarkdownImage } from '@/hooks/common/useMarkdownImage';
import { useTheme } from 'next-themes';
import MarkdownRenderer from './MarkdownRenderer';

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
  const { resolvedTheme } = useTheme();

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
    <div className="w-full" data-color-mode={resolvedTheme === 'dark' ? 'dark' : 'light'}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="grid min-w-0 gap-3 xl:grid-cols-2">
        <div
          onPaste={handlePaste}
          className={`min-w-0 overflow-hidden rounded-xl border transition-all focus-within:ring-2 focus-within:ring-blue-500/20 ${
            error ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'
          }`}
        >
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
            Markdown
          </div>
          <MDEditor
            value={value}
            onChange={(val) => onChange(val || '')}
            preview="edit"
            height={430}
            visibleDragbar={false}
            hideToolbar={disabled}
            textareaProps={{
              disabled: disabled || uploading,
              placeholder: placeholder || 'Nhập nội dung bài học... (Hỗ trợ Markdown)',
            }}
            className="font-sans !rounded-none !border-0 !shadow-none"
          />
        </div>

        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#0B1729]">
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
            Xem trước · giống hệt màn học
          </div>
          <div className="h-[430px] overflow-auto p-5">
            <MarkdownRenderer content={value} />
          </div>
        </section>
      </div>

      {/* Error / Loading Indicators */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          {error}
        </p>
      )}
      
      {uploadError && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1.5 font-medium">
          ⚠️ <span>Lỗi tải ảnh: {uploadError}</span>
        </p>
      )}

      {uploading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium animate-pulse">
          <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          Đang tải ảnh lên hệ thống...
        </div>
      )}

      {/* Help text */}
      <div className="flex justify-between items-center mt-2.5">
        <p className="text-[11px] text-gray-400 dark:text-slate-500">
          💡 <strong>Mẹo:</strong> Dán ảnh trực tiếp từ clipboard để tự động tải lên.
        </p>
        <p className="text-[11px] text-gray-400 dark:text-slate-500">
          Hỗ trợ: **đậm**, *nghiêng*, `code`, [liên kết](url), # Tiêu đề, $math$, v.v.
        </p>
      </div>
    </div>
  );
}
