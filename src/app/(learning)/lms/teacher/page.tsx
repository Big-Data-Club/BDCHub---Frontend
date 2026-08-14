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
  EmptyState, PageLoader, Alert, ProgressBar, GridBackground,
  QuickActionCard, TeacherSummaryCard, TeacherHeader
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
      {/* ── Premium Full-width Header synced with Teacher Suite ── */}
      <TeacherHeader
        title="Tổng quan Giảng dạy"
        description="Quản lý khóa học của bạn, theo dõi dữ liệu chuyên sâu và kết nối với học viên."
        actions={
          <div className="w-full lg:max-w-xl xl:max-w-2xl flex-shrink-0">
            <TeacherSummaryCard
              totalCourses={totalCoursesCount}
              publishedCourses={publishedCoursesCount}
              draftCourses={draftCoursesCount}
              totalStudents={totalUniqueStudents}
            />
          </div>
        }
      />

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
                <QuickActionCard
                  icon={<Plus className="w-5 h-5" />}
                  title="Tạo khóa học mới"
                  description="Thêm bài học, giáo trình, và tài liệu vào LMS"
                  accentColor="blue"
                  actionLabel="Tạo khóa học"
                  onClick={() => router.push("/lms/teacher/courses/create")}
                />
                <QuickActionCard
                  icon={<BookOpen className="w-5 h-5" />}
                  title="Quản lý khóa học"
                  description="Xem chi tiết các bài học, sửa đổi nội dung đã đăng"
                  accentColor="cyan"
                  actionLabel="Xem khóa học"
                  onClick={() => router.push("/lms/teacher/courses")}
                />
                <QuickActionCard
                  icon={<ClipboardList className="w-5 h-5" />}
                  title="Bài tập & Quizzes"
                  description="Quản lý hệ thống câu hỏi, trắc nghiệm và chấm điểm"
                  accentColor="green"
                  actionLabel="Quản lý Quizzes"
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
