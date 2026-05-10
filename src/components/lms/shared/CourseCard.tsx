"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpen, Users
} from "lucide-react";
import { Badge, BadgeVariant } from "./Badge";
import { ProgressBar } from "./ProgressBar";
import Image from "next/image";

interface CourseCardProps {
  id: number;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  status?: string;
  teacherName?: string;
  thumbnailUrl?: string;
  enrollmentCount?: number;
  progress?: number;
  onClick?: () => void;
  actions?: ReactNode;
  className?: string;
}

const LEVEL_BADGE: Record<string, BadgeVariant> = {
  BEGINNER: "green", INTERMEDIATE: "yellow", ADVANCED: "red", ALL_LEVELS: "blue"
};
const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Cơ bản", INTERMEDIATE: "Trung cấp", ADVANCED: "Nâng cao", ALL_LEVELS: "Mọi cấp"
};

export function CourseCard({
  title, description, category, level, status, teacherName,
  thumbnailUrl, enrollmentCount, progress, onClick, actions, className
}: CourseCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800",
        "shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
        onClick && "cursor-pointer hover:border-blue-300 dark:hover:border-blue-700",
        className
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="h-36 bg-gradient-to-br from-blue-100 to-slate-100 dark:from-blue-900/30 dark:to-slate-800 overflow-hidden relative">
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-12 h-12 text-blue-300 dark:text-blue-700" />
          </div>
        )}
        {status === "DRAFT" && (
          <div className="absolute top-3 left-3">
            <Badge variant="yellow">Nháp</Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Meta badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {category && <Badge variant="gray">{category}</Badge>}
          {level && <Badge variant={LEVEL_BADGE[level] ?? "gray"}>{LEVEL_LABEL[level] ?? level}</Badge>}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base leading-snug mb-1 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{description}</p>
        )}

        {/* Teacher */}
        {teacherName && (
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">
            Giảng viên: <span className="font-medium text-slate-700 dark:text-slate-300">{teacherName}</span>
          </p>
        )}

        {/* Progress bar for enrolled courses */}
        {progress !== undefined && (
          <ProgressBar value={progress} max={100} color="blue" showPercent={false} className="mb-3" />
        )}

        {/* Footer row */}
        {(enrollmentCount !== undefined || actions) && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
            {enrollmentCount !== undefined && (
              <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />{enrollmentCount} học viên
              </span>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}