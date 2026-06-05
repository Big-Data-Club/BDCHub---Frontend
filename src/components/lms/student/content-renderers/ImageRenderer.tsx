"use client";

import { useState } from "react";
import { ContentItem, EmptyState, buildFileUrl, DownloadLink } from "./utils";
import { cn } from "@/lib/utils";

interface ImageRendererProps {
  content: ContentItem;
}

export function ImageRenderer({ content }: ImageRendererProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const filePath = content.metadata?.file_path || content.file_path;
  const imageUrl = filePath ? buildFileUrl(filePath) : (content.metadata?.image_url ?? "");

  if (!imageUrl) return <EmptyState message="Hình ảnh chưa được tải lên." />;

  return (
    <div className="space-y-3">
      <div className="relative bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm min-h-[200px]">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-slate-500 text-sm">Không thể tải hình ảnh.</p>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={content.title}
            className={cn("w-full h-auto transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
            onLoad={() => setLoaded(true)}
            onError={() => { setError(true); setLoaded(true); }}
          />
        )}
      </div>
      <div className="flex gap-2">
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all active:scale-95"
        >
          Xem kích thước gốc
        </a>
        <DownloadLink href={imageUrl.replace("/serve/", "/download/")} label="Tải xuống" secondary />
      </div>
    </div>
  );
}
