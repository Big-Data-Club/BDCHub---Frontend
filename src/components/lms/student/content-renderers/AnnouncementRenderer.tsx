"use client";

import dynamic from "next/dynamic";
import { ContentItem } from "./utils";

const MarkdownRenderer = dynamic(
  () => import("@/components/markdown/MarkdownRenderer"),
  { ssr: false, loading: () => <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" /> },
);

interface AnnouncementRendererProps {
  content: ContentItem;
}

export function AnnouncementRenderer({ content }: AnnouncementRendererProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📢</span>
        <h3 className="font-semibold text-slate-900 dark:text-slate-50">Thông báo</h3>
      </div>
      {content.description && (
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{content.description}</p>
      )}
      {content.metadata?.content && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <MarkdownRenderer content={content.metadata.content} />
        </div>
      )}
    </div>
  );
}
