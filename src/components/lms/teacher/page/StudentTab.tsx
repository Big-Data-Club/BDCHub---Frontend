"use client";

/**
 * StudentsTab.tsx
 *
 * Toàn bộ nội dung từ trang /students được đóng gói thành một tab component.
 * Props duy nhất: courseId (number).
 *
 * Đặt tại: components/lms/teacher/tabs/StudentsTab.tsx
 */

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Search } from "lucide-react";
import { analyticsService, CourseStudentProgress } from "@/services/analyticsService";
import { StudentSummaryBar }    from "@/components/lms/teacher/students/StudentSummaryBar";
import { StudentProgressTable } from "@/components/lms/teacher/students/StudentProgressTable";

interface Props {
  courseId: number;
}

export function StudentsTab({ courseId }: Props) {
  const [students, setStudents]     = useState<CourseStudentProgress[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<CourseStudentProgress | null>(null);
  const [sortBy, setSortBy]         = useState<keyof CourseStudentProgress>("progress_percent");
  const [sortDir, setSortDir]       = useState<"asc" | "desc">("desc");

  const fetchStudents = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await analyticsService.getCourseStudentProgressOverview(courseId);
      const data = res?.data ?? (res as any);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSort = (col: keyof CourseStudentProgress) => {
    if (col === sortBy) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const filtered = students
    .filter(s =>
      !search ||
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortBy] as any ?? 0;
      const bv = b[sortBy] as any ?? 0;
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av - bv) : (bv - av);
    });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-80" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    // relative để StudentDetailPanel có thể dùng sticky bên trong tab layout
    <div className="relative">
      {/* Summary bar */}
      <StudentSummaryBar students={students} />

      {/* Search + refresh */}
      <div className="flex items-center gap-3 mt-6 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {filtered.length} học viên
        </span>
        <button
          onClick={() => fetchStudents(true)}
          disabled={refreshing}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
          title="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main area: table + optional detail panel side-by-side */}
      <div className={`flex gap-6 ${selected ? "items-start" : ""}`}>
        {/* Table — shrinks when panel is open */}
        <div className={`min-w-0 ${selected ? "flex-1" : "w-full"}`}>
          <StudentProgressTable
            students={filtered}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            selectedId={selected?.student_id ?? null}
            onSelect={s => setSelected(prev => prev?.student_id === s.student_id ? null : s)}
            courseId={courseId}
          />
        </div>

        {/* Inline detail panel (not fixed) — appears when a student is selected */}
        {selected && (
          <div className="w-80 xl:w-96 flex-shrink-0 sticky top-4">
            <InlineStudentDetail
              student={selected}
              courseId={courseId}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Inline student detail (non-fixed variant for use inside a tab) ─────────────

import {
  X, Award, Clock, CheckCircle2, AlertCircle
} from "lucide-react";

function InlineStudentDetail({
  student, courseId, onClose,
}: {
  student: CourseStudentProgress;
  courseId: number;
  onClose: () => void;
}) {
  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  const colors = [
    "from-blue-400 to-blue-600", "from-violet-400 to-violet-600",
    "from-emerald-400 to-emerald-600", "from-amber-400 to-amber-600",
    "from-pink-400 to-pink-600",
  ];
  const gradient = colors[student.student_name.charCodeAt(0) % colors.length];
  const initials  = student.student_name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase();

  const pct     = student.progress_percent;
  const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : pct >= 20 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Chi tiết học viên</span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-slate-50 truncate">{student.student_name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{student.student_email}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {formatDate(student.last_activity)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Tiến độ bắt buộc</span>
            <span className={pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-blue-600" : "text-amber-600"}>
              {pct.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {student.completed_content} xong
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              {student.total_mandatory - student.completed_content} còn lại
            </span>
          </div>
        </div>

        {/* Quiz avg */}
        {student.quiz_avg_score != null && (
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Điểm quiz TB</span>
            </div>
            <span className={`text-sm font-bold ${student.quiz_avg_score >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {student.quiz_avg_score.toFixed(1)}%
            </span>
          </div>
        )}

        {/* Alert */}
        {pct < 20 && student.total_mandatory > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/50">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Tiến độ dưới 20% — nên liên hệ hỗ trợ.
            </p>
          </div>
        )}
        {pct === 100 && student.total_mandatory > 0 && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Hoàn thành tất cả nội dung bắt buộc!
            </p>
          </div>
        )}

        {/* Contact */}
        <a
          href={`mailto:${student.student_email}`}
          className="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
        >
          Liên hệ học viên
        </a>
      </div>
    </div>
  );
}