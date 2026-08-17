"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Sparkles, ChevronDown, History, HelpCircle, Upload } from "lucide-react";
import { PrimaryBtn } from "@/components/lms/shared";

interface ContentTabHeaderProps {
  sectionsCount: number;
  hasSections: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onOpenAddSection: () => void;
  onOpenMicroModal: () => void;
  onOpenQuizModal: () => void;
  onOpenCourseRoutingModal: () => void;
  onOpenMicroHistoryModal: () => void;
  onOpenQuizHistoryModal: () => void;
}

export function ContentTabHeader({
  sectionsCount,
  hasSections,
  onExpandAll,
  onCollapseAll,
  onOpenAddSection,
  onOpenMicroModal,
  onOpenQuizModal,
  onOpenCourseRoutingModal,
  onOpenMicroHistoryModal,
  onOpenQuizHistoryModal,
}: ContentTabHeaderProps) {
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAiMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-40 flex items-center justify-between gap-3 flex-wrap bg-white/60 dark:bg-[#0B1528]/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-blue-500/15 backdrop-blur-xs shadow-2xs">
      <div className="flex items-center gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {sectionsCount} Chương
        </span>

        {/* Quick Expand / Collapse All Toggles */}
        {hasSections && (
          <div className="flex items-center gap-1 pl-3 border-l border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onExpandAll}
              className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors tracking-tight cursor-pointer"
              title="Mở tất cả các chương"
            >
              Mở tất cả
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={onCollapseAll}
              className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors tracking-tight cursor-pointer"
              title="Thu gọn tất cả các chương"
            >
              Thu gọn
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* AI Assist Menu / Studio Dropdown (Click Popover) */}
        <div className="relative z-50" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsAiMenuOpen(prev => !prev)}
            aria-expanded={isAiMenuOpen}
            aria-label="Menu công cụ AI"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold tracking-tight bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-400 border border-blue-200/80 dark:border-cyan-500/25 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Công cụ AI</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isAiMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isAiMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 z-60 animate-fadeIn duration-150 transform origin-top-right">
              <div className="bg-white dark:bg-[#0D192E] rounded-2xl shadow-2xl border border-slate-200 dark:border-blue-500/20 py-2 ring-1 ring-slate-900/5">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Tạo nội dung AI
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => { setIsAiMenuOpen(false); onOpenMicroModal(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <div>
                    <div className="font-bold">Tạo bài học Micro</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
                      Tự động tạo lesson ngắn ~5 phút
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setIsAiMenuOpen(false); onOpenQuizModal(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-bold">Tạo Micro Quiz</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
                      Bộ trắc nghiệm kiểm tra kiến thức
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setIsAiMenuOpen(false); onOpenCourseRoutingModal(); }}
                  disabled={!hasSections}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors text-left disabled:opacity-40 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="font-bold">Upload chung & AI Phân chương</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
                      AI tự phân bổ tài liệu vào chương
                    </div>
                  </div>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                  <span className="px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Lịch sử AI
                  </span>
                  <button
                    type="button"
                    onClick={() => { setIsAiMenuOpen(false); onOpenMicroHistoryModal(); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    Lịch sử Lesson AI
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAiMenuOpen(false); onOpenQuizHistoryModal(); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    Lịch sử Quiz AI
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <PrimaryBtn
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={onOpenAddSection}
        >
          Thêm chương
        </PrimaryBtn>
      </div>
    </div>
  );
}
