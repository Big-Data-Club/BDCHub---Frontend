"use client";

/**
 * StudentProgressTable.tsx
 *
 * Bảng hiển thị danh sách học viên trong khóa học:
 * - Sử dụng component DataTable dùng chung tích hợp giao diện Responsive
 * - Avatar, tên, email học viên
 * - Progress bar tiến độ nội dung bắt buộc
 * - Điểm TB Quiz
 * - Hoạt động gần nhất
 * - Hỗ trợ phân loại trạng thái ("Cần chú ý", "Hoàn thành", "Đang học", "Chưa bắt đầu")
 * - Chọn hàng để hiển thị Side Panel thông tin chi tiết
 */

import {
  TrendingUp, Award, Clock, AlertTriangle, ChevronRight
} from "lucide-react";
import { CourseStudentProgress } from "@/services/lms/analyticsService";
import { UserAvatar } from "@/components/user/UserAvatar";
import { ProgressBar, DataTable, ColumnDef } from "@/components/lms/shared";
import { cn } from "@/lib/utils";

interface Props {
  students: CourseStudentProgress[];
  sortBy: keyof CourseStudentProgress;
  sortDir: "asc" | "desc";
  onSort: (col: keyof CourseStudentProgress) => void;
  selectedId: number | null;
  onSelect: (s: CourseStudentProgress) => void;
  courseId: number;
}

function ProgressCell({ pct, completed, total }: {
  pct: number; completed: number; total: number;
}) {
  const color =
    pct >= 80 ? "green" :
    pct >= 50 ? "blue" :
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

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function StudentProgressTable({
  students, sortBy, sortDir, onSort, selectedId, onSelect,
}: Props) {

  const columns: ColumnDef<CourseStudentProgress>[] = [
    {
      key: "student_name",
      sortable: true,
      sortKey: "student_name",
      width: "25%",
      minWidth: "220px",
      header: "Học viên",
      cell: (student) => (
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            name={student.student_name}
            src={student.student_avatar_url}
            className="h-9 w-9 ring-1 ring-blue-500/20 flex-shrink-0"
            fallbackClassName="text-xs"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {student.student_name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
              {student.student_email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "progress_percent",
      sortable: true,
      sortKey: "progress_percent",
      width: "22%",
      minWidth: "160px",
      header: "Tiến độ học",
      cell: (student) => (
        <ProgressCell
          pct={student.progress_percent}
          completed={student.completed_content}
          total={student.total_mandatory}
        />
      ),
    },
    {
      key: "quiz_avg_score",
      sortable: true,
      sortKey: "quiz_avg_score",
      width: "18%",
      minWidth: "130px",
      header: "Điểm TB Quiz",
      cell: (student) => (
        student.quiz_avg_score != null ? (
          <div className="flex items-center gap-1.5">
            <Award className={cn(
              "w-4 h-4 flex-shrink-0",
              student.quiz_avg_score >= 70
                ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"
            )} />
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              {student.quiz_avg_score.toFixed(1)}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Chưa làm</span>
        )
      ),
    },
    {
      key: "last_activity",
      sortable: true,
      sortKey: "last_activity",
      width: "18%",
      minWidth: "130px",
      header: "Hoạt động cuối",
      cell: (student) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
          {formatDate(student.last_activity)}
        </div>
      ),
    },
    {
      key: "status",
      width: "17%",
      minWidth: "120px",
      header: "Trạng thái",
      cell: (student) => {
        const atRisk = student.progress_percent < 20 && student.total_mandatory > 0;
        return (
          <div>
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
          </div>
        );
      },
    },
  ];

  return (
    <DataTable<CourseStudentProgress>
      data={students}
      columns={columns}
      keyExtractor={(student) => student.student_id}
      sortBy={sortBy as string}
      sortDir={sortDir}
      onSort={(key) => onSort(key as keyof CourseStudentProgress)}
      onRowClick={(student) => onSelect(student)}
      rowClassName={(student) =>
        cn(
          "transition-all duration-150 outline-none",
          student.student_id === selectedId
            ? "bg-blue-50/90 dark:bg-cyan-950/40 ring-1 ring-inset ring-blue-500/40 dark:ring-cyan-500/50"
            : ""
        )
      }
      emptyState={
        <div className="py-8 text-center">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Không tìm thấy học viên</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Thử thay đổi hoặc xóa từ khóa tìm kiếm</p>
        </div>
      }
      renderMobileCard={(student) => {
        const isSelected = student.student_id === selectedId;
        const atRisk = student.progress_percent < 20 && student.total_mandatory > 0;

        return (
          <div
            onClick={() => onSelect(student)}
            className={cn(
              "p-4 border-b border-slate-100 dark:border-blue-500/10 cursor-pointer transition-all active:scale-[0.99]",
              isSelected
                ? "bg-blue-50/90 dark:bg-cyan-950/40"
                : "bg-white dark:bg-[#0F1E35] hover:bg-slate-50/80 dark:hover:bg-[#0D192E]/70"
            )}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar
                  name={student.student_name}
                  src={student.student_avatar_url}
                  className="h-10 w-10 ring-1 ring-blue-500/20 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {student.student_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                    {student.student_email}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>

            <div className="space-y-2">
              <ProgressCell
                pct={student.progress_percent}
                completed={student.completed_content}
                total={student.total_mandatory}
              />

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-blue-500/10">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(student.last_activity)}
                </div>

                <div>
                  {atRisk ? (
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-500/30">
                      Cần chú ý
                    </span>
                  ) : student.progress_percent >= 100 ? (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-500/30">
                      Hoàn thành
                    </span>
                  ) : student.progress_percent > 0 ? (
                    <span className="text-[11px] font-bold text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded-full border border-blue-200/80 dark:border-cyan-500/30">
                      Đang học
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Chưa bắt đầu</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}

