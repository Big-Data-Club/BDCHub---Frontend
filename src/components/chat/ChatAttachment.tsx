"use client";

import { Download, FileText, Image as ImageIcon, Paperclip } from "lucide-react";
import { ChatAttachment as ChatAttachmentType } from "@/types/chat/chat";
import { getAttachmentBlob } from "@/services/chat/chatService";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Attachments never navigate or download from the card itself. This prevents
// accidental bulk downloads while people are reading a busy conversation.
export default function ChatAttachment({ attachment }: { attachment: ChatAttachmentType }) {
  const isImage = attachment.mimeType.startsWith("image/");

  const download = async () => {
    const blob = await getAttachmentBlob(attachment.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="mt-2 flex max-w-[min(28rem,100%)] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left dark:border-slate-700 dark:bg-slate-800/70">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400">
        {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      </div>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-700 dark:text-slate-200">{attachment.fileName}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{formatBytes(attachment.sizeBytes)}</span>
      </span>
      <button type="button" onClick={download} className="rounded-md p-2 text-slate-500 hover:bg-white hover:text-blue-600 dark:hover:bg-slate-900" title="Tải xuống" aria-label={`Tải xuống ${attachment.fileName}`}>
        <Download className="h-4 w-4" />
      </button>
      <Paperclip className="h-4 w-4 shrink-0 text-slate-400" />
    </div>
  );
}
