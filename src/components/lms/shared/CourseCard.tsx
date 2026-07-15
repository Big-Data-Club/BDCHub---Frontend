import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpen, Users, User, Calendar, GraduationCap
} from "lucide-react";
import { Badge, BadgeVariant } from "./Badge";
import { ProgressBar } from "./ProgressBar";
import { InteractiveGlowCard } from "./InteractiveGlowCard";
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
  createdAt?: string;
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

export function CourseCard({
  title, description, category, level, status, teacherName,
  thumbnailUrl, enrollmentCount, progress, createdAt, onClick, actions, className
}: CourseCardProps) {
  return (
    <InteractiveGlowCard
      accentColor="blue"
      interactive={!!onClick}
      onClick={onClick}
      className={cn("w-full h-full transition-all duration-200", className)}
      innerClassName="p-0 overflow-hidden flex flex-col h-full justify-between border-slate-200 dark:border-blue-500/15"
      showOffset={true}
      showGlow={true}
    >
      {/* Thumbnail Area with Overlay Badges */}
      <div className="h-44 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-blue-950/20 dark:to-[#0D192E] overflow-hidden relative flex-shrink-0">
        {thumbnailUrl ? (
          <Image 
            src={thumbnailUrl} 
            alt={title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="flex items-center justify-center h-full group-hover:scale-105 transition-transform duration-500">
            <BookOpen className="w-14 h-14 text-blue-300 dark:text-blue-900/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent pointer-events-none" />

        {/* Level & Category Overlays on Image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {category && category.split(",").slice(0, 2).map((cat, i) => {
            const trimmed = cat.trim();
            return trimmed ? (
              <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-800 border border-slate-200 shadow-sm dark:bg-blue-950/90 dark:text-cyan-400 dark:border-blue-500/20">
                {trimmed}
              </span>
            ) : null;
          })}
        </div>

        {level && (
          <div className="absolute bottom-3 left-3 z-10">
            <Badge variant={LEVEL_BADGE[level] ?? "gray"}>{LEVEL_LABEL[level] ?? level}</Badge>
          </div>
        )}

        {status === "DRAFT" && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="yellow">Nháp</Badge>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-3.5">
          {/* Title */}
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base md:text-lg leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
            {title}
          </h3>

          {/* Teacher Profile Info & Create Date Separated by Bullet */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap text-xs text-slate-500 dark:text-slate-400 w-full font-semibold">
            {teacherName && (
              <span className="flex items-center gap-1 min-w-0">
                <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{teacherName}</span>
              </span>
            )}
            {teacherName && createdAt && (
              <span className="text-slate-300 dark:text-slate-650 font-bold select-none flex-shrink-0">&bull;</span>
            )}
            {createdAt && (
              <span className="flex items-center gap-1 flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tạo: {formatDate(createdAt)}</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {/* Progress bar for enrolled courses */}
          {progress !== undefined && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
                <span>Tiến độ học tập</span>
                <span className="text-blue-600 dark:text-cyan-400">{progress}%</span>
              </div>
              <ProgressBar value={progress} max={100} color="blue" showPercent={false} className="h-1.5" />
            </div>
          )}

          {/* Footer Action Row */}
          {(enrollmentCount !== undefined || actions) && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-blue-500/10 pt-4">
              {enrollmentCount !== undefined ? (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  {enrollmentCount.toLocaleString()} học viên
                </span>
              ) : (
                <div />
              )}
              {actions}
            </div>
          )}
        </div>
      </div>
    </InteractiveGlowCard>
  );
}