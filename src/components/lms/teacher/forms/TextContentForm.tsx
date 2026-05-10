"use client";

import MarkdownEditor from "@/components/markdown/MarkdownEditor";
import type { ContentFormProps } from "@/types";

/**
 * TextContentForm
 *
 * Renders a MarkdownEditor for content of type TEXT.
 * Stores the markdown string in metadata.content.
 */
export function TextContentForm({ formData, onChange, disabled }: ContentFormProps) {
  const content = (formData.metadata?.content as string) ?? "";

  const handleChange = (value: string) => {
    onChange({ metadata: { ...formData.metadata, content: value } });
  };

  return (
    <MarkdownEditor
      label="Nội dung văn bản *"
      value={content}
      onChange={handleChange}
      placeholder="Nhập nội dung bài học… (hỗ trợ Markdown)"
    />
  );
}
