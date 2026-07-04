"use client";

import { useState } from "react";
import { ContentItem, EmptyState, buildFileUrl, formatFileSize, DownloadLink } from "./utils";

interface DocumentRendererProps {
  content: ContentItem;
}

export function DocumentRenderer({ content }: DocumentRendererProps) {
  const [iframeError, setIframeError] = useState(false);

  const filePath = content.metadata?.file_path || content.file_path;
  const docUrl = filePath ? buildFileUrl(filePath) : (content.metadata?.file_url ?? "");

  if (!docUrl) return <EmptyState message="Tài liệu chưa được tải lên." />;

  const isPdf = docUrl.toLowerCase().includes(".pdf");
  const isOfficeDoc = /\.(docx|pptx|xlsx|doc|ppt|xls)$/i.test(docUrl);
  const fileName = content.metadata?.file_name || content.title;
  const fileSize = content.metadata?.file_size ? formatFileSize(content.metadata.file_size) : null;
  const downloadUrl = docUrl.replace("/serve/", "/download/");

  const absoluteDocUrl = typeof window !== "undefined" && !docUrl.startsWith("http")
    ? `${window.location.origin}${docUrl}`
    : docUrl;

  return (
    <div className="space-y-4">
      {/* File info card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
            {isPdf ? "📄" : isOfficeDoc ? "📊" : "📋"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-50 truncate" title={fileName}>{fileName}</p>
            {fileSize && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{fileSize}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start flex-wrap sm:flex-nowrap">
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none text-center px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            Xem
          </a>
          <DownloadLink href={downloadUrl} label="Tải xuống" secondary compact className="flex-1 sm:flex-none w-full sm:w-auto" />
        </div>
      </div>

      {/* PDF embed */}
      {isPdf && !iframeError && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <iframe
            src={`${docUrl}#view=FitH`}
            className="w-full h-[600px]"
            title={fileName}
            onError={() => setIframeError(true)}
          />
        </div>
      )}

      {/* Office Document Embed */}
      {isOfficeDoc && !iframeError && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <iframe
            src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteDocUrl)}`}
            className="w-full h-[600px]"
            title={fileName}
            frameBorder="0"
          />
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 text-center">
            Bản xem trước được cung cấp bởi Microsoft Office Online. Nếu không hiển thị, vui lòng tải xuống để xem.
          </div>
        </div>
      )}

      {(isPdf || isOfficeDoc) && iframeError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          Không thể hiển thị tài liệu trực tiếp. Vui lòng tải xuống để xem.
        </div>
      )}
    </div>
  );
}
