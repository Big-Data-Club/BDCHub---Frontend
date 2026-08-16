"use client";

import React from "react";
import {
  GripVertical, Plus, Upload, Edit3, BookOpen, History, Trash2, ChevronDown, ChevronRight
} from "lucide-react";
import { ContentRowItem } from "./ContentRowItem";
import { Spinner } from "@/components/lms/shared";
import { Content, Section } from "@/types";

interface SectionItemCardProps {
  section: Section;
  index: number;
  isExpanded: boolean;
  contents: Content[];
  isLoadingContents: boolean;
  isDraggingSection: boolean;
  canDragSection: boolean;
  deletingSectionId: number | null;
  draggedContentInfo: { sectionId: number; index: number } | null;
  canDragContentId: number | null;
  deletingContentId: number | null;
  onToggleExpand: () => void;
  onSectionDragStart: (e: React.DragEvent) => void;
  onSectionDragOver: (e: React.DragEvent) => void;
  onSectionDragEnd: () => void;
  onMouseDownSectionDrag: () => void;
  onMouseUpSectionDrag: () => void;
  onAddContent: () => void;
  onBulkUpload: () => void;
  onEditSection: () => void;
  onOpenSectionOverview: () => void;
  onOpenOverviewHistory: () => void;
  onDeleteSection: () => void;
  onContentDragStart: (e: React.DragEvent, contentIndex: number) => void;
  onContentDragOver: (e: React.DragEvent, contentIndex: number) => void;
  onContentDragEnd: () => void;
  onMouseDownContentDrag: (contentId: number) => void;
  onMouseUpContentDrag: () => void;
  onGenerateMicroLesson: (contentId: number) => void;
  onGenerateMicroQuiz: (contentId: number) => void;
  onViewContent: (content: Content) => void;
  onEditContent: (content: Content) => void;
  onDeleteContent: (contentId: number) => void;
}

export function SectionItemCard({
  section: sec,
  index: i,
  isExpanded,
  contents,
  isLoadingContents,
  isDraggingSection,
  canDragSection,
  deletingSectionId,
  draggedContentInfo,
  canDragContentId,
  deletingContentId,
  onToggleExpand,
  onSectionDragStart,
  onSectionDragOver,
  onSectionDragEnd,
  onMouseDownSectionDrag,
  onMouseUpSectionDrag,
  onAddContent,
  onBulkUpload,
  onEditSection,
  onOpenSectionOverview,
  onOpenOverviewHistory,
  onDeleteSection,
  onContentDragStart,
  onContentDragOver,
  onContentDragEnd,
  onMouseDownContentDrag,
  onMouseUpContentDrag,
  onGenerateMicroLesson,
  onGenerateMicroQuiz,
  onViewContent,
  onEditContent,
  onDeleteContent,
}: SectionItemCardProps) {
  return (
    <div
      draggable={canDragSection}
      onDragStart={onSectionDragStart}
      onDragOver={onSectionDragOver}
      onDragEnd={onSectionDragEnd}
      className={`rounded-2xl border border-slate-200/80 dark:border-blue-500/15 overflow-hidden bg-white dark:bg-[#070E1C] transition-all duration-200 hover:border-slate-300 dark:hover:border-blue-500/30 hover:shadow-xs ${
        isDraggingSection ? "opacity-45 border-dashed border-blue-400 dark:border-blue-800" : ""
      }`}
    >
      {/* ── Section header ── */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`Chương ${i + 1}: ${sec.title}`}
        className="flex items-center gap-3.5 px-5 py-4 bg-slate-50/70 dark:bg-[#0D192E]/60 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-[#0F1E35] transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 rounded-t-2xl"
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleExpand();
          }
        }}
      >
        {/* Grip handle */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Kéo để sắp xếp lại vị trí chương"
          className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-blue-900/30 transition-colors"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={onMouseDownSectionDrag}
          onMouseUp={onMouseUpSectionDrag}
          onMouseLeave={onMouseUpSectionDrag}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Index badge */}
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-xs font-black flex-shrink-0 border border-blue-200/60 dark:border-cyan-500/20">
          {i + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate tracking-tight">
            {sec.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">
            {isExpanded
              ? `${contents.length} nội dung`
              : sec.description || "Nhấn để xem nội dung"}
          </p>
        </div>

        {/* Section actions */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Add content */}
          <button
            type="button"
            title="Thêm nội dung"
            aria-label="Thêm nội dung bài học"
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            onClick={onAddContent}
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Bulk upload */}
          <button
            type="button"
            title="Upload nhiều file"
            aria-label="Upload nhiều file tài liệu"
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            onClick={onBulkUpload}
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Edit section */}
          <button
            type="button"
            title="Sửa chương"
            aria-label="Sửa thông tin chương"
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            onClick={onEditSection}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Section overview */}
          <button
            type="button"
            title="Tạo bài học & quiz tổng quan chương"
            aria-label="Tạo bài học và quiz tổng quan chương"
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
            onClick={onOpenSectionOverview}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Lịch sử tổng quan */}
          <button
            type="button"
            title="Lịch sử tạo tổng quan chương"
            aria-label="Xem lịch sử tạo tổng quan chương"
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            onClick={onOpenOverviewHistory}
          >
            <History className="w-4 h-4" />
          </button>

          {/* Delete section */}
          <button
            type="button"
            title="Xóa chương"
            aria-label="Xóa chương học"
            disabled={deletingSectionId === sec.id}
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors cursor-pointer disabled:opacity-50"
            onClick={onDeleteSection}
          >
            {deletingSectionId === sec.id ? (
              <Spinner className="w-4 h-4 border-2" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </div>

      {/* ── Content list ── */}
      {isExpanded && (
        <div>
          {isLoadingContents ? (
            <div className="px-5 py-4 space-y-2">
              {[0, 1, 2].map((k) => (
                <div
                  key={k}
                  className="h-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : contents.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Chưa có nội dung trong chương này.&nbsp;
                <button
                  onClick={onAddContent}
                  className="font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  + Thêm ngay
                </button>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-blue-500/10">
              {contents.map((c, ci) => (
                <ContentRowItem
                  key={c.id}
                  content={c}
                  index={ci}
                  sectionId={sec.id}
                  isDragging={
                    draggedContentInfo?.sectionId === sec.id &&
                    draggedContentInfo?.index === ci
                  }
                  canDrag={canDragContentId === c.id}
                  isDeleting={deletingContentId === c.id}
                  onDragStart={(e) => onContentDragStart(e, ci)}
                  onDragOver={(e) => onContentDragOver(e, ci)}
                  onDragEnd={onContentDragEnd}
                  onMouseDownDrag={() => onMouseDownContentDrag(c.id)}
                  onMouseUpDrag={onMouseUpContentDrag}
                  onGenerateMicroLesson={() => onGenerateMicroLesson(c.id)}
                  onGenerateMicroQuiz={() => onGenerateMicroQuiz(c.id)}
                  onViewContent={() => onViewContent(c)}
                  onEditContent={() => onEditContent(c)}
                  onDeleteContent={() => onDeleteContent(c.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
