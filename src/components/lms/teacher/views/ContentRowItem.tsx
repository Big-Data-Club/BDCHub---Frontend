"use client";

import React from "react";
import {
  Play, FileText, HelpCircle, MessageSquare,
  Megaphone, Image as ImageIcon, File, Sparkles,
  Eye, Edit3, Trash2, GripVertical
} from "lucide-react";
import { AIIndexButton } from "@/components/lms/teacher/ai/AIIndexButton";
import { Badge, ContentTypeBadge, Spinner } from "@/components/lms/shared";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Content } from "@/types";

const CONTENT_ICON: Record<string, React.ReactNode> = {
  VIDEO:        <Play className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />,
  DOCUMENT:     <FileText className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />,
  IMAGE:        <ImageIcon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />,
  TEXT:         <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />,
  QUIZ:         <HelpCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />,
  FORUM:        <MessageSquare className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />,
  ANNOUNCEMENT: <Megaphone className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />,
};

interface ContentRowItemProps {
  content: Content;
  index: number;
  sectionId: number;
  isDragging: boolean;
  canDrag: boolean;
  isDeleting: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMouseDownDrag: () => void;
  onMouseUpDrag: () => void;
  onGenerateMicroLesson: () => void;
  onGenerateMicroQuiz: () => void;
  onViewContent: () => void;
  onEditContent: () => void;
  onDeleteContent: () => void;
}

export function ContentRowItem({
  content: c,
  index: ci,
  isDragging,
  canDrag,
  isDeleting,
  onDragStart,
  onDragOver,
  onDragEnd,
  onMouseDownDrag,
  onMouseUpDrag,
  onGenerateMicroLesson,
  onGenerateMicroQuiz,
  onViewContent,
  onEditContent,
  onDeleteContent,
}: ContentRowItemProps) {
  return (
    <div
      draggable={canDrag}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-3 px-5 py-3 group hover:bg-slate-50/80 dark:hover:bg-[#0D192E]/50 transition-all duration-200 ${
        isDragging ? "opacity-45 bg-blue-50/50 dark:bg-blue-950/20" : ""
      }`}
    >
      {/* Grip handle */}
      <div
        className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors opacity-40 group-hover:opacity-100 focus:opacity-100"
        onMouseDown={onMouseDownDrag}
        onMouseUp={onMouseUpDrag}
        onMouseLeave={onMouseUpDrag}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Index */}
      <span className="text-slate-400 dark:text-slate-500 flex-shrink-0 w-4 text-xs font-semibold text-right">
        {ci + 1}
      </span>

      {/* Type icon */}
      <span className="text-slate-400 dark:text-slate-500 flex-shrink-0">
        {CONTENT_ICON[c.type] ?? <File className="w-3.5 h-3.5" />}
      </span>

      <p className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
        {c.title}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap">
        <ContentTypeBadge type={c.type} />
        {c.is_mandatory && <Badge variant="yellow">Bắt buộc</Badge>}
      </div>

      {/* AI Index */}
      <div className="ml-1">
        <AIIndexButton
          contentId={c.id}
          contentType={c.type}
          filePath={c.metadata?.file_path || null}
          initialStatus={c.ai_index_status || "not_indexed"}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          title="Xem nội dung"
          aria-label="Xem nội dung bài học"
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
          onClick={onViewContent}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Chỉnh sửa"
          aria-label="Chỉnh sửa thông tin bài học"
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
          onClick={onEditContent}
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        {/* More Actions Dropdown via Radix Portal (Fixes z-index & transparency completely) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title="Thao tác khác"
              aria-label="Xem các thao tác bổ sung"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 bg-white dark:bg-[#0D192E] border border-slate-200 dark:border-blue-500/25 shadow-2xl rounded-xl p-1 space-y-0.5 ring-1 ring-slate-900/10 z-[200]"
          >
            {(c.type === "DOCUMENT" || c.type === "VIDEO" || c.type === "IMAGE") && (
              <>
                <DropdownMenuItem
                  onClick={onGenerateMicroLesson}
                  className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 focus:bg-violet-50 dark:focus:bg-violet-950/40 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span>Tạo Micro Lesson</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onGenerateMicroQuiz}
                  className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-950/40 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tạo Micro Quiz</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-0.5 border-t border-slate-100 dark:border-slate-800" />
              </>
            )}

            <DropdownMenuItem
              disabled={isDeleting}
              onClick={onDeleteContent}
              className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 focus:bg-red-50 dark:focus:bg-red-950/40 transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <Spinner className="w-3.5 h-3.5 border-2" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              )}
              <span>Xóa bài học</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
