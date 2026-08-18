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
import { CourseStudentProgress } from "@/services/lms/analyticsService";
import { UserAvatar } from "@/components/user/UserAvatar";
import { ProgressBar } from "@/components/lms/shared";
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
    pct >= 80 ? "green" :
    pct >= 50 ? "blue" :
    pct >= 20 ? "orange" :
    "orange";

  return (
    <div className="min-w-[140px]">
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "text-xs font-bold",
          pct >= 80 ? "text-emerald-600 dark:text-emerald-400" :
          pct >= 50 ? "text-blue-600 dark:text-blue-400" :
          pct >= 20 ? "text-amber-600 dark:text-amber-400" :
          "text-rose-500 dark:text-rose-400"
        )}>
          {pct.toFixed(0)}%
        </span>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {completed}/{total}
        </span>
      </div>
      <ProgressBar
        value={pct}
        max={100}
        color={color}
        showPercent={false}
        className="w-full"
      />
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
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
  if (!d) return "-";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function StudentProgressTable({
  students, sortBy, sortDir, onSort, selectedId, onSelect,
}: Props) {
  if (students.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F1E35] rounded-3xl border border-slate-200/80 dark:border-blue-500/15 p-12 text-center shadow-xs">
        <User className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Không tìm thấy học viên</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Thử thay đổi hoặc xóa từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F1E35] rounded-3xl border border-slate-200/80 dark:border-blue-500/15 shadow-xs overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-blue-500/15 bg-slate-50/80 dark:bg-[#0D192E]/80 backdrop-blur-md">
              <Th col="student_name" label="Học viên" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="pl-6 min-w-[220px]" />
              <Th col="progress_percent" label="Tiến độ học" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="min-w-[160px]" />
              <Th col="quiz_avg_score" label="Điểm TB Quiz" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <Th col="last_activity" label="Hoạt động cuối" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-cyan-400 uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-blue-500/10">
            {students.map(student => {
              const isSelected = student.student_id === selectedId;
              const atRisk = student.progress_percent < 20 && student.total_mandatory > 0;

              return (
                <tr
                  key={student.student_id}
                  onClick={() => onSelect(student)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(student); } }}
                  className={cn(
                    "cursor-pointer transition-all duration-150 outline-none focus:bg-blue-50/70 dark:focus:bg-blue-900/30",
                    isSelected
                      ? "bg-blue-50/90 dark:bg-cyan-950/40 ring-1 ring-inset ring-blue-500/40 dark:ring-cyan-500/50"
                      : "hover:bg-slate-50/80 dark:hover:bg-[#0D192E]/70"
                  )}
                >
                  {/* Student */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={student.student_name} src={student.student_avatar_url} className="h-9 w-9 ring-1 ring-blue-500/20" fallbackClassName="text-xs" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {student.student_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {student.student_email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Progress */}
                  <td className="px-5 py-4">
                    <ProgressCell
                      pct={student.progress_percent}
                      completed={student.completed_content}
                      total={student.total_mandatory}
                    />
                  </td>

                  {/* Quiz avg */}
                  <td className="px-5 py-4">
                    {student.quiz_avg_score != null ? (
                      <div className="flex items-center gap-1.5">
                        <Award className={cn(
                          "w-4 h-4",
                          student.quiz_avg_score >= 70
                            ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"
                        )} />
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {student.quiz_avg_score.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Chưa làm</span>
                    )}
                  </td>

                  {/* Last activity */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                      {formatDate(student.last_activity)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {atRisk ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200/80 dark:border-amber-500/30">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Cần chú ý
                      </span>
                    ) : student.progress_percent >= 100 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-500/30">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        Hoàn thành
                      </span>
                    ) : student.progress_percent > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-cyan-950/50 px-2.5 py-1 rounded-full border border-blue-200/80 dark:border-cyan-500/30">
                        Đang học
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Chưa bắt đầu</span>
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
