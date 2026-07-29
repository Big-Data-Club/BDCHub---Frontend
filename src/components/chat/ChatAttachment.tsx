"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Image as ImageIcon, Loader2, Paperclip } from "lucide-react";
import { ChatAttachment as ChatAttachmentType } from "@/types/chat";
import { getAttachmentBlob } from "@/services/chatService";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatAttachment({ attachment }: { attachment: ChatAttachmentType }) {
  const isImage = attachment.mimeType.startsWith("image/");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(isImage);

  useEffect(() => {
    if (!isImage) return;
    let currentUrl: string | null = null;
    getAttachmentBlob(attachment.id)
      .then((blob) => {
        currentUrl = URL.createObjectURL(blob);
        setObjectUrl(currentUrl);
      })
      .catch(() => setObjectUrl(null))
      .finally(() => setLoading(false));
    return () => { if (currentUrl) URL.revokeObjectURL(currentUrl); };
  }, [attachment.id, isImage]);

  const download = async () => {
    const blob = await getAttachmentBlob(attachment.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (isImage && objectUrl) {
    return (
      <div className="mt-2 max-w-[min(28rem,100%)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={objectUrl} alt={attachment.fileName} className="max-h-80 rounded-xl border border-slate-200/80 dark:border-slate-700 object-contain bg-slate-50 dark:bg-slate-800" />
        <button onClick={download} className="mt-1.5 text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1">
          <Download className="h-3.5 w-3.5" />{attachment.fileName} · {formatBytes(attachment.sizeBytes)}
        </button>
      </div>
    );
  }

  return (
    <button onClick={download} disabled={loading} className={cn("mt-2 flex max-w-[min(28rem,100%)] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-blue-700 dark:hover:bg-blue-950/20 transition-colors", loading && "opacity-60") }>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      </div>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-700 dark:text-slate-200">{attachment.fileName}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{formatBytes(attachment.sizeBytes)}</span>
      </span>
      <Paperclip className="h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}
