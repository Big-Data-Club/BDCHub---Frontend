"use client";

import React from "react";
import { Target, Award, ChevronRight, Search } from "lucide-react";
import { PrimaryBtn } from "../shared/Button";

interface FocusCourse {
  course_id: number;
  course_title?: string;
  progress_percent?: number;
}

interface FocusCardProps {
  focusCourse: FocusCourse | null;
  totalCount: number;
  loading?: boolean;
  onNavigateToCourse?: (courseId: number) => void;
  onNavigateToDiscover?: () => void;
}

export function FocusCard({
  focusCourse,
  totalCount,
  loading = false,
  onNavigateToCourse,
  onNavigateToDiscover,
}: FocusCardProps) {
  if (loading) {
    return (
      <div className="h-[180px] bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/10 animate-pulse" />
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl p-5 shadow-sm hover:border-blue-300 dark:hover:border-blue-500/25 transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50/70 text-purple-600 dark:bg-purple-950/20 dark:text-violet-400 border border-purple-200/50 dark:border-purple-500/20">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-violet-400 uppercase tracking-wider">
              Mục tiêu học tập
            </span>
          </div>

          {focusCourse && focusCourse.progress_percent !== undefined && (
            <span className="text-xs font-extrabold text-blue-650 dark:text-cyan-400 bg-blue-50/70 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/20">
              {focusCourse.progress_percent}%
            </span>
          )}
        </div>

        {focusCourse ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1" title={focusCourse.course_title}>
                {focusCourse.course_title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 font-medium leading-relaxed">
                {focusCourse.progress_percent === 0
                  ? "Bắt đầu bài học đầu tiên để thiết lập mục tiêu."
                  : "Tiếp tục để nhanh chóng hoàn thành khóa học."
                }
              </p>
            </div>

            {/* Focus course progress bar */}
            {focusCourse.progress_percent !== undefined && focusCourse.progress_percent > 0 && (
              <div className="h-1.5 bg-slate-200 dark:bg-[#0D192E] rounded-full overflow-hidden border dark:border-blue-500/5">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${focusCourse.progress_percent}%` }}
                />
              </div>
            )}

            <PrimaryBtn
              onClick={() => onNavigateToCourse?.(focusCourse.course_id)}
              className="w-full mt-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-1.5"
              icon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              {focusCourse.progress_percent === 0 ? "Bắt đầu học" : "Học tiếp"}
            </PrimaryBtn>
          </div>
        ) : (
          <div className="text-center py-2">
            {totalCount > 0 ? (
              <div className="space-y-3">
                <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-755 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Đã hoàn thành!</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Đã hoàn thành toàn bộ khóa học đã đăng ký.
                  </p>
                </div>
                <PrimaryBtn
                  onClick={onNavigateToDiscover}
                  className="w-full mt-1 text-xs py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl active:scale-[0.97] flex items-center justify-center gap-1.5"
                  icon={<Search className="w-3.5 h-3.5" />}
                >
                  Tìm khóa học mới
                </PrimaryBtn>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 dark:bg-[#0D192E] text-slate-500 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-blue-500/10">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-750 dark:text-slate-250">Thiết lập mục tiêu</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Đăng ký khóa học mới để bắt đầu
                  </p>
                </div>
                <PrimaryBtn
                  onClick={onNavigateToDiscover}
                  className="w-full mt-1 text-xs py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl active:scale-[0.97] flex items-center justify-center gap-1.5"
                  icon={<Search className="w-3.5 h-3.5" />}
                >
                  Đăng ký học ngay
                </PrimaryBtn>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
