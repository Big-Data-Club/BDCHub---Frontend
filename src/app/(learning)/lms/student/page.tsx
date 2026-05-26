"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { lmsService } from "@/services/lmsService";
import { aiService } from "@/services/aiService";
import { analyticsService } from "@/services/analyticsService";
import {
  BookOpen, Clock, CheckCircle2,
  ChevronRight, Search, RefreshCw,
  Award, Brain, Target, AlertTriangle, TrendingUp, HelpCircle
} from "lucide-react";
import {
  StatCard, Card,
  ProgressBar, PrimaryBtn, GhostBtn,
  EmptyState, PageLoader, Alert,
  InfiniteScrollTrigger, Badge
} from "@/components/lms/shared";
import { Enrollment } from "@/types";
import {
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell
} from "recharts";

// ─── Stats row ────────────────────────────────────────────────────────────────

function LearningStats({
  enrollments,
  totalDueToday,
  averageProgress
}: {
  enrollments: Enrollment[];
  totalDueToday: number;
  averageProgress: number;
}) {
  const accepted = enrollments.filter(e => e.status === "ACCEPTED");

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        label="Đã đăng ký"
        value={accepted.length}
        sub="khóa học đang học"
        icon={<BookOpen className="w-5 h-5" />}
        accent="blue"
      />
      <StatCard
        label="Hoàn thành trung bình"
        value={`${Math.round(averageProgress)}%`}
        sub="tiến độ toàn khóa"
        icon={<CheckCircle2 className="w-5 h-5" />}
        accent="green"
      />
      <StatCard
        label="Cần ôn tập hôm nay"
        value={totalDueToday}
        sub="thẻ ghi nhớ"
        icon={<Brain className="w-5 h-5" />}
        accent={totalDueToday > 0 ? "orange" : "blue"}
      />
      <StatCard
        label="Đang tiến hành"
        value={accepted.filter(e => (e.progress_percent || 0) < 100).length}
        sub="khóa học chưa xong"
        icon={<Clock className="w-5 h-5" />}
        accent="purple"
      />
    </div>
  );
}

// ─── Enrolled course item ─────────────────────────────────────────────────────

