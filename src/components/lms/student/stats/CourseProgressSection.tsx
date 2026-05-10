"use client";

/**
 * CourseProgressSection.tsx
 *
 * Hiển thị:
 * - Progress bar tổng thể (mandatory content)
 * - Danh sách tất cả nội dung, nhóm theo trạng thái bắt buộc
 * - Nút "Đánh dấu hoàn thành" cho các bài bắt buộc chưa xong
 */

import { useState } from "react";
import {
  CheckCircle2, Circle, Lock, ChevronDown, ChevronUp,
  Play, FileText, Image as ImageIcon, HelpCircle,
  MessageSquare, Megaphone, File as FileIcon, AlertCircle
} from "lucide-react";
import { CourseProgress, ProgressDetailItem } from "@/services/progressService";
import { cn } from "@/lib/utils";

interface Props {
  progress:       CourseProgress | null;
  items:          ProgressDetailItem[];
  onMarkComplete: (contentId: number) => Promise<void>;
  loading?:       boolean;
}

const CONTENT_ICON: Record<string, React.ReactNode> = {
  VIDEO:        <Play          className="w-4 h-4" />,
  DOCUMENT:     <FileText      className="w-4 h-4" />,
  IMAGE:        <ImageIcon     className="w-4 h-4" />,
  TEXT:         <FileText      className="w-4 h-4" />,
  QUIZ:         <HelpCircle    className="w-4 h-4" />,
  FORUM:        <MessageSquare className="w-4 h-4" />,
  ANNOUNCEMENT: <Megaphone     className="w-4 h-4" />,
};

const CONTENT_TYPE_LABEL: Record<string, string> = {
  VIDEO: "Video", DOCUMENT: "Tài liệu", IMAGE: "Hình ảnh",
  TEXT: "Văn bản", QUIZ: "Quiz", FORUM: "Thảo luận", ANNOUNCEMENT: "Thông báo",
};

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-blue-500 transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function ContentRow({
  item,
  onMarkComplete,
}: {
  item: ProgressDetailItem;
  onMarkComplete: (id: number) => Promise<void>;
}) {
  const [marking, setMarking] = useState(false);

  const handleMark = async () => {
    setMarking(true);
    try {
      await onMarkComplete(item.content_id);
    } finally {
      setMarking(false);
    }
  };

  const completedAt = item.completed_at
    ? new Date(item.completed_at).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
      })
    : null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
        item.is_completed
          ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50"
          : item.is_mandatory
            ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            : "bg-slate-50 dark:bg-slate-800/40 border border-transparent"
      )}
    >
      {/* Status icon */}
      <div className="flex-shrink-0 w-5 flex items-center justify-center">
        {item.is_completed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        ) : item.is_mandatory ? (
          <Lock className="w-4 h-4 text-orange-400" />
        ) : (
          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        )}
      </div>

      {/* Content type icon */}
      <span className={cn(
        "flex-shrink-0",
        item.is_completed
          ? "text-emerald-500 dark:text-emerald-400"
          : item.is_mandatory
            ? "text-orange-400"
            : "text-slate-400 dark:text-slate-500"
      )}>
        {CONTENT_ICON[item.content_type] ?? <FileIcon className="w-4 h-4" />}
      </span>

      {/* Title + section */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          item.is_completed
            ? "text-emerald-800 dark:text-emerald-300"
            : "text-slate-800 dark:text-slate-200"
        )}>
          {item.content_title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {item.section_title}
          <span className="mx-1.5 text-slate-300 dark:text-slate-700">·</span>
          {CONTENT_TYPE_LABEL[item.content_type] ?? item.content_type}
        </p>
      </div>

      {/* Right side */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {item.is_completed ? (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hidden sm:block">
            {completedAt ?? "Đã xong"}
          </span>
        ) : item.is_mandatory ? (
          <button
            onClick={handleMark}
            disabled={marking}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95",
              marking
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
            )}
          >
            {marking ? "Đang lưu..." : "Đánh dấu xong"}
          </button>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-600">Tùy chọn</span>
        )}

        {/* Mandatory badge */}
        {item.is_mandatory && !item.is_completed && (
          <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Bắt buộc
          </span>
        )}
      </div>
    </div>
  );
}

export function CourseProgressSection({ progress, items, onMarkComplete, loading }: Props) {
  const [showAll, setShowAll] = useState(false);
  const pct = progress?.progress_percent ?? 0;
  const completed = progress?.completed_count ?? 0;
  const total = progress?.total_mandatory ?? 0;

  // Group items
  const mandatory    = items.filter(i => i.is_mandatory);
  const optional     = items.filter(i => !i.is_mandatory);
  const pendingItems = mandatory.filter(i => !i.is_completed);
  const doneItems    = mandatory.filter(i => i.is_completed);

  const displayItems = showAll ? items : [...pendingItems, ...doneItems].slice(0, 6);
  const hasMore      = items.length > 6 && !showAll;
  const hasOptional  = optional.length > 0;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            Tiến độ học tập
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Hoàn thành tất cả nội dung bắt buộc để đạt chứng chỉ
          </p>
        </div>
        {loading && (
          <span className="text-xs text-slate-400 dark:text-slate-500 animate-pulse">Đang cập nhật…</span>
        )}
      </div>

      {/* Main progress card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 mb-4">
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
              {pct.toFixed(0)}%
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
              hoàn thành
            </span>
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {completed}/{total} bài bắt buộc
          </span>
        </div>
        <ProgressBar pct={pct} />

        {total === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Khóa học này không có nội dung bắt buộc.
          </p>
        )}

        {pendingItems.length > 0 && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-800/50">
            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Còn <strong>{pendingItems.length} bài bắt buộc</strong> chưa hoàn thành.
              Bấm Đánh dấu xong sau khi bạn đã xem xong nội dung đó.
            </p>
          </div>
        )}

        {pct === 100 && total > 0 && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              Xuất sắc! Bạn đã hoàn thành tất cả nội dung bắt buộc.
            </p>
          </div>
        )}
      </div>

      {/* Content list */}
      {items.length > 0 && (
        <div className="space-y-2">
          {displayItems.map(item => (
            <ContentRow
              key={item.content_id}
              item={item}
              onMarkComplete={onMarkComplete}
            />
          ))}

          {/* Show more / less */}
          {(hasMore || showAll) && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-colors"
            >
              {showAll ? (
                <><ChevronUp className="w-4 h-4" />Thu gọn</>
              ) : (
                <><ChevronDown className="w-4 h-4" />Xem thêm {items.length - 6} nội dung</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Optional items note */}
      {showAll && hasOptional && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
          {optional.length} nội dung tùy chọn không ảnh hưởng đến tiến độ
        </p>
      )}
    </section>
  );
}