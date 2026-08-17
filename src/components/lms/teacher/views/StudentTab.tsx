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
import Link from "next/link";
import { analyticsService, CourseStudentProgress } from "@/services/analyticsService";
import { StudentProgressTable } from "@/components/lms/teacher/students/StudentProgressTable";
import { TabBar }               from "@/components/lms/shared";
import { UserAvatar }           from "@/components/user/UserAvatar";

interface Props {
  courseId: number;
}

export function StudentsTab({ courseId }: Props) {
  const [students, setStudents]     = useState<CourseStudentProgress[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [filterTab, setFilterTab]   = useState<"ALL" | "IN_PROGRESS" | "COMPLETED" | "ATTENTION">("ALL");
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

  const counts = {
    all: students.length,
    inProgress: students.filter(s => s.progress_percent > 0 && s.progress_percent < 100).length,
    completed: students.filter(s => s.progress_percent >= 100).length,
    attention: students.filter(s => s.progress_percent < 20 && s.total_mandatory > 0).length,
  };

  const filtered = students
    .filter(s => {
      const matchesSearch =
        !search ||
        s.student_name.toLowerCase().includes(search.toLowerCase()) ||
        s.student_email.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterTab === "IN_PROGRESS") return s.progress_percent > 0 && s.progress_percent < 100;
      if (filterTab === "COMPLETED") return s.progress_percent >= 100;
      if (filterTab === "ATTENTION") return s.progress_percent < 20 && s.total_mandatory > 0;
      return true;
    })
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
    <div className="relative space-y-6">
      {/* Search + Tab filters + Refresh Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#0F1E35] p-3.5 rounded-2xl border border-slate-200/80 dark:border-blue-500/15 shadow-xs">
        {/* Left: Filter tabs */}
        <div className="flex-1 min-w-0">
          <TabBar
            tabs={[
              { id: "ALL",         label: "Tất cả",     badge: counts.all },
              { id: "IN_PROGRESS", label: "Đang học",   badge: counts.inProgress },
              { id: "COMPLETED",   label: "Hoàn tất",   badge: counts.completed },
              { id: "ATTENTION",   label: "Cần chú ý",  badge: counts.attention },
            ]}
            active={filterTab}
            onChange={id => setFilterTab(id as any)}
          />
        </div>

        {/* Right: Search Input + Refresh trigger */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm tên, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 border border-slate-200/80 dark:border-blue-500/20 rounded-xl bg-slate-50/80 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-cyan-500/40 focus:border-blue-500 dark:focus:border-cyan-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0D192E] border border-slate-200/60 dark:border-blue-500/15">
            {filtered.length} học viên
          </span>

          <button
            onClick={() => fetchStudents(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200/80 dark:border-blue-500/15 bg-white dark:bg-[#0D192E] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-40 shadow-2xs"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600 dark:text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main area: table + optional detail panel side-by-side */}
      <div className={`flex gap-6 ${selected ? "items-start" : ""}`}>
        {/* Table - shrinks when panel is open */}
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

        {/* Inline detail panel (not fixed) - appears when a student is selected */}
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
  X, Award, Clock, CheckCircle2, AlertCircle, MessageSquare
} from "lucide-react";

function InlineStudentDetail({
  student, onClose,
}: {
  student: CourseStudentProgress;
  courseId: number;
  onClose: () => void;
}) {
  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-";

  const pct     = student.progress_percent;
  const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : pct >= 20 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="bg-white dark:bg-[#0F1E35] rounded-3xl border border-slate-200/80 dark:border-blue-500/20 shadow-lg overflow-hidden animate-fadeIn duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 dark:border-blue-500/15 bg-slate-50/50 dark:bg-[#0D192E]/50">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-cyan-400">Chi tiết học viên</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title="Đóng bảng thông tin (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Profile */}
        <div className="flex items-center gap-3.5">
          <UserAvatar
            name={student.student_name}
            src={student.student_avatar_url}
            className="w-12 h-12 ring-2 ring-blue-500/30"
          />
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{student.student_name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{student.student_email}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              Hoạt động: {formatDate(student.last_activity)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2 p-3.5 bg-slate-50/80 dark:bg-[#0D192E] rounded-2xl border border-slate-200/60 dark:border-blue-500/15">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">Tiến độ bắt buộc</span>
            <span className={pct >= 80 ? "text-emerald-600 dark:text-emerald-400" : pct >= 50 ? "text-blue-600 dark:text-cyan-400" : "text-amber-600 dark:text-amber-400"}>
              {pct.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {student.completed_content} hoàn thành
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              {student.total_mandatory - student.completed_content} còn lại
            </span>
          </div>
        </div>

        {/* Quiz avg */}
        {student.quiz_avg_score != null && (
          <div className="flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-[#0D192E] rounded-2xl border border-slate-200/60 dark:border-blue-500/15">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Điểm quiz trung bình</span>
            </div>
            <span className={`text-xs font-black ${student.quiz_avg_score >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {student.quiz_avg_score.toFixed(1)}%
            </span>
          </div>
        )}

        {/* Alert */}
        {pct < 20 && student.total_mandatory > 0 && (
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/90 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-500/30">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-relaxed">
              Tiến độ dưới 20% — Khuyến nghị gửi nhắc nhở hoặc hỗ trợ học viên.
            </p>
          </div>
        )}
        {pct === 100 && student.total_mandatory > 0 && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50/90 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Đã hoàn thành toàn bộ nội dung bắt buộc!
            </p>
          </div>
        )}

        {/* Contact Action */}
        <Link
          href={`/chat?userId=${student.student_id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-xs"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Liên hệ học viên</span>
        </Link>
      </div>
    </div>
  );
}