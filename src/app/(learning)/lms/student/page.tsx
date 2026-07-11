"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { lmsService } from "@/services/lmsService";
import { analyticsService } from "@/services/analyticsService";
import {
  BookOpen, Clock, CheckCircle2,
  ChevronRight, Search, RefreshCw,
  Award, Brain, Target, TrendingUp, HelpCircle,
  ListTodo, CheckSquare, Layers, Sparkles
} from "lucide-react";
import {
  StatCard, Card,
  ProgressBar, PrimaryBtn, GhostBtn,
  EmptyState, PageLoader, Alert,
  Badge,
  InteractiveGlowCard, ProgressCard
} from "@/components/lms/shared";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { FocusCard } from "@/components/lms/student/FocusCard";
import {
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import { Enrollment } from "@/types";
import {
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [acceptedEnrollments, setAcceptedEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [error, setError] = useState("");

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

  // Computed properties for enrollment status & focus course
  const completedEnrollments = acceptedEnrollments.filter(e => (e.progress_percent || 0) === 100);
  const inProgressEnrollments = acceptedEnrollments.filter(e => (e.progress_percent || 0) > 0 && (e.progress_percent || 0) < 100);
  const notStartedEnrollments = acceptedEnrollments.filter(e => (e.progress_percent || 0) === 0);

  const completedCount = completedEnrollments.length;
  const inProgressCount = inProgressEnrollments.length;
  const notStartedCount = notStartedEnrollments.length;
  const totalCount = acceptedEnrollments.length;

  const completedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const inProgressPercent = totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0;
  const notStartedPercent = totalCount > 0 ? Math.max(0, 100 - completedPercent - inProgressPercent) : 0;

  // The next focus course is the one in progress that is closest to completion.
  // If there are none, we look for courses that have not been started yet.
  const focusCourse = inProgressEnrollments.length > 0
    ? inProgressEnrollments.reduce((max, curr) => (curr.progress_percent || 0) > (max.progress_percent || 0) ? curr : max, inProgressEnrollments[0])
    : (notStartedEnrollments.length > 0 ? notStartedEnrollments[0] : null);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen w-full">

      {/* ── Header with Grid Background (Full-width, tràn viền) ── */}
      <div className="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-8 md:py-10">
        {/* Tilted Grid background utilizing the exact global css class bg-grid-paper (40px 40px) and slide animation */}
        <div className="absolute -inset-32 bg-grid-paper pointer-events-none opacity-40 dark:opacity-20 rotate-[10deg] animate-grid-slide" />

        {/* Soft gradient overlays to fade out the grid gracefully */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-100/40 to-slate-100 dark:via-[#050B18]/40 dark:to-[#050B18] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_60%,#050B18_100%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex items-start justify-between gap-6 flex-wrap w-full">
          <div className="min-w-0 flex-1 max-w-xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Tổng quan học tập
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Theo dõi tiến độ, phân tích năng lực và tối ưu hóa lộ trình học tập của bạn.
            </p>
            <div className="mt-4">
              <GhostBtn
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={loadAllData}
                className="hover:scale-[1.02] active:scale-95 border border-slate-250 dark:border-slate-800 bg-white/60 dark:bg-[#0D192E]/60 backdrop-blur-xs font-semibold"
              >
                Làm mới dữ liệu
              </GhostBtn>
            </div>
          </div>

          <div className="w-full md:w-[450px] flex-shrink-0">
            {loadingEnrolled ? (
              <div className="h-[140px] bg-slate-50/50 dark:bg-[#0D192E]/50 rounded-2xl border border-slate-200/80 dark:border-blue-500/10 animate-pulse" />
            ) : (
              <div className="bg-white/80 dark:bg-[#0D192E]/80 backdrop-blur-xs border border-slate-200/85 dark:border-blue-500/15 rounded-2xl p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-500/25 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50/80 text-blue-600 dark:bg-blue-950/60 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tiến độ khóa học</h4>
                  </div>
                </div>

                {totalCount === 0 ? (
                  <div className="text-center py-2 text-xs text-slate-500 dark:text-slate-400">
                    Chưa đăng ký khóa học nào
                  </div>
                ) : (
                  <>
                    {/* Segmented Progress Bar */}
                    <TooltipProvider delayDuration={55}>
                      <div className="h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-[#080F1E] mb-4 border dark:border-blue-500/5">
                        {completedCount > 0 && (
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <div
                                style={{ width: `${completedPercent}%` }}
                                className="bg-emerald-500 dark:bg-emerald-450 transition-all duration-300 hover:brightness-110 hover:scale-y-125 cursor-pointer"
                              />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-white rounded-xl shadow-lg px-3 py-1.5 text-xs font-semibold">
                              Đã xong: {completedCount} khóa ({Math.round(completedPercent)}%)
                            </TooltipContent>
                          </UITooltip>
                        )}
                        {inProgressCount > 0 && (
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <div
                                style={{ width: `${inProgressPercent}%` }}
                                className="bg-blue-600 dark:bg-cyan-500 transition-all duration-300 hover:brightness-110 hover:scale-y-125 cursor-pointer"
                              />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-white rounded-xl shadow-lg px-3 py-1.5 text-xs font-semibold">
                              Đang học: {inProgressCount} khóa ({Math.round(inProgressPercent)}%)
                            </TooltipContent>
                          </UITooltip>
                        )}
                        {notStartedCount > 0 && (
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <div
                                style={{ width: `${notStartedPercent}%` }}
                                className="bg-slate-300 dark:bg-slate-700 transition-all duration-300 hover:brightness-110 hover:scale-y-125 cursor-pointer"
                              />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 text-slate-900 dark:text-white rounded-xl shadow-lg px-3 py-1.5 text-xs font-semibold">
                              Chưa học: {notStartedCount} khóa ({Math.round(notStartedPercent)}%)
                            </TooltipContent>
                          </UITooltip>
                        )}
                      </div>
                    </TooltipProvider>

                    {/* Legend Details */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/60 dark:border-blue-500/10">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-450 flex-shrink-0" />
                          <span>Đã xong</span>
                        </div>
                        <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5 w-full text-center">{completedCount}</p>
                      </div>

                      <div className="flex flex-col items-center justify-center text-center border-x border-slate-200/60 dark:border-blue-500/10">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-500 flex-shrink-0" />
                          <span>Đang học</span>
                        </div>
                        <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5 w-full text-center">{inProgressCount}</p>
                      </div>

                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-650 flex-shrink-0" />
                          <span>Chưa học</span>
                        </div>
                        <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5 w-full text-center">{notStartedCount}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content Container (Middle and Bottom) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-grow">

        {/* ── Error alert ── */}
        {error && <Alert type="error">{error}</Alert>}

        {/* ── Dashboard Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left Column: Main Area (lg:col-span-2) ── */}
          <div className="lg:col-span-2 space-y-8 min-w-0">

            {/* ── Selected Course Analytics ── */}
            {selectedCourseId ? (
              <div className="space-y-6">

                {/* Filter / Selected Course Name */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 dark:border-blue-500/10 pb-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">
                      <Target className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Phân tích hiệu quả học tập</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 truncate" title={currentCourse?.course_title}>
                      {currentCourse?.course_title || `Chi tiết Khóa học #${selectedCourseId}`}
                    </h3>
                  </div>

                  <Select
                    value={selectedCourseId ? String(selectedCourseId) : ""}
                    onValueChange={val => setSelectedCourseId(Number(val))}
                  >
                    <SelectTrigger className="w-full sm:w-[240px] h-10 border border-slate-250 dark:border-blue-500/20 rounded-xl text-sm bg-white dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all flex-shrink-0 font-semibold shadow-sm">
                      <SelectValue placeholder="Chọn khóa học" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0D192E] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                      {acceptedEnrollments.map(e => (
                        <SelectItem key={e.course_id} value={String(e.course_id)} className="cursor-pointer">
                          {e.course_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loadingAnalytics ? (
                  <PageLoader message="Đang phân tích dữ liệu khóa học..." />
                ) : (
                  <div className="space-y-6">
                    {/* Tab selector buttons */}
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-blue-500/10 pb-3 mb-6 overflow-x-auto" role="tablist">
                      <button
                        role="tab"
                        aria-selected={analyticsTab === "lessons"}
                        onClick={() => setAnalyticsTab("lessons")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap active:scale-95 ${analyticsTab === "lessons"
                          ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md"
                          : "text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-950/40 border border-transparent hover:border-slate-200 dark:hover:border-blue-500/10"
                          }`}
                      >
                        <ListTodo className="w-4 h-4" />
                        Tiến độ bài học
                      </button>
                      <button
                        role="tab"
                        aria-selected={analyticsTab === "mastery"}
                        onClick={() => setAnalyticsTab("mastery")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap active:scale-95 ${analyticsTab === "mastery"
                          ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md"
                          : "text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-950/40 border border-transparent hover:border-slate-200 dark:hover:border-blue-500/10"
                          }`}
                      >
                        <Target className="w-4 h-4" />
                        Năng lực & Quiz
                      </button>
                      <button
                        role="tab"
                        aria-selected={analyticsTab === "flashcards"}
                        onClick={() => setAnalyticsTab("flashcards")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap active:scale-95 ${analyticsTab === "flashcards"
                          ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md"
                          : "text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-950/40 border border-transparent hover:border-slate-200 dark:hover:border-blue-500/10"
                          }`}
                      >
                        <Brain className="w-4 h-4" />
                        Ghi nhớ (Flashcard)
                      </button>
                    </div>

                    {/* Render Tabs content */}
                    {analyticsTab === "lessons" && (
                      <div className="space-y-6" role="tabpanel">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Format completion chart */}
                          <InteractiveGlowCard interactive={true} accentColor="blue" className="p-0 overflow-hidden">
                            <div className="p-4 flex flex-col h-[320px]">
                              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                                Theo loại học liệu
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
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-blue-950/30" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                                        <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px", background: "#0F1E35", border: "1px solid rgba(59,130,246,0.15)", color: "#fff" }} />
                                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                                        <Bar dataKey="Đã học" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="Chưa học" fill="#cbd5e1" stackId="a" radius={[4, 4, 0, 0]} className="dark:fill-[#1E293B]" />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  )}
                                </div>
                              )}
                            </div>
                          </InteractiveGlowCard>

                          {/* Section completion checklist */}
                          <InteractiveGlowCard interactive={true} accentColor="green" className="p-0 overflow-hidden">
                            <div className="p-4 flex flex-col h-[320px]">
                              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-emerald-500" />
                                Tiến độ theo chương học
                              </h4>
                              {!lessonProgress || !lessonProgress.by_section || lessonProgress.by_section.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                  <ListTodo className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                                  <p className="text-xs text-slate-500">Chưa có chương học nào được cấu hình.</p>
                                </div>
                              ) : (
                                <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-blue-900/50">
                                  {getSectionStats().map((s, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-[#0D192E]/60 rounded-xl p-3 border border-slate-250 dark:border-blue-955/20 shadow-sm">
                                      <div className="flex justify-between items-start gap-3 mb-1.5">
                                        <span className="font-semibold text-slate-850 dark:text-slate-200 text-xs truncate max-w-[70%]" title={s.section}>
                                          {s.section}
                                        </span>
                                        <span className="text-[10px] text-slate-650 dark:text-cyan-400 bg-slate-100 dark:bg-blue-950/50 px-2 py-0.5 rounded-full font-bold">
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
                          </InteractiveGlowCard>
                        </div>
                      </div>
                    )}

                    {analyticsTab === "mastery" && (
                      <div className="space-y-6" role="tabpanel">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Radar Chart */}
                          <InteractiveGlowCard interactive={true} accentColor="cyan" className="p-0 overflow-hidden">
                            <div className="p-4 flex flex-col h-[320px]">
                              <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                                Độ thông thạo chủ đề (Heatmap)
                              </h4>
                              {heatmapData.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                  <HelpCircle className="w-10 h-10 text-slate-350 dark:text-slate-750 mb-2" />
                                  <p className="text-xs text-slate-500">Chưa có đủ dữ liệu tương tác để phân tích độ thông thạo chủ đề.</p>
                                </div>
                              ) : (
                                <div className="flex-1 min-h-0 w-full relative">
                                  {mounted && (
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={heatmapData}>
                                        <PolarGrid stroke="#e2e8f0" className="dark:stroke-blue-950/30" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                                        <Radar
                                          name="Thông thạo"
                                          dataKey="Độ thông thạo (%)"
                                          stroke="#3b82f6"
                                          fill="#3b82f6"
                                          fillOpacity={0.3}
                                        />
                                        <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px", background: "#0F1E35", border: "1px solid rgba(59,130,246,0.15)", color: "#fff" }} />
                                      </RadarChart>
                                    </ResponsiveContainer>
                                  )}
                                </div>
                              )}
                            </div>
                          </InteractiveGlowCard>

                          {/* Quiz results */}
                          <InteractiveGlowCard interactive={true} accentColor="orange" className="p-0 overflow-hidden">
                            <div className="p-4 flex flex-col h-[320px] justify-between">
                              <div>
                                <h4 className="font-bold text-slate-855 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
                                  <Award className="w-4 h-4 text-amber-500" />
                                  Điểm thi & Quiz cao nhất đạt được
                                </h4>
                                {quizScores.length === 0 ? (
                                  <div className="text-center py-10">
                                    <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500">Chưa làm bài trắc nghiệm nào trong khóa học này.</p>
                                  </div>
                                ) : (
                                  <div className="max-h-[140px] overflow-auto pr-1 w-full relative scrollbar-thin">
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
                                          <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#64748b" }} width={90} />
                                          <Tooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: "11px", borderRadius: "12px", background: "#0F1E35", border: "1px solid rgba(59,130,246,0.15)", color: "#fff" }} />
                                          <Bar dataKey="Điểm (%)" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    )}
                                  </div>
                                )}
                              </div>

                              {quizScores.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-blue-500/10 mt-2">
                                  {quizScores.slice(0, 4).map(q => (
                                    <div key={q.quiz_id} className="bg-slate-50 dark:bg-[#0D192E]/60 rounded-xl p-2 border border-slate-200 dark:border-blue-955/20 shadow-xs flex items-center justify-between text-[10px]">
                                      <span className="font-semibold text-slate-700 dark:text-slate-350 truncate max-w-[80px]" title={q.quiz_title}>{q.quiz_title}</span>
                                      <Badge variant={q.is_passed ? "green" : q.best_percentage ? "red" : "gray"}>
                                        {q.best_percentage !== null ? `${Math.round(q.best_percentage)}%` : "Chưa làm"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </InteractiveGlowCard>
                        </div>

                        {/* Quick check and Spaced Rep quiz results */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {microInteractions && microInteractions.total_interactions > 0 && (
                            <InteractiveGlowCard interactive={true} accentColor="green" className="p-0 overflow-hidden">
                              <div className="p-4 flex flex-col">
                                <h4 className="font-bold text-slate-855 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
                                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                                  Concept check (Tương tác nhanh)
                                </h4>
                                <div className="grid grid-cols-3 gap-3 text-center text-xs flex-1">
                                  <div className="bg-slate-50 dark:bg-[#0D192E]/50 p-3 rounded-xl border border-slate-250 dark:border-blue-955/20 shadow-xs">
                                    <p className="text-slate-500 dark:text-slate-400">Số câu trả lời</p>
                                    <p className="text-base font-extrabold text-slate-850 dark:text-slate-100 mt-1">{microInteractions.total_interactions}</p>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-[#0D192E]/50 p-3 rounded-xl border border-slate-250 dark:border-blue-955/20 shadow-xs">
                                    <p className="text-slate-500 dark:text-slate-400">Đúng</p>
                                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{microInteractions.total_correct}</p>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-[#0D192E]/50 p-3 rounded-xl border border-slate-250 dark:border-blue-955/20 shadow-xs">
                                    <p className="text-slate-500 dark:text-slate-400">Độ chính xác</p>
                                    <p className="text-base font-extrabold text-blue-600 dark:text-cyan-400 mt-1">
                                      {Math.round((microInteractions.total_correct / microInteractions.total_interactions) * 100)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </InteractiveGlowCard>
                          )}

                          {spacedRepQuizzes && spacedRepQuizzes.total_tracked > 0 && (
                            <InteractiveGlowCard interactive={true} accentColor="purple" className="p-0 overflow-hidden">
                              <div className="p-4 flex flex-col">
                                <h4 className="font-bold text-slate-855 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                                  Luyện tập ngắt quãng (SM-2 Quiz)
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-[11px] flex-1">
                                  <div className="bg-slate-50 dark:bg-[#0D192E]/50 p-2.5 rounded-xl border border-slate-250 dark:border-blue-955/20 shadow-xs flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400">Đang theo dõi:</span>
                                    <span className="font-bold text-slate-850 dark:text-slate-200">{spacedRepQuizzes.total_tracked} câu</span>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-[#0D192E]/50 p-2.5 rounded-xl border border-slate-250 dark:border-blue-955/20 shadow-xs flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400">Nhớ tốt (Mastered):</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{spacedRepQuizzes.mastered} câu</span>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-[#0D192E]/50 p-2.5 rounded-xl border border-slate-250 dark:border-blue-955/20 shadow-xs flex justify-between items-center col-span-2">
                                    <span className="text-slate-500 dark:text-slate-400">Chất lượng TB:</span>
                                    <span className="font-bold text-violet-600 dark:text-violet-400">{spacedRepQuizzes.avg_quality.toFixed(1)}/5.0</span>
                                  </div>
                                </div>
                              </div>
                            </InteractiveGlowCard>
                          )}
                        </div>
                      </div>
                    )}

                    {analyticsTab === "flashcards" && (
                      <div className="space-y-6" role="tabpanel">
                        <InteractiveGlowCard interactive={true} accentColor="purple" className="p-0 overflow-hidden">
                          <div className="p-6">
                            <h4 className="font-bold text-slate-855 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
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
                                    <div className="p-3 bg-slate-50 dark:bg-[#0D192E] rounded-xl border border-slate-200 dark:border-blue-955/25 shadow-xs">
                                      <p className="text-slate-500 dark:text-slate-400">Cần ôn hôm nay</p>
                                      <p className={`text-lg font-extrabold mt-1 ${flashcardStats.due_today > 0 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                        {flashcardStats.due_today} thẻ
                                      </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-[#0D192E] rounded-xl border border-slate-200 dark:border-blue-955/25 shadow-xs">
                                      <p className="text-slate-500 dark:text-slate-400">Đã ôn hôm nay</p>
                                      <p className="text-lg font-extrabold text-blue-600 dark:text-cyan-400 mt-1">
                                        {flashcardStats.reviewed_today} thẻ
                                      </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-[#0D192E] rounded-xl border border-slate-200 dark:border-blue-955/25 shadow-xs">
                                      <p className="text-slate-500 dark:text-slate-400">Độ dễ TB (EF)</p>
                                      <p className="text-lg font-extrabold text-violet-600 dark:text-violet-400 mt-1">
                                        {flashcardStats.avg_easiness.toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-[#0D192E] rounded-xl border border-slate-200 dark:border-blue-955/25 shadow-xs">
                                      <p className="text-slate-500 dark:text-slate-400">Tổng số lượt ôn</p>
                                      <p className="text-lg font-extrabold text-slate-700 dark:text-slate-350 mt-1">
                                        {flashcardStats.total_reviews} lượt
                                      </p>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-slate-200 dark:border-blue-500/10 flex justify-between text-[10px] text-slate-500">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />Nhuần nhuyễn: {flashcardStats.total_mastered}</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />Đang học: {flashcardStats.total_learning}</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />Mới: {flashcardStats.total_new}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </InteractiveGlowCard>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center bg-slate-50 dark:bg-[#0F1E35] border border-dashed border-slate-250 dark:border-blue-500/20 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
                <Target className="w-12 h-12 text-slate-400 dark:text-slate-650 mb-3" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy phân tích</h3>
                <p className="text-sm text-slate-500 mt-1">Đăng ký và tham gia một khóa học để bắt đầu ghi nhận phân tích học tập.</p>
              </Card>
            )}

          </div>

          {/* ── Right Column: Sidebar (lg:col-span-1) ── */}
          <div className="lg:col-span-1 space-y-6 min-w-0">

            {/* ── Overall Stats ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Hành trình học tập của tôi
              </h3>

              {loadingEnrolled ? (
                <div className="space-y-4">
                  <div className="h-[180px] bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/10 animate-pulse" />
                </div>
              ) : (
                <div className="space-y-4">
                  <FocusCard
                    focusCourse={focusCourse}
                    totalCount={totalCount}
                    onNavigateToCourse={(courseId) => router.push(`/lms/student/courses/${courseId}`)}
                    onNavigateToDiscover={() => router.push("/lms/student/discover")}
                  />
                </div>
              )}
            </div>

            {/* ── Courses List ── */}
            <InteractiveGlowCard interactive={false} className="flex flex-col p-0 overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-slate-200/60 dark:border-blue-500/10 bg-slate-50/50 dark:bg-[#0A1628]/30">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  Học phần của tôi
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Chọn học phần bên dưới để xem phân tích chi tiết.
                </p>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                {loadingEnrolled ? (
                  <PageLoader message="Đang tải danh sách..." />
                ) : acceptedEnrollments.length === 0 ? (
                  <EmptyState
                    icon={<BookOpen className="w-10 h-10 text-slate-400" />}
                    title="Chưa đăng ký môn nào"
                    description="Hãy khám phá và đăng ký khóa học phù hợp với bạn để bắt đầu."
                    action={
                      <PrimaryBtn icon={<Search className="w-4 h-4" />} onClick={() => router.push("/lms/student/discover")}>
                        Khám phá khóa học
                      </PrimaryBtn>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {acceptedEnrollments.map(en => {
                      const isSelected = en.course_id === selectedCourseId;
                      return (
                        <ProgressCard
                          key={en.id}
                          courseId={en.course_id}
                          title={en.course_title ?? `Khóa học #${en.course_id}`}
                          teacherName={en.teacher_name}
                          progress={en.progress_percent || 0}
                          isSelected={isSelected}
                          onClick={() => setSelectedCourseId(en.course_id)}
                          onOpenDetails={() => router.push(`/lms/student/courses/${en.course_id}`)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </InteractiveGlowCard>

          </div>

        </div>
      </div>
    </div>
  );
}