"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { lmsService } from "@/services/lmsService";
import { aiService } from "@/services/aiService";
import { analyticsService } from "@/services/analyticsService";
import { progressService, type ProgressDetailItem } from "@/services/progressService";
import {
  BookOpen, Clock, CheckCircle2,
  ChevronRight, Search, RefreshCw,
  Award, Brain, Target, AlertTriangle, TrendingUp, HelpCircle,
  ListTodo, CheckSquare, Layers
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
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";

// ─── Stats row ────────────────────────────────────────────────────────────────

function LearningStats({
  enrollments,
  averageProgress
}: {
  enrollments: Enrollment[];
  averageProgress: number;
}) {
  const accepted = enrollments.filter(e => e.status === "ACCEPTED");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
  const [averageProgress, setAverageProgress] = useState(0);

  // Selected Course details for Analytics
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [flashcardStats, setFlashcardStats] = useState<any>(null);
  const [quizScores, setQuizScores] = useState<any[]>([]);
  const [lessonProgress, setLessonProgress] = useState<any>(null);
  const [microInteractions, setMicroInteractions] = useState<any>(null);
  const [spacedRepQuizzes, setSpacedRepQuizzes] = useState<any>(null);
  const [analyticsTab, setAnalyticsTab] = useState<"lessons" | "mastery" | "flashcards">("lessons");

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
      setSelectedCourseId(prev => {
        if (enrollList.length > 0 && !prev) {
          return enrollList[0].course_id;
        }
        return prev;
      });

      // Calculate average progress
      if (enrollList.length > 0) {
        const sum = enrollList.reduce((acc, curr) => acc + (curr.progress_percent || 0), 0);
        setAverageProgress(sum / enrollList.length);
      } else {
        setAverageProgress(0);
      }



    } catch (e) {
      console.error(e);
      setError("Không thể tải thông tin tiến độ học tập.");
    } finally {
      setLoadingEnrolled(false);
    }
  }, []);


  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ── Load course-specific analytics ──────────────────────────────────────────

  const loadCourseAnalytics = useCallback(async (courseId: number) => {
    setLoadingAnalytics(true);
    try {
      const result = await analyticsService.getStudentAnalyticsSummary(courseId);
      const summary = result?.data;

      if (summary) {
        // Format heatmap for radar chart (max 8 nodes for readable chart)
        const formattedHeatmap = (summary.heatmap || []).slice(0, 8).map((n: any) => ({
          subject: n.name_vi || n.node_name,
          "Độ thông thạo (%)": Math.round((n.avg_mastery || n.mastery_level || 0) * 100),
        }));
        setHeatmapData(formattedHeatmap);

        // Spaced repetition stats
        setFlashcardStats(summary.flashcards);

        // Quiz best scores
        setQuizScores(summary.quiz_scores || []);

        // Lesson progress
        setLessonProgress(summary.lesson_progress);

        // Micro interactions
        setMicroInteractions(summary.micro_interactions);

        // Spaced rep quizzes stats
        setSpacedRepQuizzes(summary.spaced_rep_quizzes);
      }
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

  const COLORS = ["#10b981", "#3b82f6", "#64748b"];

  const getPieData = () => {
    if (!flashcardStats) return [];
    return [
      { name: "Đã nhuần nhuyễn", value: flashcardStats.total_mastered || 0 },
      { name: "Đang học", value: flashcardStats.total_learning || 0 },
      { name: "Thẻ mới chưa ôn", value: flashcardStats.total_new || 0 },
    ].filter(d => d.value > 0);
  };

  const getFormatData = () => {
    if (!lessonProgress || !lessonProgress.by_type) return [];
    const labelMap: Record<string, string> = {
      VIDEO: "Video",
      DOCUMENT: "Tài liệu",
      TEXT: "Bài đọc",
      IMAGE: "Hình ảnh",
      QUIZ: "Trắc nghiệm",
      FORUM: "Thảo luận",
      ANNOUNCEMENT: "Thông báo",
    };
    return lessonProgress.by_type.map((item: any) => ({
      name: labelMap[item.content_type] || item.content_type,
      "Đã học": item.completed,
      "Chưa học": Math.max(0, item.total - item.completed),
      "Tổng số": item.total,
    }));
  };

  const getSectionStats = () => {
    if (!lessonProgress || !lessonProgress.by_section) return [];
    return lessonProgress.by_section.map((item: any) => ({
      section: item.section_title,
      total: item.total,
      completed: item.completed,
      percent: item.percent,
    }));
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

      {/* ── Stats row ── */}
      {loadingEnrolled ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <LearningStats
          enrollments={acceptedEnrollments}
          averageProgress={averageProgress}
        />
      )}


      {/* ── Dashboard Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Column 1: Courses List ── */}
        <div className="lg:col-span-1 space-y-6 min-w-0">
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
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {selectedCourseId ? (
            <Card className="p-6 space-y-6">
              {/* Selector and course name */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    <Target className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">Phân tích học tập cá nhân</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-1 truncate" title={currentCourse?.course_title}>
                    {currentCourse?.course_title || `Chi tiết Khóa học #${selectedCourseId}`}
                  </h3>
                </div>

                <select
                  value={selectedCourseId ?? ""}
                  onChange={e => setSelectedCourseId(Number(e.target.value))}
                  className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 flex-shrink-0 sm:max-w-[200px]"
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
                <div className="space-y-6">
                  {/* Tab selector buttons */}
                  <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 overflow-x-auto">
                    <button
                      onClick={() => setAnalyticsTab("lessons")}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                        analyticsTab === "lessons"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <ListTodo className="w-4 h-4" />
                      Tiến độ bài học
                    </button>
                    <button
                      onClick={() => setAnalyticsTab("mastery")}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                        analyticsTab === "mastery"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Target className="w-4 h-4" />
                      Năng lực & Quiz
                    </button>
                    <button
                      onClick={() => setAnalyticsTab("flashcards")}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                        analyticsTab === "flashcards"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Brain className="w-4 h-4" />
                      Ghi nhớ (Flashcard)
                    </button>
                  </div>

                  {/* Render Tabs content */}
                  {analyticsTab === "lessons" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Format completion chart */}
                        <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 flex flex-col h-[320px]">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-blue-500" />
                            Bài học đã hoàn thành theo loại học liệu
                          </h4>
                          {!lessonProgress || lessonProgress.total_content === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                              <p className="text-xs text-slate-500">Chưa có bài học nào trong khóa học này.</p>
                            </div>
                          ) : (
                            <div className="flex-1 min-h-0 w-full relative">
                              {mounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={getFormatData()} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                                    <Bar dataKey="Đã học" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="Chưa học" fill="#cbd5e1" stackId="a" radius={[4, 4, 0, 0]} className="dark:fill-slate-700" />
                                  </BarChart>
                                </ResponsiveContainer>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Section completion checklist */}
                        <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 flex flex-col h-[320px]">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-1.5">
                            <ListTodo className="w-4 h-4 text-emerald-500" />
                            Tiến độ học tập theo chương học
                          </h4>
                          {!lessonProgress || !lessonProgress.by_section || lessonProgress.by_section.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                              <ListTodo className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                              <p className="text-xs text-slate-500">Chưa có chương học nào được cấu hình.</p>
                            </div>
                          ) : (
                            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                              {getSectionStats().map((s, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800/50 shadow-xs">
                                  <div className="flex justify-between items-start gap-3 mb-1.5">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[70%]">
                                      {s.section}
                                    </span>
                                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                                      {s.completed}/{s.total} bài ({s.percent}%)
                                    </span>
                                  </div>
                                  <ProgressBar
                                    value={s.completed}
                                    max={s.total}
                                    color={s.percent === 100 ? "green" : "blue"}
                                    showPercent={false}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {analyticsTab === "mastery" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Radar Chart */}
                        <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 flex flex-col h-[320px]">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-blue-500" />
                            Độ thông thạo theo chủ đề kiến thức (Heatmap)
                          </h4>
                          {heatmapData.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                              <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                              <p className="text-xs text-slate-500">Chưa có đủ dữ liệu tương tác để phân tích độ thông thạo chủ đề.</p>
                            </div>
                          ) : (
                            <div className="flex-1 min-h-0 w-full relative">
                              {mounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={heatmapData}>
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

                        {/* Quiz results */}
                        <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 flex flex-col h-[320px]">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-500" />
                            Điểm trắc nghiệm (Quizzes) cao nhất đạt được
                          </h4>
                          {quizScores.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                              <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                              <p className="text-xs text-slate-500">Chưa làm bài trắc nghiệm nào trong khóa học này.</p>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex-1 max-h-[160px] overflow-auto pr-1 w-full relative">
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
                                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={110} />
                                      <Tooltip formatter={(value) => `${value}%`} />
                                      <Bar dataKey="Điểm (%)" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={15} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                {quizScores.slice(0, 4).map(q => (
                                  <div key={q.quiz_id} className="bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[80px]">{q.quiz_title}</span>
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

                      {/* Quick check and Spaced Rep quiz results */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {microInteractions && microInteractions.total_interactions > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 flex flex-col">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-1.5">
                              <CheckSquare className="w-4 h-4 text-emerald-500" />
                              Đánh giá tương tác nhanh (Concept check)
                            </h4>
                            <div className="grid grid-cols-3 gap-3 text-center text-xs flex-1">
                              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
                                <p className="text-slate-500">Số câu trả lời</p>
                                <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1">{microInteractions.total_interactions}</p>
                              </div>
                              <div className="bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
                                <p className="text-slate-500">Số câu trả lời đúng</p>
                                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{microInteractions.total_correct}</p>
                              </div>
                              <div className="bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
                                <p className="text-slate-500">Độ chính xác</p>
                                <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                                  {Math.round((microInteractions.total_correct / microInteractions.total_interactions) * 100)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {spacedRepQuizzes && spacedRepQuizzes.total_tracked > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 flex flex-col">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4 text-violet-500" />
                              Luyện tập Lặp lại ngắt quãng (Quiz SM-2)
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs flex-1">
                              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs flex justify-between items-center">
                                <span className="text-slate-500">Tổng số câu theo dõi:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{spacedRepQuizzes.total_tracked}</span>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs flex justify-between items-center">
                                <span className="text-slate-500">Cần làm hôm nay:</span>
                                <span className={`font-bold ${spacedRepQuizzes.due_today > 0 ? "text-orange-600" : "text-emerald-600"}`}>{spacedRepQuizzes.due_today}</span>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs flex justify-between items-center">
                                <span className="text-slate-500">Đã nhớ tốt (Mastered):</span>
                                <span className="font-bold text-emerald-600">{spacedRepQuizzes.mastered}</span>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs flex justify-between items-center">
                                <span className="text-slate-500">Chất lượng TB:</span>
                                <span className="font-bold text-violet-600">{spacedRepQuizzes.avg_quality.toFixed(1)}/5.0</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {analyticsTab === "flashcards" && (
                    <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-6">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-violet-500" />
                        Theo dõi ghi nhớ qua Spaced Repetition (Hệ thống thẻ Flashcard)
                      </h4>
                      {!flashcardStats || flashcardStats.total_active === 0 ? (
                        <div className="text-center py-10">
                          <Brain className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Chưa có flashcard nào được tạo. Hãy mở bài học và tạo flashcard để bắt đầu ôn tập thông minh.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                          <div className="w-[180px] h-[180px] flex-shrink-0 relative flex items-center justify-center">
                            {mounted && (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={getPieData()}
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="value"
                                  >
                                    {getPieData().map((entry, index) => {
                                      const colorMap: Record<string, string> = {
                                        "Đã nhuần nhuyễn": "#10b981",
                                        "Đang học": "#3b82f6",
                                        "Thẻ mới chưa ôn": "#64748b",
                                      };
                                      return <Cell key={`cell-${index}`} fill={colorMap[entry.name] || "#3b82f6"} />;
                                    })}
                                  </Pie>
                                  <Tooltip formatter={(value) => `${value} thẻ`} />
                                </PieChart>
                              </ResponsiveContainer>
                            )}
                            <div className="absolute flex flex-col items-center justify-center">
                              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{flashcardStats.total_active}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-semibold">Tổng thẻ</span>
                            </div>
                          </div>

                          <div className="space-y-4 flex-1 max-w-sm">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
                                <p className="text-slate-500 dark:text-slate-400">Cần ôn hôm nay</p>
                                <p className={`text-lg font-extrabold mt-1 ${flashcardStats.due_today > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                                  {flashcardStats.due_today} thẻ
                                </p>
                              </div>
                              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
                                <p className="text-slate-500 dark:text-slate-400">Đã ôn hôm nay</p>
                                <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                                  {flashcardStats.reviewed_today} thẻ
                                </p>
                              </div>
                              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
                                <p className="text-slate-500 dark:text-slate-400">Độ dễ trung bình (EF)</p>
                                <p className="text-lg font-extrabold text-violet-600 dark:text-violet-400 mt-1">
                                  {flashcardStats.avg_easiness.toFixed(2)}
                                </p>
                              </div>
                              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
                                <p className="text-slate-500 dark:text-slate-400">Tổng số lượt ôn</p>
                                <p className="text-lg font-extrabold text-slate-700 dark:text-slate-300 mt-1">
                                  {flashcardStats.total_reviews} lượt
                                </p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />Nhuần nhuyễn: {flashcardStats.total_mastered}</span>
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />Đang học: {flashcardStats.total_learning}</span>
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />Mới: {flashcardStats.total_new}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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