function EnrolledCourseItem({
  enrollment,
  onOpen
}: { enrollment: Enrollment; onOpen: (id: number) => void }) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group border border-slate-100 dark:border-slate-800/30"
      onClick={() => onOpen(enrollment.course_id)}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-slate-50 truncate">
          {enrollment.course_title ?? `Khóa học #${enrollment.course_id}`}
        </p>
        {enrollment.teacher_name && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Giảng viên: <span className="font-medium text-slate-700 dark:text-slate-300">{enrollment.teacher_name}</span>
          </p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <ProgressBar value={enrollment.progress_percent || 0} max={100} color="blue" showPercent={true} className="flex-1" />
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [acceptedEnrollments, setAcceptedEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [error, setError] = useState("");

  // Aggregate stats
  const [totalDueToday, setTotalDueToday] = useState(0);
  const [averageProgress, setAverageProgress] = useState(0);

  // Selected Course details for Analytics
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [flashcardStats, setFlashcardStats] = useState<any>(null);
  const [quizScores, setQuizScores] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Load general data ───────────────────────────────────────────────────────

  const loadAllData = useCallback(async () => {
    setLoadingEnrolled(true);
    setError("");
    try {
      const accepted = await lmsService.getMyEnrollments("ACCEPTED");
      const enrollList = accepted || [];
      setAcceptedEnrollments(enrollList);

      // Select first course by default for analytics
      if (enrollList.length > 0 && !selectedCourseId) {
        setSelectedCourseId(enrollList[0].course_id);
      }

      // Calculate average progress
      if (enrollList.length > 0) {
        const sum = enrollList.reduce((acc, curr) => acc + (curr.progress_percent || 0), 0);
        setAverageProgress(sum / enrollList.length);
      } else {
        setAverageProgress(0);
      }

      // Fetch spaced repetition stats across all courses
      const statsPromises = enrollList.map((e: Enrollment) =>
        aiService.getReviewStats(e.course_id).catch(() => null)
      );
      const statsList = await Promise.all(statsPromises);
      const sumDue = statsList.reduce((acc, curr) => acc + (curr?.due_today ?? 0), 0);
      setTotalDueToday(sumDue);

    } catch (e) {
      console.error(e);
      setError("Không thể tải thông tin tiến độ học tập.");
    } finally {
      setLoadingEnrolled(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ── Load course-specific analytics ──────────────────────────────────────────

  const loadCourseAnalytics = useCallback(async (courseId: number) => {
    setLoadingAnalytics(true);
    try {
      const [heatmap, fcStats, quizzes] = await Promise.all([
        aiService.getStudentHeatmap(courseId).catch(() => []),
        analyticsService.getFlashcardStats(courseId).catch(() => null),
        analyticsService.getMyQuizScores(courseId).catch(() => ({ data: [] }))
      ]);

      // Format heatmap for radar chart (max 8 nodes for readable chart)
      const formattedHeatmap = (heatmap || []).slice(0, 8).map(n => ({
        subject: n.name_vi || n.node_name,
        "Độ thông thạo (%)": Math.round(n.avg_mastery * 100),
      }));
      setHeatmapData(formattedHeatmap);

      // Spaced repetition stats
      setFlashcardStats(fcStats?.data ?? null);

      // Quiz best scores
      setQuizScores(quizzes?.data || []);

    } catch (e) {
      console.error("Error loading course analytics:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseAnalytics(selectedCourseId);
    }
  }, [selectedCourseId, loadCourseAnalytics]);

  // ── Render Helpers ──────────────────────────────────────────────────────────

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#8b5cf6", "#f59e0b"];

  const getPieData = () => {
    if (!flashcardStats) return [];
    return [
      { name: "Cần ôn tập", value: flashcardStats.today_due_count || 0 },
      { name: "Sắp tới", value: flashcardStats.upcoming_count || 0 },
      { name: "Đang học", value: Math.max(0, (flashcardStats.learning_count || 0) - (flashcardStats.today_due_count || 0) - (flashcardStats.upcoming_count || 0)) },
    ].filter(d => d.value > 0);
  };

  const currentCourse = acceptedEnrollments.find(e => e.course_id === selectedCourseId);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
            Trang tổng quan học tập
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Chào mừng bạn trở lại! Xem phân tích thông minh và tối ưu hóa lộ trình của mình.
          </p>
        </div>
        <GhostBtn
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={loadAllData}
        >
          Làm mới
        </GhostBtn>
      </div>

      {/* ── Error alert ── */}
      {error && <Alert type="error">{error}</Alert>}

      {/* ── Spaced Repetition Due Reminder Banner ── */}
      {totalDueToday > 0 && (
        <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/10 dark:from-orange-500/10 dark:to-transparent border border-orange-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-50 text-base">Cần ôn tập kiến thức hôm nay</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Bạn có <span className="font-bold text-orange-600 dark:text-orange-400">{totalDueToday}</span> thẻ ôn tập cần được củng cố theo chu kỳ lặp lại ngắt quãng.
              </p>
            </div>
          </div>
          <PrimaryBtn
            size="sm"
            icon={<ChevronRight className="w-4 h-4" />}
            onClick={() => router.push(selectedCourseId ? `/lms/student/courses/${selectedCourseId}` : "/lms/student")}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Ôn tập ngay
          </PrimaryBtn>
        </div>
      )}

      {/* ── Stats row ── */}
      {loadingEnrolled ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <LearningStats
          enrollments={acceptedEnrollments}
          totalDueToday={totalDueToday}
          averageProgress={averageProgress}
        />
      )}

      {/* ── Dashboard Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Column 1: Courses List ── */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden h-full flex flex-col">
            <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  Khóa học đang theo học
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Chọn khóa học để hiển thị phân tích chi tiết
                </p>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              {loadingEnrolled ? (
                <PageLoader />
              ) : acceptedEnrollments.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="w-14 h-14" />}
                  title="Chưa học khóa nào"
                  description="Hãy khám phá và đăng ký khóa học phù hợp với bạn."
                  action={
                    <PrimaryBtn icon={<Search className="w-4 h-4" />} onClick={() => router.push("/lms/student/discover")}>
                      Khám phá khóa học
                    </PrimaryBtn>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {acceptedEnrollments.map(en => {
                    const isSelected = en.course_id === selectedCourseId;
                    return (
                      <div
                        key={en.id}
                        className={`relative rounded-2xl transition-all duration-200 ${
                          isSelected
                            ? "ring-2 ring-blue-500/70 border-transparent bg-blue-50/30 dark:bg-blue-900/10"
                            : ""
                        }`}
                        onClick={() => setSelectedCourseId(en.course_id)}
                      >
                        <EnrolledCourseItem
                          enrollment={en}
                          onOpen={id => router.push(`/lms/student/courses/${id}`)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Column 2 & 3: Personal Insights ── */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCourseId ? (
            <Card className="p-6 space-y-6">
              {/* Selector and course name */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    <Target className="w-3.5 h-3.5" />
                    Phân tích học tập cá nhân
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                    {currentCourse?.course_title || `Chi tiết Khóa học #${selectedCourseId}`}
                  </h3>
                </div>

                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(Number(e.target.value))}
                  className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {acceptedEnrollments.map(e => (
                    <option key={e.course_id} value={e.course_id}>
                      {e.course_title}
                    </option>
                  ))}
                </select>
              </div>

              {loadingAnalytics ? (
                <PageLoader message="Đang tải dữ liệu phân tích khóa học..." />
              ) : (
                <div className="space-y-8">
                  {/* Visual Analytics row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Heatmap/Mastery Radar chart */}
                    <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 flex flex-col h-[320px]">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-blue-500" />
                        Độ thông thạo theo chủ đề
                      </h4>
                      {heatmapData.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                          <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                          <p className="text-xs text-slate-500">Chưa có đủ tương tác làm bài trắc nghiệm để vẽ biểu đồ thông thạo.</p>
                        </div>
                      ) : (
                        <div className="flex-1">
                          {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" radius="70%" data={heatmapData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                                <Radar
                                  name="Thông thạo"
                                  dataKey="Độ thông thạo (%)"
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  fillOpacity={0.3}
                                />
                                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                              </RadarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Spaced repetition status chart */}
                    <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 flex flex-col h-[320px]">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-violet-500" />
                        Trạng thái Spaced Repetition (Flashcard)
                      </h4>
                      {!flashcardStats || (flashcardStats.learning_count === 0 && flashcardStats.today_due_count === 0) ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                          <Brain className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                          <p className="text-xs text-slate-500">Chưa có flashcard nào được tạo. Hãy vào bài học và tạo flashcard để ghi nhớ.</p>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-4">
                          <div className="w-[160px] h-[160px] flex-shrink-0">
                            {mounted && (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={getPieData()}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                  >
                                    {getPieData().map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => `${value} thẻ`} />
                                </PieChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <span className="text-slate-500">Cần ôn tập:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{flashcardStats.today_due_count || 0} thẻ</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <span className="text-slate-500">Đã lên lịch (Upcoming):</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{flashcardStats.upcoming_count || 0} thẻ</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-emerald-500" />
                              <span className="text-slate-500">Tổng đang theo dõi:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{flashcardStats.learning_count || 0} thẻ</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Quiz results stats */}
                  <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-5">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      Điểm trắc nghiệm (Quizzes) cao nhất đạt được
                    </h4>
                    {quizScores.length === 0 ? (
                      <div className="text-center py-6">
                        <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">Chưa làm bài trắc nghiệm nào trong khóa học này.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="max-h-[220px] overflow-auto pr-1">
                          {mounted && (
                            <ResponsiveContainer width="100%" height={Math.max(120, quizScores.length * 40)}>
                              <BarChart
                                layout="vertical"
                                data={quizScores.map(q => ({
                                  name: q.quiz_title,
                                  "Điểm (%)": q.best_percentage || 0
                                }))}
                                margin={{ left: 10, right: 10, top: 0, bottom: 0 }}
                              >
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={120} />
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Bar dataKey="Điểm (%)" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={15} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                          {quizScores.map(q => (
                            <div key={q.quiz_id} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{q.quiz_title}</span>
                              <Badge variant={q.is_passed ? "green" : q.best_percentage ? "red" : "gray"}>
                                {q.best_percentage !== null ? `${Math.round(q.best_percentage)}%` : "Chưa làm"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
              <Target className="w-12 h-12 text-slate-400 dark:text-slate-700 mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy phân tích</h3>
              <p className="text-sm text-slate-500 mt-1">Đăng ký và tham gia một khóa học để bắt đầu ghi nhận phân tích học tập.</p>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}