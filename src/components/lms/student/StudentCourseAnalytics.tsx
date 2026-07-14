"use client";

import React from "react";
import {
  BookOpen,
  Award,
  Brain,
  Target,
  TrendingUp,
  HelpCircle,
  ListTodo,
  CheckSquare,
  Layers,
} from "lucide-react";
import {
  Card,
  ProgressBar,
  PageLoader,
  Badge,
  InteractiveGlowCard,
} from "@/components/lms/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { Enrollment } from "@/types";

interface StudentCourseAnalyticsProps {
  selectedCourseId: number | null;
  currentCourseTitle?: string;
  acceptedEnrollments: Enrollment[];
  setSelectedCourseId: (id: number) => void;
  loadingAnalytics: boolean;
  analyticsTab: "lessons" | "mastery" | "flashcards";
  setAnalyticsTab: (tab: "lessons" | "mastery" | "flashcards") => void;
  heatmapData: any[];
  flashcardStats: any;
  quizScores: any[];
  lessonProgress: any;
  microInteractions: any;
  spacedRepQuizzes: any;
  mounted: boolean;
}

export function StudentCourseAnalytics({
  selectedCourseId,
  currentCourseTitle,
  acceptedEnrollments,
  setSelectedCourseId,
  loadingAnalytics,
  analyticsTab,
  setAnalyticsTab,
  heatmapData,
  flashcardStats,
  quizScores,
  lessonProgress,
  microInteractions,
  spacedRepQuizzes,
  mounted,
}: StudentCourseAnalyticsProps) {
  // ── Render Helpers ──────────────────────────────────────────────────────────

  const getPieData = () => {
    if (!flashcardStats) return [];
    return [
      { name: "Đã nhuần nhuyễn", value: flashcardStats.total_mastered || 0 },
      { name: "Đang học", value: flashcardStats.total_learning || 0 },
      { name: "Thẻ mới chưa ôn", value: flashcardStats.total_new || 0 },
    ].filter((d) => d.value > 0);
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

  if (!selectedCourseId) {
    return (
      <Card className="p-8 text-center bg-slate-50 dark:bg-[#0F1E35] border border-dashed border-slate-250 dark:border-blue-500/20 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
        <Target className="w-12 h-12 text-slate-400 dark:text-slate-650 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy phân tích</h3>
        <p className="text-sm text-slate-500 mt-1">Đăng ký và tham gia một khóa học để bắt đầu ghi nhận phân tích học tập.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter / Selected Course Name */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 dark:border-blue-500/10 pb-4 gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 truncate" title={currentCourseTitle}>
            {currentCourseTitle || `Chi tiết Khóa học #${selectedCourseId}`}
          </h3>
        </div>

        <div className="lg:hidden w-full sm:w-auto">
          <Select
            value={selectedCourseId ? String(selectedCourseId) : ""}
            onValueChange={(val) => setSelectedCourseId(Number(val))}
          >
            <SelectTrigger className="w-full sm:w-[240px] h-10 border border-slate-250 dark:border-blue-500/20 rounded-xl text-sm bg-white dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all flex-shrink-0 font-semibold shadow-sm">
              <SelectValue placeholder="Chọn khóa học" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0D192E] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
              {acceptedEnrollments.map((e) => (
                <SelectItem key={e.course_id} value={String(e.course_id)} className="cursor-pointer">
                  {e.course_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap active:scale-95 ${
                analyticsTab === "lessons"
                  ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md"
                  : "text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-955/40 border border-transparent hover:border-slate-200 dark:hover:border-blue-500/10"
              }`}
            >
              <ListTodo className="w-4 h-4" />
              Tiến độ bài học
            </button>
            <button
              role="tab"
              aria-selected={analyticsTab === "mastery"}
              onClick={() => setAnalyticsTab("mastery")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap active:scale-95 ${
                analyticsTab === "mastery"
                  ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md"
                  : "text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-955/40 border border-transparent hover:border-slate-200 dark:hover:border-blue-500/10"
              }`}
            >
              <Target className="w-4 h-4" />
              Năng lực & Quiz
            </button>
            <button
              role="tab"
              aria-selected={analyticsTab === "flashcards"}
              onClick={() => setAnalyticsTab("flashcards")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap active:scale-95 ${
                analyticsTab === "flashcards"
                  ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md"
                  : "text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-955/40 border border-transparent hover:border-slate-200 dark:hover:border-blue-500/10"
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
                <InteractiveGlowCard interactive={false} accentColor="blue" className="p-0 overflow-hidden">
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
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-blue-955/30" />
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
                <InteractiveGlowCard interactive={false} accentColor="green" className="p-0 overflow-hidden">
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
                <InteractiveGlowCard interactive={false} accentColor="cyan" className="p-0 overflow-hidden">
                  <div className="p-4 flex flex-col h-[320px]">
                    <h4 className="font-bold text-slate-855 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                      Độ thông thạo chủ đề (Heatmap)
                    </h4>
                    {heatmapData.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <HelpCircle className="w-10 h-10 text-slate-350 dark:text-slate-755 mb-2" />
                        <p className="text-xs text-slate-500">Chưa có đủ dữ liệu tương tác để phân tích độ thông thạo chủ đề.</p>
                      </div>
                    ) : (
                      <div className="flex-1 min-h-0 w-full relative">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={heatmapData}>
                              <PolarGrid stroke="#e2e8f0" className="dark:stroke-blue-955/30" />
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
                <InteractiveGlowCard interactive={false} accentColor="orange" className="p-0 overflow-hidden">
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
                                data={quizScores.map((q) => ({
                                  name: q.quiz_title,
                                  "Điểm (%)": q.best_percentage || 0,
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
                        {quizScores.slice(0, 4).map((q) => (
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
                  <InteractiveGlowCard interactive={false} accentColor="green" className="p-0 overflow-hidden">
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
                  <InteractiveGlowCard interactive={false} accentColor="purple" className="p-0 overflow-hidden">
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
              <InteractiveGlowCard interactive={false} accentColor="purple" className="p-0 overflow-hidden">
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
                            <p className="text-lg font-extrabold text-slate-750 dark:text-slate-350 mt-1">
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
  );
}
