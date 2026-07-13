"use client";

import { BookOpen, ChevronRight, GraduationCap, Calendar } from "lucide-react";
import { InteractiveGlowCard } from "./InteractiveGlowCard";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";

import { Badge } from "./Badge";

interface ProgressCardProps {
  courseId: number;
  title: string;
  teacherName?: string;
  progress: number;
  isSelected?: boolean;
  enrolledAt?: string;
  onClick?: () => void;
  onOpenDetails?: (e: React.MouseEvent) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return "";
  }
};

export function ProgressCard({
  courseId,
  title,
  teacherName,
  progress,
  isSelected = false,
  enrolledAt,
  onClick,
  onOpenDetails,
}: ProgressCardProps) {
  return (
    <InteractiveGlowCard
      accentColor={isSelected ? "cyan" : "blue"}
      interactive={true}
      onClick={onClick}
      isSelected={isSelected}
      className="transition-all duration-200"
      innerClassName="p-4"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
              {/* Badge Trạng thái và ID khóa học đưa lên trên tiêu đề */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant={progress === 100 ? "green" : progress > 0 ? "blue" : "gray"}>
                  {progress === 100 ? "Đã xong" : progress > 0 ? "Đang học" : "Chưa học"}
                </Badge>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">#{courseId}</span>
              </div>

              {/* Tiêu đề khóa học */}
              <h4
                className={cn(
                  "font-bold text-sm transition-colors line-clamp-2",
                  isSelected
                    ? "text-blue-600 dark:text-cyan-400"
                    : "text-slate-900 dark:text-slate-50"
                )}
                title={title}
              >
                {title}
              </h4>
              
              {/* Thông tin giảng viên và ngày tham gia trên cùng 1 hàng ngăn cách bởi dấu bullet */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                {teacherName && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{teacherName}</span>
                  </span>
                )}
                {teacherName && enrolledAt && (
                  <span className="text-slate-300 dark:text-slate-650 font-bold select-none">&bull;</span>
                )}
                {enrolledAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Tham gia: {formatDate(enrolledAt)}</span>
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Phần tiến độ và nút hành động chuyển trang */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-blue-500/5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <ProgressBar
                value={progress}
                max={100}
                color={progress === 100 ? "green" : "blue"}
                showPercent={false}
              />
            </div>
            <span
              className={cn(
                "text-xs font-bold whitespace-nowrap",
                progress === 100
                  ? "text-emerald-600 dark:text-emerald-455"
                  : "text-blue-600 dark:text-cyan-400"
              )}
            >
              {Math.round(progress)}%
            </span>
          </div>

          {onOpenDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(e);
              }}
              className="mt-1 w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all duration-200 bg-blue-50/50 hover:bg-blue-600 hover:text-white dark:bg-blue-950/40 dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-blue-600 dark:text-cyan-400 border border-blue-200/40 dark:border-cyan-500/10 active:scale-[0.98] shadow-xs"
            >
              <span>{progress === 100 ? "Xem lại bài học" : progress > 0 ? "Học tiếp" : "Bắt đầu học"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </InteractiveGlowCard>
  );
}
