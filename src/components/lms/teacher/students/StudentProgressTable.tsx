"use client";

/**
 * StudentProgressTable.tsx
 *
 * Bảng hiển thị tất cả học viên với:
 * - Avatar, tên, email
 * - Progress bar tiến độ bắt buộc
 * - Điểm quiz TB
 * - Hoạt động cuối
 * - Click để xem chi tiết
 */

import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  User, TrendingUp, Award, Clock, AlertTriangle
} from "lucide-react";
import { CourseStudentProgress } from "@/services/analyticsService";
import { cn } from "@/lib/utils";

interface Props {
  students:   CourseStudentProgress[];
  sortBy:     keyof CourseStudentProgress;
  sortDir:    "asc" | "desc";
  onSort:     (col: keyof CourseStudentProgress) => void;
  selectedId: number | null;
  onSelect:   (s: CourseStudentProgress) => void;
  courseId:   number;
}

function SortIcon({ col, sortBy, sortDir }: {
  col: keyof CourseStudentProgress;
  sortBy: keyof CourseStudentProgress;
  sortDir: "asc" | "desc";
}) {
  if (col !== sortBy) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />;
  return sortDir === "asc"
    ? <ChevronUp   className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
    : <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
}

function Th({
  col, label, sortBy, sortDir, onSort, className = ""
}: {
  col: keyof CourseStudentProgress;
  label: string;
  sortBy: keyof CourseStudentProgress;
  sortDir: "asc" | "desc";
  onSort: (col: keyof CourseStudentProgress) => void;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors",
        className
      )}
      onClick={() => onSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon col={col} sortBy={sortBy} sortDir={sortDir} />
      </div>
    </th>
  );
}

function ProgressCell({ pct, completed, total }: {
  pct: number; completed: number; total: number;
}) {
  const color =
    pct >= 80 ? "bg-emerald-500" :
    pct >= 50 ? "bg-blue-500" :
    pct >= 20 ? "bg-amber-400" :
    "bg-red-400";

  return (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "text-xs font-semibold",
          pct >= 80 ? "text-emerald-600 dark:text-emerald-400" :
          pct >= 50 ? "text-blue-600 dark:text-blue-400" :
          pct >= 20 ? "text-amber-600 dark:text-amber-400" :
          "text-red-500 dark:text-red-400"
        )}>
          {pct.toFixed(0)}%
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {completed}/{total}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase();
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0", color)}>
      {initials}
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function StudentProgressTable({
  students, sortBy, sortDir, onSort, selectedId, onSelect,
}: Props) {
  if (students.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <User className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Không tìm thấy học viên</p>
        <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <Th col="student_name" label="Học viên" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="pl-5 min-w-[200px]" />
              <Th col="progress_percent" label="Tiến độ" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="min-w-[160px]" />
              <Th col="quiz_avg_score" label="Điểm TB Quiz" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <Th col="last_activity" label="Hoạt động cuối" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map(student => {
              const isSelected = student.student_id === selectedId;
              const atRisk = student.progress_percent < 20 && student.total_mandatory > 0;

              return (
                <tr
                  key={student.student_id}
                  onClick={() => onSelect(student)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  )}
                >
                  {/* Student */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={student.student_name} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                          {student.student_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {student.student_email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Progress */}
                  <td className="px-4 py-3.5">
                    <ProgressCell
                      pct={student.progress_percent}
                      completed={student.completed_content}
                      total={student.total_mandatory}
                    />
                  </td>

                  {/* Quiz avg */}
                  <td className="px-4 py-3.5">
                    {student.quiz_avg_score != null ? (
                      <div className="flex items-center gap-1.5">
                        <Award className={cn(
                          "w-3.5 h-3.5",
                          student.quiz_avg_score >= 70
                            ? "text-emerald-500" : "text-amber-500"
                        )} />
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {student.quiz_avg_score.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Chưa làm</span>
                    )}
                  </td>

                  {/* Last activity */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      {formatDate(student.last_activity)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    {atRisk ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                        <AlertTriangle className="w-3 h-3" />
                        Cần chú ý
                      </span>
                    ) : student.progress_percent >= 100 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                        <TrendingUp className="w-3 h-3" />
                        Hoàn thành
                      </span>
                    ) : student.progress_percent > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/50">
                        Đang học
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Chưa bắt đầu</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
