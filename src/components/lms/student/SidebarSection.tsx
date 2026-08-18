"use client";

import React from "react";
import {
  ChevronDown, CheckCircle2, Play, FileText, Image as ImageIcon, HelpCircle, MessageSquare, Megaphone, File as FileIcon, Clock, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, Content } from "@/types";

const CONTENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  VIDEO: {
    icon: <Play className="w-3.5 h-3.5 fill-current ml-0.5" />,
    label: "Video",
  },
  DOCUMENT: {
    icon: <FileText className="w-3.5 h-3.5" />,
    label: "Tài liệu",
  },
  IMAGE: {
    icon: <ImageIcon className="w-3.5 h-3.5" />,
    label: "Hình ảnh",
  },
  TEXT: {
    icon: <FileText className="w-3.5 h-3.5" />,
    label: "Bài đọc",
  },
  QUIZ: {
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    label: "Bài kiểm tra",
  },
  FORUM: {
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    label: "Thảo luận",
  },
  ANNOUNCEMENT: {
    icon: <Megaphone className="w-3.5 h-3.5" />,
    label: "Thông báo",
  },
};

export interface SidebarSectionProps {
  section: Section;
  index: number;
  contents: Content[];
  loading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  activeContentId: number | null;
  onSelect: (c: Content) => void;
  completedIds: Set<number>;
}

export const SidebarSection = React.memo(function SidebarSection({
  section, index, contents, loading,
  isExpanded, onToggle, activeContentId, onSelect,
  completedIds,
}: SidebarSectionProps) {
  const { mandatoryCount, completedMandatory } = React.useMemo(() => {
    const mandatory = contents.filter(c => c.is_mandatory);
    const completed = mandatory.filter(c => completedIds.has(c.id)).length;
    return { mandatoryCount: mandatory.length, completedMandatory: completed };
  }, [contents, completedIds]);

  const handleKeyDownHeader = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="border-b border-slate-200/50 dark:border-blue-500/5 last:border-b-0 transition-all duration-300">
      {/* Section header button */}
      <button
        aria-expanded={isExpanded}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group/header focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:focus-visible:ring-cyan-400/50",
          isExpanded
            ? "bg-slate-50/90 dark:bg-[#0F1E35]/60"
            : "hover:bg-slate-50/60 dark:hover:bg-[#0F1E35]/30"
        )}
        onClick={onToggle}
        onKeyDown={handleKeyDownHeader}
      >
        {/* Section Index Badge */}
        <div className={cn(
          "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 border tabular-nums transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/header:scale-105",
          isExpanded
            ? "bg-blue-600 border-blue-600 text-white dark:bg-cyan-400 dark:border-cyan-400 dark:text-black font-extrabold shadow-xs"
            : "bg-slate-100 dark:bg-[#0D192E] border-slate-200/60 dark:border-blue-500/10 text-slate-600 dark:text-slate-400"
        )}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p
            title={section.title}
            className={cn(
              "text-xs font-bold truncate transition-colors duration-200",
              isExpanded ? "text-blue-600 dark:text-cyan-400" : "text-slate-800 dark:text-slate-200"
            )}
          >
            {section.title}
          </p>
          {contents.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
              <span className={cn(
                "inline-block w-1.5 h-1.5 rounded-full transition-all duration-300",
                isExpanded ? "bg-blue-500 dark:bg-cyan-500 scale-110" : "bg-slate-400 dark:bg-slate-600 scale-100"
              )} />
              {mandatoryCount > 0
                ? `${completedMandatory}/${mandatoryCount} bài bắt buộc`
                : `${contents.length} tài liệu`}
            </p>
          )}
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isExpanded ? "transform rotate-0 text-blue-600 dark:text-cyan-400" : "transform -rotate-90"
        )} />
      </button>

      {/* Content items with smooth height & opacity grid transition */}
      <div className={cn(
        "grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden w-full min-w-0",
        isExpanded ? "grid-rows-[1fr] opacity-100 border-t border-slate-200/40 dark:border-blue-500/5" : "grid-rows-[0fr] opacity-0 border-t-0"
      )}>
        <div className="min-h-0 pb-2 px-2 pt-1 space-y-0.5 bg-slate-50/20 dark:bg-[#070E1C]/30 w-full min-w-0 overflow-hidden">
          {loading && !contents.length ? (
            <div className="px-3 py-2 space-y-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-8 bg-slate-100 dark:bg-[#0D192E] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : contents.length === 0 ? (
            <p className="px-4 py-2 text-xs text-slate-400 italic">Chưa có nội dung</p>
          ) : (
            contents.map((c, i) => {
              const isActive = c.id === activeContentId;
              const isDone = completedIds.has(c.id);
              const config = CONTENT_TYPE_CONFIG[c.type] || {
                icon: <FileIcon className="w-3.5 h-3.5" />,
                label: "Nội dung",
              };

              // Only show duration text if actual time metadata is present to save horizontal space
              const durationText = c.metadata?.duration_seconds
                ? `${Math.ceil(c.metadata.duration_seconds / 60)}p`
                : c.metadata?.duration
                ? c.metadata.duration
                : null;

              return (
                <button
                  key={c.id}
                  className={cn(
                    "w-full flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-lg text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:focus-visible:ring-cyan-400/50 min-w-0 overflow-hidden box-border",
                    isActive
                      ? "bg-blue-50/90 dark:bg-[#0F1E35] text-blue-600 dark:text-cyan-400 font-bold shadow-xs border border-blue-200/50 dark:border-cyan-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-[#0F1E35]/40 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
                  )}
                  onClick={() => onSelect(c)}
                >
                  {/* Left part: Icon + Title with strict overflow control */}
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden shrink">
                    {/* Icon Badge - Fixed size */}
                    <span className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105",
                      isActive
                        ? "bg-blue-600 text-white dark:bg-cyan-400 dark:text-black font-bold shadow-xs"
                        : "bg-slate-200/60 dark:bg-[#0D192E] text-slate-600 dark:text-slate-400 border border-slate-300/40 dark:border-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-cyan-400"
                    )}>
                      {config.icon}
                    </span>

                    {/* Title block strictly truncated */}
                    <span
                      title={`${i + 1}. ${c.title}`}
                      className={cn(
                        "text-xs font-medium transition-colors duration-150 truncate min-w-0 flex-1 block overflow-hidden text-ellipsis whitespace-nowrap",
                        isActive
                          ? "text-blue-600 dark:text-cyan-400 font-bold"
                          : "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {i + 1}. {c.title}
                    </span>
                  </div>

                  {/* Right part: Metadata / Status Badge (Strict shrink-0 to prevent clipping) */}
                  <div className="shrink-0 flex items-center gap-1 ml-auto">
                    {durationText && (
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100/80 dark:bg-[#0D192E]/80 whitespace-nowrap shrink-0">
                        <Clock className="w-2.5 h-2.5 opacity-70 shrink-0" />
                        {durationText}
                      </span>
                    )}

                    {(isDone || c.is_mandatory) && (
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 transition-transform duration-200 scale-100" />
                        ) : c.is_mandatory ? (
                          <span
                            className="flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0"
                            title="Bài học bắt buộc"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

