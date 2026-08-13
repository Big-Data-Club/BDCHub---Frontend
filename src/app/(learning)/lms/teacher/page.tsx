"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { analyticsService } from "@/services/analyticsService";
import {
  BookOpen, Users, CheckCircle2,
  Plus, ChevronRight, TrendingUp,
  RefreshCw, LogOut, Home, Search, Award, GraduationCap, ClipboardList, HelpCircle, X
} from "lucide-react";
import {
  Card, SectionHeader,
  PrimaryBtn, SecondaryBtn, GhostBtn,
  EmptyState, PageLoader, Alert, ProgressBar, GridBackground
} from "@/components/lms/shared";
import { useSession } from "next-auth/react";
import type { TeacherDashboardSummaryResponse } from "@/services/analyticsService";

const DASHBOARD_CACHE_TTL_MS = 5 * 60 * 1000;

function readDashboardCache(key: string): TeacherDashboardSummaryResponse | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { savedAt: number; data: TeacherDashboardSummaryResponse };
    return cached?.data && Date.now() - cached.savedAt < DASHBOARD_CACHE_TTL_MS ? cached.data : null;
  } catch {
    return null;
  }
}

const TeacherDashboardCharts = dynamic(
  () => import("@/components/lms/teacher/page/TeacherDashboardCharts").then((module) => module.TeacherDashboardCharts),
  { ssr: false, loading: () => <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><div className="h-[350px] animate-pulse rounded-2xl bg-slate-155 dark:bg-slate-800/40" /><div className="h-[350px] animate-pulse rounded-2xl bg-slate-155 dark:bg-slate-800/40" /></div> },
);

// ─── Quick action card ────────────────────────────────────────────────────────

