"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import lmsService from "@/services/lmsService";
import { analyticsService } from "@/services/analyticsService";
import {
  BookOpen, Users, CheckCircle2,
  Plus, ChevronRight, TrendingUp,
  RefreshCw, LogOut, Home, Award
} from "lucide-react";
import {
  StatCard, Card, SectionHeader,
  Badge, PrimaryBtn, SecondaryBtn, GhostBtn,
  EmptyState, PageLoader, Alert, ProgressBar
} from "@/components/lms/shared";
import { Course } from "@/types";
import { getCookie } from "@/utils/cookies";
import {
  ResponsiveContainer, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, CartesianGrid
} from "recharts";

// ─── Quick action card ────────────────────────────────────────────────────────

function ActionCard({
  icon, title, description, onClick, variant = "default",
}: {
  icon: React.ReactNode; title: string; description: string;
  onClick: () => void;
  variant?: "default" | "primary" | "success" | "warning";
}) {
  const VARIANT = {
    default: "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900",
    primary: "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10",
    success: "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 bg-green-50/50 dark:bg-green-900/10",
    warning: "border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/10",
  };
  return (
    <button
      onClick={onClick}
      className={`relative flex items-start gap-4 p-5 rounded-2xl border transition-all active:scale-95 hover:shadow-sm w-full text-left ${VARIANT[variant]}`}
    >
      <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{description}</p>
      </div>
    </button>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [totalCoursesCount, setTotalCoursesCount] = useState(0);
  const [publishedCoursesCount, setPublishedCoursesCount] = useState(0);
  const [draftCoursesCount, setDraftCoursesCount] = useState(0);
  const [totalUniqueStudents, setTotalUniqueStudents] = useState(0);

  // Aggregated course statistics list
  const [courseStats, setCourseStats] = useState<any[]>([]);

  // Timeline & comparison charts data
  const [registrationTimeline, setRegistrationTimeline] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch teacher courses
      const coursesRes = await lmsService.listMyCourses({ page_size: 100 });
      const courses: Course[] = coursesRes?.data ?? [];

      const published = courses.filter(c => c.status === "PUBLISHED");
      const draft = courses.filter(c => c.status === "DRAFT");

      setTotalCoursesCount(courses.length);
      setPublishedCoursesCount(published.length);
      setDraftCoursesCount(draft.length);

      // 2. Fetch learners and student progress overview for each published course in parallel
      const publishedIds = published.map(c => c.id);

      const learnersPromises = publishedIds.map(id =>
        lmsService.getCourseLearners(id, "ACCEPTED").catch(() => [])
      );

      const progressPromises = publishedIds.map(id =>
        analyticsService.getCourseStudentProgressOverview(id).catch(() => ({ data: [] }))
      );

      const [learnersArrays, progressArrays] = await Promise.all([
        Promise.all(learnersPromises),
        Promise.all(progressPromises)
      ]);

      // 3. Aggregate unique students list & timeline data
      const uniqueStudentsMap = new Map<number, boolean>();
      const timelineMap: Record<string, number> = {};

      learnersArrays.forEach((learners, index) => {
        (learners ?? []).forEach(l => {
          uniqueStudentsMap.set(l.student_id, true);

          if (l.enrolled_at) {
            // Format date to local standard DD/MM
            const dateStr = new Date(l.enrolled_at).toLocaleDateString("vi-VN", {
              month: "2-digit",
              day: "2-digit"
            });
            timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
          }
        });
      });

      setTotalUniqueStudents(uniqueStudentsMap.size);

      // Format timeline data chronologically
      const timelineData = Object.entries(timelineMap)
        .map(([date, count]) => ({ date, "Học viên mới": count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-10); // show last 10 days with activity
      setRegistrationTimeline(timelineData);

      // 4. Calculate stats per course
      const stats = published.map((course, index) => {
        const progressList = progressArrays[index]?.data || [];
        const studentCount = progressList.length;

        let totalProgress = 0;
        let completedProgressCount = 0;
        let totalQuizScore = 0;
        let quizScoreCount = 0;

        progressList.forEach(p => {
          totalProgress += p.progress_percent || 0;
          completedProgressCount++;

          if (p.quiz_avg_score !== null && p.quiz_avg_score !== undefined) {
            totalQuizScore += p.quiz_avg_score;
            quizScoreCount++;
          }
        });

        const avgProgress = completedProgressCount > 0 ? totalProgress / completedProgressCount : 0;
        const avgQuiz = quizScoreCount > 0 ? totalQuizScore / quizScoreCount : null;

        return {
          id: course.id,
          title: course.title,
          thumbnail_url: course.thumbnail_url,
          studentCount,
          avgProgress,
          avgQuiz,
        };
      });

      setCourseStats(stats);

    } catch (e) {
      console.error(e);
      setError("Không thể tải thông tin thống kê. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = sessionStorage.getItem("lms_selected_role");
    if (role !== "TEACHER" && role !== "ADMIN") { router.push("/lms"); return; }
    setUserName(getCookie("userName") || "giảng viên");
    loadDashboard();
  }, [router, loadDashboard]);

  if (loading) return <PageLoader message="Đang tải dashboard giảng viên..." />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Giảng viên</p>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
              {greeting}, {userName} 👨‍🏫
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SecondaryBtn size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={loadDashboard}>Làm mới</SecondaryBtn>
            <GhostBtn size="sm" icon={<Home className="w-4 h-4" />} onClick={() => router.push("/")}>Trang chủ</GhostBtn>
            <GhostBtn size="sm" icon={<LogOut className="w-4 h-4" />}
              onClick={() => { sessionStorage.removeItem("lms_selected_role"); router.push("/lms"); }}>
              Đổi vai trò
            </GhostBtn>
          </div>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Tổng học viên (Unique)"
            value={totalUniqueStudents}
            sub="sinh viên theo học"
            icon={<Users className="w-5 h-5" />}
            accent="purple"
          />
          <StatCard
            label="Tổng khóa học"
            value={totalCoursesCount}
            sub={`${draftCoursesCount} bản nháp`}
            icon={<BookOpen className="w-5 h-5" />}
            accent="blue"
          />
          <StatCard
            label="Đã xuất bản"
            value={publishedCoursesCount}
            icon={<CheckCircle2 className="w-5 h-5" />}
            accent="green"
          />
          <StatCard
            label="Khóa học nháp"
            value={draftCoursesCount}
            sub="chờ hoàn thiện"
            icon={<BookOpen className="w-5 h-5" />}
            accent="orange"
          />
        </div>

        {/* ── Charts Row (Recharts) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Chart 1: Registration Timeline */}
          <Card className="p-5 flex flex-col h-[350px]">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Lượt đăng ký mới của học viên (10 ngày gần đây)
            </h3>
            {registrationTimeline.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Chưa ghi nhận lượt đăng ký mới nào trong những ngày gần đây.
              </div>
            ) : (
              <div className="flex-1">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={registrationTimeline} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="Học viên mới" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </Card>

          {/* Chart 2: Course Engagement comparison */}
          <Card className="p-5 flex flex-col h-[350px]">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-500" />
              So sánh Độ hoàn thành & Điểm Quiz theo khóa học
            </h3>
            {courseStats.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Chưa có dữ liệu khóa học đã xuất bản nào để so sánh.
              </div>
            ) : (
              <div className="flex-1">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={courseStats.map(s => ({
                        name: s.title,
                        "Hoàn thành (%)": Math.round(s.avgProgress),
                        "Điểm Quiz (%)": s.avgQuiz ? Math.round(s.avgQuiz) : 0
                      }))}
                      margin={{ left: -10, right: 10, top: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Bar dataKey="Hoàn thành (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Điểm Quiz (%)" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </Card>

        </div>

        {/* ── Quick actions ── */}
        <Card className="p-6">
          <SectionHeader title="Thao tác nhanh" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ActionCard icon={<Plus className="w-6 h-6 text-blue-600" />}
              title="Tạo khóa học" description="Thêm khóa học mới vào hệ thống" variant="primary"
              onClick={() => router.push("/lms/teacher/courses/create")} />
            <ActionCard icon={<BookOpen className="w-6 h-6 text-slate-600" />}
              title="Quản lý khóa học" description="Xem, chỉnh sửa bài giảng và học liệu"
              onClick={() => router.push("/lms/teacher/courses")} />
            <ActionCard icon={<TrendingUp className="w-6 h-6 text-green-600" />}
              title="Quản lý Quizzes" description="Xem chi tiết các bài kiểm tra trắc nghiệm" variant="success"
              onClick={() => router.push("/lms/teacher/quiz")} />
          </div>
        </Card>

        {/* ── Visual Course Analytics Breakdown ── */}
        <Card className="p-6">
          <SectionHeader
            title="Thống kê chi tiết từng khóa học của bạn"
            action={
              <GhostBtn size="sm" icon={<ChevronRight className="w-4 h-4" />}
                onClick={() => router.push("/lms/teacher/courses")}>
                Xem tất cả khóa học
              </GhostBtn>
            }
          />
          {courseStats.length === 0 ? (
            <EmptyState icon={<BookOpen className="w-10 h-10" />}
              title="Chưa có khóa học nào hoạt động"
              description="Hãy xuất bản khóa học của bạn để học viên có thể học tập."
              action={
                <PrimaryBtn size="sm" icon={<Plus className="w-4 h-4" />}
                  onClick={() => router.push("/lms/teacher/courses")}>
                  Tới danh sách khóa học
                </PrimaryBtn>
              } />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pt-2 pl-2">Khóa học</th>
                    <th className="pb-3 pt-2">Lượng học viên</th>
                    <th className="pb-3 pt-2 w-[180px]">Độ hoàn thành TB</th>
                    <th className="pb-3 pt-2">Điểm Quiz TB</th>
                    <th className="pb-3 pt-2 text-right pr-2">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {courseStats.map(stat => (
                    <tr key={stat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      {/* Course item */}
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="w-14 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex-shrink-0 relative">
                            {stat.thumbnail_url ? (
                              <img src={stat.thumbnail_url} alt={stat.title} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                <BookOpen className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-50 line-clamp-1">{stat.title}</span>
                        </div>
                      </td>

                      {/* Learners count */}
                      <td className="py-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{stat.studentCount} học viên</span>
                      </td>

                      {/* Average progress bar */}
                      <td className="py-4 pr-4">
                        <ProgressBar
                          value={stat.avgProgress}
                          max={100}
                          color={stat.avgProgress >= 70 ? "green" : stat.avgProgress >= 40 ? "blue" : "orange"}
                          showPercent={true}
                        />
                      </td>

                      {/* Average Quiz score */}
                      <td className="py-4">
                        {stat.avgQuiz !== null ? (
                          <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(stat.avgQuiz)}%</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">— (Không có Quiz)</span>
                        )}
                      </td>

                      {/* Link action */}
                      <td className="py-4 text-right pr-2">
                        <button
                          onClick={() => router.push(`/lms/teacher/courses/${stat.id}`)}
                          className="text-xs font-semibold py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}