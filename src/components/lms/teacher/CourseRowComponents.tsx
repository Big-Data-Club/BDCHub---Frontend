"use client";

import {
  BookOpen, Users, Eye, EyeOff, ArchiveRestore, Archive, Settings, Trash2, MoreVertical
} from "lucide-react";
import { Badge, Spinner } from "@/components/lms/shared";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Course } from "@/types";
import { cn } from "@/lib/utils";

// Helper function to format date
export function formatDate(dateStr?: string) {
  if (!dateStr) return "Chưa cập nhật";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Chưa cập nhật";
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Chưa cập nhật";
  }
}

// ─── Course Table Row (Desktop) ───────────────────────────────────────────────
export function CourseTableRow({
  course, onOpen, onPublish, onArchive, onDelete, publishing, archiving, deleting
}: {
  course: Course;
  onOpen: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  publishing: boolean;
  archiving: boolean;
  deleting: boolean;
}) {
  return (
    <tr
      className={cn(
        "group hover:bg-slate-50/60 dark:hover:bg-[#0D192E]/40 transition-all duration-200 border-b border-slate-100 dark:border-blue-500/5 cursor-pointer",
        course.status === "ARCHIVED" && "opacity-75"
      )}
      onClick={course.status === "ARCHIVED" ? undefined : onOpen}
    >
      {/* Course Info & Thumbnail */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0D192E] dark:to-[#0F1E35] flex items-center justify-center flex-shrink-0 relative border border-slate-200/80 dark:border-blue-500/15 group-hover:border-blue-500/30 dark:group-hover:border-cyan-400/40 transition-all duration-300">
            {course.thumbnail_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={course.thumbnail_url} alt={course.title} className="object-cover w-full h-full" />
            ) : (
              <BookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform duration-300" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate max-w-xs lg:max-w-md">
              {course.title}
            </p>
            <p className="text-xs text-slate-550 dark:text-slate-400 truncate max-w-xs lg:max-w-md mt-1 font-medium">
              {course.description || "Chưa có mô tả"}
            </p>
          </div>
        </div>
      </td>

      {/* Levels & Categories */}
      {(() => {
        const items: React.ReactNode[] = [];
        if (course.level) {
          items.push(
            <Badge key="level" variant={
              course.level === "BEGINNER" ? "green" :
              course.level === "INTERMEDIATE" ? "yellow" :
              course.level === "ADVANCED" ? "red" : "blue"
            }>
              {course.level === "BEGINNER" ? "Cơ bản" :
               course.level === "INTERMEDIATE" ? "Trung cấp" :
               course.level === "ADVANCED" ? "Nâng cao" : "Mọi cấp"}
            </Badge>
          );
        }
        const categories = course.category
          ? (course.category as string).split(",").map(c => c.trim()).filter(Boolean)
          : [];
        categories.forEach((cat, idx) => {
          items.push(
            <Badge key={`cat-${idx}`} variant="gray">
              {cat}
            </Badge>
          );
        });

        const maxVisible = 2;
        const visibleItems = items.slice(0, maxVisible);
        const remainingCount = items.length - maxVisible;
        const tooltipText = [
          course.level && `Cấp độ: ${
            course.level === "BEGINNER" ? "Cơ bản" :
            course.level === "INTERMEDIATE" ? "Trung cấp" :
            course.level === "ADVANCED" ? "Nâng cao" : "Mọi cấp"
          }`,
          categories.length > 0 && `Danh mục: ${categories.join(", ")}`
        ].filter(Boolean).join(" | ");

        return (
          <td className="px-6 py-4" title={tooltipText}>
            <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
              {visibleItems}
              {remainingCount > 0 && (
                <Badge variant="gray">
                  +{remainingCount}
                </Badge>
              )}
            </div>
          </td>
        );
      })()}

      {/* Learners */}
      <td className="px-6 py-4 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-355 bg-slate-100/80 dark:bg-[#0D192E] border border-slate-200/60 dark:border-blue-500/10">
          <Users className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
          {course.enrollment_count ?? 0}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <Badge variant={course.status === "PUBLISHED" ? "green" : course.status === "ARCHIVED" ? "gray" : "yellow"}>
          {course.status === "PUBLISHED" ? "Đã xuất bản" : course.status === "ARCHIVED" ? "Đã lưu trữ" : "Nháp"}
        </Badge>
      </td>

      {/* Updated time */}
      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
        {formatDate(course.updated_at || course.created_at)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          {course.status !== "ARCHIVED" && (
            <button
              onClick={onPublish}
              disabled={publishing}
              className={cn(
                "p-2 rounded-xl transition-all duration-200 text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-cyan-400/40",
                course.status === "DRAFT"
                  ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800/60"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 text-slate-550 dark:text-slate-400 border-slate-200 dark:border-slate-800"
              )}
              title={course.status === "DRAFT" ? "Xuất bản" : "Gỡ xuống (bản nháp)"}
            >
              {publishing ? (
                <Spinner className="w-4 h-4 border-2" />
              ) : course.status === "DRAFT" ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                title="Thao tác khác"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/20 shadow-xl rounded-2xl p-1.5 min-w-[170px] z-50">
              <DropdownMenuItem
                onClick={onOpen}
                className="text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-blue-950/60 focus:text-blue-600 dark:focus:text-cyan-400 cursor-pointer flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                <span>Chỉnh sửa chi tiết</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onArchive}
                disabled={archiving}
                className="text-amber-600 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-950/40 cursor-pointer flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors"
              >
                {archiving ? (
                  <Spinner className="w-4 h-4" />
                ) : course.status === "ARCHIVED" ? (
                  <ArchiveRestore className="w-4 h-4 text-amber-500" />
                ) : (
                  <Archive className="w-4 h-4 text-amber-500" />
                )}
                <span>{course.status === "ARCHIVED" ? "Khôi phục" : "Lưu trữ"}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onDelete}
                disabled={deleting}
                className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors"
              >
                {deleting ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-500" />
                )}
                <span>Xóa khóa học</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}

// ─── Course Card (Mobile View) ────────────────────────────────────────────────
export function CourseMobileCard({
  course, onOpen, onPublish, onArchive, onDelete, publishing, archiving, deleting
}: {
  course: Course;
  onOpen: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  publishing: boolean;
  archiving: boolean;
  deleting: boolean;
}) {
  return (
    <div
      className={cn(
        "p-4 flex flex-col gap-4 border-b border-slate-100 dark:border-blue-500/5 relative",
        course.status === "ARCHIVED" && "opacity-75"
      )}
      onClick={course.status === "ARCHIVED" ? undefined : onOpen}
    >
      <div className="flex gap-3">
        <div className="w-16 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0D192E] dark:to-[#0F1E35] flex items-center justify-center flex-shrink-0 relative border border-slate-200 dark:border-blue-500/15">
          {course.thumbnail_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={course.thumbnail_url} alt={course.title} className="object-cover w-full h-full" />
          ) : (
            <BookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-50 truncate max-w-[200px]">
              {course.title}
            </span>
            <Badge variant={course.status === "PUBLISHED" ? "green" : course.status === "ARCHIVED" ? "gray" : "yellow"}>
              {course.status === "PUBLISHED" ? "Đã XB" : course.status === "ARCHIVED" ? "Lưu trữ" : "Nháp"}
            </Badge>
          </div>
          <p className="text-xs text-slate-550 dark:text-slate-400 truncate mt-1">
            {course.description || "Chưa có mô tả"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100/80 dark:border-blue-500/5">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-[#0D192E] border border-slate-250/50 dark:border-blue-500/10">
            <Users className="w-3 h-3 text-blue-500" />
            {course.enrollment_count ?? 0} HV
          </span>
          {course.level && (
            <Badge variant={
              course.level === "BEGINNER" ? "green" :
              course.level === "INTERMEDIATE" ? "yellow" :
              course.level === "ADVANCED" ? "red" : "blue"
            }>
              {course.level === "BEGINNER" ? "Cơ bản" :
               course.level === "INTERMEDIATE" ? "Trung cấp" :
               course.level === "ADVANCED" ? "Nâng cao" : "Mọi cấp"}
            </Badge>
          )}
        </div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          CN: {formatDate(course.updated_at || course.created_at).split(" ")[0]}
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="flex items-center justify-end gap-1.5 mt-2" onClick={e => e.stopPropagation()}>
        {course.status !== "ARCHIVED" && (
          <button
            onClick={onPublish}
            disabled={publishing}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold border flex items-center gap-1",
              course.status === "DRAFT"
                ? "bg-emerald-50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800/60"
                : "bg-slate-50 dark:bg-slate-900/50 text-slate-550 dark:text-slate-400 border-slate-200 dark:border-slate-800"
            )}
          >
            {publishing ? <Spinner className="w-3 h-3" /> : course.status === "DRAFT" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {course.status === "DRAFT" ? "Xuất bản" : "Nháp"}
          </button>
        )}

        <button
          onClick={onArchive}
          disabled={archiving}
          className="p-1.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 text-xs font-semibold flex items-center gap-1"
        >
          {archiving ? <Spinner className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          Lưu trữ
        </button>

        <button
          onClick={onOpen}
          className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1"
        >
          <Settings className="w-3.5 h-3.5" />
          Sửa
        </button>

        <button
          onClick={onDelete}
          disabled={deleting}
          className="p-1.5 rounded-xl bg-red-50/50 dark:bg-red-950/10 text-red-500 dark:text-red-455 border border-red-200/60 dark:border-red-950/45 text-xs font-semibold flex items-center gap-1"
        >
          {deleting ? <Spinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
          Xóa
        </button>
      </div>
    </div>
  );
}