function ActionCard({
  icon, title, description, onClick, variant = "default",
}: {
  icon: React.ReactNode; title: string; description: string;
  onClick: () => void;
  variant?: "default" | "primary" | "success" | "warning";
}) {
  const VARIANT = {
    default: "border-slate-200/80 dark:border-blue-500/10 hover:border-slate-350 dark:hover:border-blue-500/25 bg-white/70 dark:bg-[#0D192E]/60",
    primary: "border-blue-200/60 dark:border-blue-800/30 hover:border-blue-450 dark:hover:border-blue-600/60 bg-blue-50/40 dark:bg-blue-950/10",
    success: "border-[#10b981]/30 dark:border-[#10b981]/15 hover:border-[#10b981]/50 dark:hover:border-[#10b981]/30 bg-emerald-50/30 dark:bg-emerald-950/10",
    warning: "border-amber-250 dark:border-amber-500/15 hover:border-amber-400 dark:hover:border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10",
  };
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all active:scale-97 hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_8px_25px_rgba(6,182,212,0.02)] w-full text-left backdrop-blur-xs ${VARIANT[variant]}`}
    >
      <div className="text-2xl flex-shrink-0 mt-0.5 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div>
        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-wide">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const userName = session?.user?.name || "giảng viên";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [totalCoursesCount, setTotalCoursesCount] = useState(0);
  const [publishedCoursesCount, setPublishedCoursesCount] = useState(0);
  const [draftCoursesCount, setDraftCoursesCount] = useState(0);
  const [totalUniqueStudents, setTotalUniqueStudents] = useState(0);

  // Search query for courses list
  const [searchQuery, setSearchQuery] = useState("");

  // Aggregated course statistics list
  const [courseStats, setCourseStats] = useState<any[]>([]);

  // Timeline & comparison charts data
  const [registrationTimeline, setRegistrationTimeline] = useState<any[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keydown listener for focusing search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") ||
        ((e.metaKey || e.ctrlKey) && e.key === "k")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const dashboardCacheKey = session?.user?.id ? `lms:teacher-dashboard:v2:${session.user.id}` : null;

  const applySummary = useCallback((summary: TeacherDashboardSummaryResponse) => {
    setTotalCoursesCount(summary.totalCoursesCount);
    setPublishedCoursesCount(summary.publishedCoursesCount);
    setDraftCoursesCount(summary.draftCoursesCount);
    setTotalUniqueStudents(summary.totalUniqueStudents);
    setRegistrationTimeline(summary.registrationTimeline || []);
    setCourseStats(summary.courseStats || []);
  }, []);

  const loadDashboard = useCallback(async ({ background = false } = {}) => {
    setIsSyncing(true);
    if (!background) setLoading(true);
    setError("");
    try {
      const summaryRes = await analyticsService.getTeacherDashboardSummary();
      const summary = summaryRes?.data;

      if (summary) {
        applySummary(summary);
        if (dashboardCacheKey) {
          sessionStorage.setItem(dashboardCacheKey, JSON.stringify({ savedAt: Date.now(), data: summary }));
        }
      }
    } catch (e) {
      console.error(e);
      setError("Không thể tải thông tin thống kê. Vui lòng thử lại.");
    } finally {
      setIsSyncing(false);
      if (!background) setLoading(false);
    }
  }, [applySummary, dashboardCacheKey]);

  useEffect(() => {
    const role = sessionStorage.getItem("lms_selected_role");
    if (role !== "TEACHER" && role !== "ADMIN") { router.push("/lms"); return; }
    if (sessionStatus === "loading") return;

    const cached = dashboardCacheKey ? readDashboardCache(dashboardCacheKey) : null;
    if (cached) {
      applySummary(cached);
      setLoading(false);
      void loadDashboard({ background: true });
      return;
    }
    void loadDashboard();
  }, [router, sessionStatus, dashboardCacheKey, applySummary, loadDashboard]);

  // Filter courses by search query
  const filteredCourseStats = useMemo(() => {
    if (!searchQuery.trim()) return courseStats;
    return courseStats.filter(stat => 
      stat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courseStats, searchQuery]);

  if (loading) return <PageLoader message="Đang tải dashboard giảng viên..." />;

  const publishedPercent = totalCoursesCount > 0 ? (publishedCoursesCount / totalCoursesCount) * 100 : 0;
  const draftPercent = totalCoursesCount > 0 ? (draftCoursesCount / totalCoursesCount) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* ── Premium Full-width Header synced with StudentDashboardHeader ── */}
      <div className="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-4 md:py-5">
        <GridBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 w-full">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <p className="text-xs text-blue-600 dark:text-cyan-400 uppercase tracking-widest font-extrabold mb-1">
              Hệ thống quản lý học tập (LMS)
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Tổng quan Giảng dạy 👨‍🏫
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Quản lý khóa học của bạn, theo dõi dữ liệu chuyên sâu và kết nối với học viên.
            </p>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <GhostBtn
                size="sm"
                icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />}
                onClick={() => loadDashboard()}
                className="active:scale-95 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0D192E]/60 backdrop-blur-xs font-semibold"
              >
                Làm mới
              </GhostBtn>
              <GhostBtn
                size="sm"
                icon={<Home className="w-3.5 h-3.5" />}
                onClick={() => router.push("/")}
                className="active:scale-95 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0D192E]/60 backdrop-blur-xs font-semibold"
              >
                Trang chủ
              </GhostBtn>
              <GhostBtn
                size="sm"
                icon={<LogOut className="w-3.5 h-3.5" />}
                onClick={() => { sessionStorage.removeItem("lms_selected_role"); router.push("/lms"); }}
                className="active:scale-95 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0D192E]/60 backdrop-blur-xs font-semibold"
              >
                Đổi vai trò
              </GhostBtn>
            </div>
          </div>

          {/* Teacher Summary Mirror Card */}
          <div className="w-full lg:max-w-xl xl:max-w-2xl flex-shrink-0">
            <div className="group/card bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-xs border border-slate-200/85 dark:border-blue-500/15 rounded-2xl p-4 shadow-xs hover:border-slate-355 dark:hover:border-blue-500/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:hover:shadow-[0_8px_30px_rgba(6,182,212,0.03)] w-full grid grid-cols-1 md:grid-cols-[1fr_1.25px_1fr] gap-x-6 gap-y-3 relative">
              
              {/* Left column: Courses status */}
              <div className="md:col-start-1 flex flex-col justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50/80 text-blue-600 dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/20 group-hover/card:scale-105 transition-all duration-300">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trạng thái Khóa học</h4>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Tổng số: <span className="text-blue-600 dark:text-cyan-400 font-bold">{totalCoursesCount}</span> khóa học đã tạo
                </p>

                <div className="h-2.5 w-full mt-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-[#080F1E]">
                  {publishedCoursesCount > 0 && (
                    <div style={{ width: `${publishedPercent}%` }} className="bg-emerald-500 dark:bg-emerald-400" title={`Đã xuất bản: ${publishedCoursesCount}`} />
                  )}
                  {draftCoursesCount > 0 && (
                    <div style={{ width: `${draftPercent}%` }} className="bg-amber-500 dark:bg-amber-450" title={`Bản nháp: ${draftCoursesCount}`} />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-blue-500/10">
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Đã xuất bản</span>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{publishedCoursesCount}</p>
                  </div>
                  <div className="text-center border-l border-slate-200/60 dark:border-blue-500/10">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Bản nháp</span>
                    <p className="text-base font-extrabold text-amber-600 dark:text-amber-450 mt-0.5">{draftCoursesCount}</p>
                  </div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden md:block md:col-start-2 w-[1.5px] bg-slate-200 dark:bg-blue-500/15 self-stretch my-1 transition-all duration-300 flex-shrink-0" />

              {/* Right column: Learner Engagement */}
              <div className="md:col-start-3 flex flex-col justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-50/80 text-purple-600 dark:bg-purple-950/65 dark:text-purple-300 border border-purple-200/50 dark:border-purple-500/20 group-hover/card:scale-105 transition-all duration-300">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tác động giảng dạy</h4>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Tổng số học viên trong các lớp học của bạn
                </p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {totalUniqueStudents}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Học viên</span>
                </div>

                <div className="mt-auto border-t border-slate-200/60 dark:border-blue-500/10 pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                    <span>Lớp đang hoạt động</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">24/7 Live</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Content Container (Middle and Bottom) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-grow">
        {error && <Alert type="error">{error}</Alert>}

        {/* ── Dashboard Layout Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Analytics & Course Table (lg:col-span-8) ── */}
          <div className="lg:col-span-8 space-y-8 min-w-0 order-last lg:order-first">
            
            {/* Visual analytics charts */}
            <TeacherDashboardCharts registrationTimeline={registrationTimeline} courseStats={courseStats} />

            {/* Detailed Course breakdown */}
            <Card className="p-6 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-500" /> Thống kê chi tiết khóa học
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Xem dữ liệu chi tiết, độ hoàn thành và điểm số trung bình của từng bài học.</p>
                </div>
                <div className="relative max-w-xs w-full">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm khóa học... (/)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs py-2 pl-8 pr-8 rounded-xl border border-slate-200 dark:border-blue-500/15 bg-white/60 dark:bg-[#0D192E]/60 text-slate-800 dark:text-slate-100 placeholder-slate-450 focus:border-blue-500 focus:outline-hidden transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#1a2d48]"
                      aria-label="Xóa nội dung tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="sr-only" aria-live="polite">
                    {searchQuery ? `Tìm thấy ${filteredCourseStats.length} kết quả` : ""}
                  </span>
                </div>
              </div>

              {filteredCourseStats.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="w-12 h-12 text-slate-400" />}
                  title={searchQuery ? "Không tìm thấy kết quả" : "Chưa có khóa học hoạt động"}
                  description={searchQuery ? "Thử thay đổi từ khóa tìm kiếm của bạn." : "Hãy bắt đầu tạo và xuất bản khóa học của bạn để tiếp cận học viên."}
                  action={
                    !searchQuery && (
                      <PrimaryBtn size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => router.push("/lms/teacher/courses/create")}>
                        Tạo khóa học ngay
                      </PrimaryBtn>
                    )
                  }
                />
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <div className="inline-block min-w-full align-middle px-6">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                      <thead>
                        <tr className="text-left text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          <th className="pb-3 pt-2">Khóa học</th>
                          <th className="pb-3 pt-2">Học viên</th>
                          <th className="pb-3 pt-2 w-[180px]">Hoàn thành TB</th>
                          <th className="pb-3 pt-2">Điểm Quiz TB</th>
                          <th className="pb-3 pt-2 text-right">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150/60 dark:divide-slate-800/40">
                        {filteredCourseStats.map((stat) => (
                          <tr key={stat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group/row">
                            <td className="py-4 pr-3">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-500/10 flex-shrink-0 relative">
                                  {stat.thumbnail_url ? (
                                    <Image src={stat.thumbnail_url} alt={`Ảnh đại diện khóa học ${stat.title}`} fill sizes="56px" className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                      <BookOpen className="w-4 h-4 text-slate-400" />
                                    </div>
                                  )}
                                </div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover/row:text-blue-600 dark:group-hover/row:text-cyan-400 transition-colors">{stat.title}</span>
                              </div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{stat.studentCount} học viên</span>
                            </td>
                            <td className="py-4 pr-4 whitespace-nowrap">
                              <ProgressBar
                                value={stat.avgProgress}
                                max={100}
                                color={stat.avgProgress >= 70 ? "green" : stat.avgProgress >= 40 ? "blue" : "orange"}
                                showPercent={true}
                              />
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              {stat.avgQuiz !== null ? (
                                <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(stat.avgQuiz)}%</span>
                              ) : (
                                <span className="text-xs text-slate-400 dark:text-slate-600 italic">Không có Quiz</span>
                              )}
                            </td>
                            <td className="py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => router.push(`/lms/teacher/courses/${stat.id}`)}
                                className="text-xs font-bold py-1.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-355 transition-all duration-200 active:scale-95 border border-transparent dark:border-blue-500/10 hover:border-slate-300 dark:hover:border-blue-500/25"
                              >
                                Xem lớp
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* ── Right Column: Sticky Sidebar (lg:col-span-4) ── */}
          <div className="lg:col-span-4 space-y-6 min-w-0 order-first lg:order-last lg:sticky lg:top-20">
            
            {/* Quick Actions Card */}
            <Card className="p-6">
              <SectionHeader title="Thao tác nhanh" />
              <div className="flex flex-col gap-3.5 mt-2">
                <ActionCard
                  icon={<Plus className="w-6 h-6 text-blue-600 dark:text-cyan-400" />}
                  title="Tạo khóa học mới"
                  description="Thêm bài học, giáo trình, và tài liệu vào LMS"
                  variant="primary"
                  onClick={() => router.push("/lms/teacher/courses/create")}
                />
                <ActionCard
                  icon={<BookOpen className="w-6 h-6 text-slate-600 dark:text-slate-355" />}
                  title="Quản lý khóa học"
                  description="Xem chi tiết các bài học, sửa đổi nội dung đã đăng"
                  onClick={() => router.push("/lms/teacher/courses")}
                />
                <ActionCard
                  icon={<ClipboardList className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
                  title="Bài tập & Quizzes"
                  description="Quản lý hệ thống câu hỏi, trắc nghiệm và chấm điểm"
                  variant="success"
                  onClick={() => router.push("/lms/teacher/quiz")}
                />
              </div>
            </Card>

            {/* Information / AI Guide Card */}
            <div className="group/guide relative overflow-hidden border border-slate-200/85 dark:border-blue-500/15 rounded-3xl p-6 bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-xs hover:border-slate-350 dark:hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-cyan-50/80 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-455 border border-cyan-200/50 dark:border-cyan-500/20 transition-all duration-300">
                  <Award className="w-4 h-4 transform group-hover/guide:rotate-12 transition-transform duration-300" />
                </div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">Trợ lý AI Giảng dạy</h4>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                Tạo Quiz tự động bằng AI trong vài giây
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                Nhập văn bản bài viết, học liệu hoặc tài liệu PDF của bài giảng để AI Mentor tự động biên soạn các câu hỏi trắc nghiệm, điền từ vào chỗ trống cực kỳ trực quan và đa dạng.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => router.push("/lms/teacher/ai-assistant")}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Trải nghiệm AI Assistant</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
