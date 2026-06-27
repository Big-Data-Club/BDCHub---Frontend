"use client";

import { useRouter } from "next/navigation";
import { ContentItem } from "./utils";

interface ForumRendererProps {
  content: ContentItem;
}

export function ForumRenderer({ content }: ForumRendererProps) {
  const router = useRouter();
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
          💬
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">Diễn đàn thảo luận</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {content.description || "Tham gia thảo luận, đặt câu hỏi và chia sẻ kiến thức."}
          </p>
          <button
            onClick={() => router.push(`/lms/forums/${content.id}`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-95"
          >
            Vào diễn đàn →
          </button>
        </div>
      </div>
    </div>
  );
}
