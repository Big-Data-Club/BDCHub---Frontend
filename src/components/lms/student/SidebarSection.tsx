"use client";

import React from "react";
import {
  ChevronDown, CheckCircle2, Play, FileText, Image as ImageIcon, HelpCircle, MessageSquare, Megaphone, File as FileIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, Content } from "@/types";

const CONTENT_TYPE_STYLE: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  VIDEO: {
    bg: "bg-blue-50/60 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-cyan-400",
    icon: <Play className="w-3.5 h-3.5 fill-current" />,
  },
  DOCUMENT: {
    bg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  IMAGE: {
    bg: "bg-teal-50/60 dark:bg-teal-950/20",
    text: "text-teal-600 dark:text-teal-400",
    icon: <ImageIcon className="w-3.5 h-3.5" />,
  },
  TEXT: {
    bg: "bg-amber-50/60 dark:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-450",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  QUIZ: {
    bg: "bg-purple-50/60 dark:bg-purple-950/20",
    text: "text-purple-600 dark:text-purple-400",
    icon: <HelpCircle className="w-3.5 h-3.5" />,
  },
  FORUM: {
    bg: "bg-sky-50/60 dark:bg-sky-950/20",
    text: "text-sky-600 dark:text-sky-400",
    icon: <MessageSquare className="w-3.5 h-3.5" />,
  },
  ANNOUNCEMENT: {
    bg: "bg-rose-50/60 dark:bg-rose-950/20",
    text: "text-rose-600 dark:text-rose-450",
    icon: <Megaphone className="w-3.5 h-3.5" />,
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

export function SidebarSection({
  section, index, contents, loading,
  isExpanded, onToggle, activeContentId, onSelect,
  completedIds,
}: SidebarSectionProps) {
  const mandatoryCount = contents.filter(c => c.is_mandatory).length;
  const completedMandatory = contents.filter(c => c.is_mandatory && completedIds.has(c.id)).length;

  return (
    <div className="border-b border-slate-200/50 dark:border-blue-500/5 last:border-b-0 transition-all duration-300">
      {/* Section header */}
      <button
        className={cn(
          "w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all duration-200 cursor-pointer",
          isExpanded
            ? "bg-slate-50/50 dark:bg-[#0F1E35]/25"
            : "hover:bg-slate-50/50 dark:hover:bg-[#0F1E35]/10"
        )}
        onClick={onToggle}
      >
        <div className={cn(
          "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 border transition-all duration-200",
          isExpanded
            ? "bg-blue-600 border-blue-600 text-white dark:bg-cyan-500 dark:border-cyan-500 dark:text-slate-950"
            : "bg-slate-100 dark:bg-[#0D192E] border-slate-200/60 dark:border-blue-500/10 text-slate-650 dark:text-slate-400"
        )}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-xs font-bold truncate transition-colors duration-200",
            isExpanded ? "text-blue-600 dark:text-cyan-400" : "text-slate-800 dark:text-slate-200"
          )}>
            {section.title}
          </p>
          {contents.length > 0 && (
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5 font-medium flex items-center gap-1.5">
              <span className={cn(
                "inline-block w-1.5 h-1.5 rounded-full",
                isExpanded ? "bg-blue-500 dark:bg-cyan-500" : "bg-slate-400 dark:bg-slate-600"
              )} />
              {mandatoryCount > 0
                ? `${completedMandatory}/${mandatoryCount} bài bắt buộc`
                : `${contents.length} tài liệu`}
            </p>
          )}
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 transition-transform duration-300",
          isExpanded ? "transform rotate-0 text-blue-600 dark:text-cyan-400" : "transform -rotate-90"
        )} />
      </button>

      {/* Content items */}
      {isExpanded && (
        <div className="pb-2 px-2 pt-1 space-y-0.5 bg-slate-50/10 dark:bg-[#070E1C]/10 border-t border-slate-200/40 dark:border-blue-500/5">
          {loading && !contents.length ? (
            <div className="px-3 py-2 space-y-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-8 bg-slate-100 dark:bg-[#0D192E] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : contents.length === 0 ? (
            <p className="px-4 py-2 text-xs text-slate-450 dark:text-slate-500 italic">Chưa có nội dung</p>
          ) : (
            contents.map((c, i) => {
              const isActive = c.id === activeContentId;
              const isDone = completedIds.has(c.id);
              const style = CONTENT_TYPE_STYLE[c.type] || {
                bg: "bg-slate-100 dark:bg-[#0D192E]",
                text: "text-slate-550 dark:text-slate-400",
                icon: <FileIcon className="w-3.5 h-3.5" />,
              };

              return (
                <button
                  key={c.id}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-left transition-all duration-150 group active:scale-[0.99] cursor-pointer",
                    isActive
                      ? "bg-blue-50/80 dark:bg-[#0F1E35] text-blue-600 dark:text-cyan-400 font-bold"
                      : "text-slate-650 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-[#0F1E35]/25 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                  onClick={() => onSelect(c)}
                >
                  {/* Content type icon container */}
                  <span className={cn(
                    "w-6.5 h-6.5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-150",
                    isActive
                      ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950"
                      : style.bg
                  )}>
                    <span className={isActive ? "text-white dark:text-slate-950" : style.text}>
                      {style.icon}
                    </span>
                  </span>

                  {/* Title */}
                  <span className={cn(
                    "text-xs flex-1 truncate font-medium",
                    isActive
                      ? "text-blue-600 dark:text-cyan-400"
                      : "text-slate-700 dark:text-slate-350"
                  )}>
                    {i + 1}. {c.title}
                  </span>

                  {/* Status dot / Checkmark */}
                  <span className="flex-shrink-0 w-4.5 flex items-center justify-center">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-450" />
                    ) : c.is_mandatory ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" title="Bắt buộc" />
                    ) : null}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
