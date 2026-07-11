"use client";

import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import { InteractiveGlowCard } from "./InteractiveGlowCard";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  courseId: number;
  title: string;
  teacherName?: string;
  progress: number;
  isSelected?: boolean;
  onClick?: () => void;
  onOpenDetails?: (e: React.MouseEvent) => void;
}

export function ProgressCard({
  courseId,
  title,
  teacherName,
  progress,
  isSelected = false,
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
    >
      <div className="flex items-start gap-4">
        {/* Icon container */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300",
            isSelected
              ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950"
              : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-cyan-400 border border-slate-100 dark:border-cyan-500/10"
          )}
        >
          <BookOpen className="w-6 h-6" />
        </div>

        {/* Course info */}
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-bold text-base truncate transition-colors",
              isSelected
                ? "text-blue-600 dark:text-cyan-400"
                : "text-slate-900 dark:text-slate-50"
            )}
            title={title}
          >
            {title}
          </h4>
          
          {teacherName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                Giảng viên: <span className="font-medium text-slate-700 dark:text-slate-300">{teacherName}</span>
              </span>
            </p>
          )}

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>Hoàn thành</span>
              <span className="text-blue-600 dark:text-cyan-400">{Math.round(progress)}%</span>
            </div>
            <ProgressBar
              value={progress}
              max={100}
              color={progress === 100 ? "green" : "blue"}
              showPercent={false}
            />
          </div>
        </div>

        {/* View Details button */}
        {onOpenDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(e);
            }}
            className="self-center p-2 rounded-xl bg-slate-50 dark:bg-blue-950/40 text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-blue-950/80 border border-slate-200/50 dark:border-blue-900/30 transition-all duration-200 ml-1 flex-shrink-0 active:scale-95"
            aria-label="Vào lớp học"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </InteractiveGlowCard>
  );
}
