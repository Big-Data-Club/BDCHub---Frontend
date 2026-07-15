"use client";

import React, { useState, useMemo } from "react";
import { Target, HelpCircle, Award, CheckSquare, TrendingUp } from "lucide-react";
import { Badge } from "@/components/lms/shared";
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
} from "recharts";

interface MasteryTabProps {
  heatmapData: any[];
  quizScores: any[];
  microInteractions: any;
  spacedRepQuizzes: any;
  mounted: boolean;
}

export function MasteryTab({
  heatmapData,
  quizScores,
  microInteractions,
  spacedRepQuizzes,
  mounted,
}: MasteryTabProps) {
  const showStatsRow = (microInteractions && microInteractions.total_interactions > 0) || (spacedRepQuizzes && spacedRepQuizzes.total_tracked > 0);

  // Filter state for Radar Chart: "weakest" (lowest 8), "strongest" (highest 8), "all" (no limit)
  const [radarFilter, setRadarFilter] = useState<"weakest" | "strongest" | "all">("weakest");

  // Filter and sort the radar data
  const radarData = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return [];
    const cloned = [...heatmapData];
    if (radarFilter === "weakest") {
      return cloned.sort((a, b) => a["Độ thông thạo (%)"] - b["Độ thông thạo (%)"]).slice(0, 8);
    } else if (radarFilter === "strongest") {
      return cloned.sort((a, b) => b["Độ thông thạo (%)"] - a["Độ thông thạo (%)"]).slice(0, 8);
    }
    return cloned;
  }, [heatmapData, radarFilter]);

  // Trim long labels dynamically to prevent overlapping
  const formatAngleLabel = (value: string) => {
    const limit = radarFilter === "all" ? 10 : 15;
    if (value && value.length > limit) {
      return `${value.substring(0, limit)}...`;
    }
    return value;
  };

  return (
    <div className="space-y-6" role="tabpanel">
      {/* Hàng 1: Radar Chart & All Topics List (Split Panel Layout) */}
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/12 rounded-2xl p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-blue-500/25 transition-all duration-300">
        <div className="flex flex-col h-[320px] justify-between">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-50 dark:bg-cyan-955/40 rounded-xl">
                <Target className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h4 className="font-bold text-slate-855 dark:text-slate-200 text-sm">
                  Độ thông thạo chủ đề (Heatmap)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Đánh giá độ hiểu biết theo từng chuyên đề</p>
              </div>
            </div>

            {/* Filter Toggle */}
            {heatmapData.length > 0 && (
              <div className="inline-flex p-0.5 bg-slate-100 dark:bg-[#0D192E] border border-slate-200 dark:border-blue-500/10 rounded-lg gap-0.5 self-start sm:self-auto shadow-xs">
                {(["weakest", "strongest", "all"] as const).map((type) => {
                  const labelMap = { weakest: "Yếu nhất", strongest: "Mạnh nhất", all: "Tất cả" };
                  return (
                    <button
                      key={type}
                      onClick={() => setRadarFilter(type)}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all whitespace-nowrap active:scale-95 ${
                        radarFilter === type
                          ? "bg-white text-cyan-600 shadow-xs dark:bg-cyan-500 dark:text-slate-955"
                          : "text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-205"
                      }`}
                    >
                      {labelMap[type]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-6 items-stretch min-h-0">
            {/* Left Column: Radar Chart */}
            <div className="flex-1 min-h-0 relative">
              {heatmapData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <HelpCircle className="w-10 h-10 text-slate-355 dark:text-slate-755 mb-2" />
                  <p className="text-xs text-slate-500">Chưa có đủ dữ liệu tương tác để phân tích độ thông thạo chủ đề.</p>
                </div>
              ) : (
                mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#cbd5e1" className="dark:stroke-blue-500/25" strokeOpacity={0.5} />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: "#64748b" }} tickFormatter={formatAngleLabel} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                      <Radar
                        name="Thông thạo"
                        dataKey="Độ thông thạo (%)"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.15}
                      />
                      <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "16px", background: "rgba(15, 30, 53, 0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(59,130,246,0.2)", color: "#fff" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                )
              )}
            </div>

            {/* Right Column: Borderless Topics List */}
            {heatmapData.length > 0 && (
              <div className="w-full md:w-[320px] flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-200/60 dark:border-blue-500/10 pt-3 md:pt-0 md:pl-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 block uppercase tracking-wider">
                  Chi tiết tất cả chủ đề ({heatmapData.length})
                </span>
                <div className="space-y-1.5 overflow-y-auto max-h-[210px] pr-1 scrollbar-thin">
                  {heatmapData.map((h, idx) => (
                    <div key={idx} className="group flex items-center justify-between text-[11px] py-1.5 px-2 border-b border-slate-200/40 dark:border-blue-500/5 transition-colors hover:bg-slate-100/30 dark:hover:bg-[#12223a]/25 rounded-lg">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px] group-hover:text-cyan-600 dark:group-hover:text-cyan-405 transition-colors" title={h.subject}>
                        {h.subject}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${h["Độ thông thạo (%)"]}%` }}
                          />
                        </div>
                        <span className="font-bold text-[10px] text-slate-500 dark:text-cyan-400 w-8 text-right">
                          {h["Độ thông thạo (%)"]}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hàng 2: Concept check & SM-2 Quiz (Split Metrics Row) */}
      {showStatsRow && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/12 rounded-2xl p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-blue-500/25 transition-all duration-300">
          {microInteractions && microInteractions.total_interactions > 0 && (
            <div className="flex flex-col justify-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-955/40 rounded-xl">
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Concept check (Tương tác nhanh)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Đánh giá nhanh cuối bài</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center mt-2">
                <div className="py-2 px-1">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Số câu</p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{microInteractions.total_interactions}</p>
                </div>
                <div className="py-2 px-1 border-x border-slate-200/50 dark:border-blue-500/10">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Đúng</p>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{microInteractions.total_correct}</p>
                </div>
                <div className="py-2 px-1">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tỷ lệ</p>
                  <p className="text-base font-extrabold text-blue-600 dark:text-cyan-400 mt-0.5">
                    {Math.round((microInteractions.total_correct / microInteractions.total_interactions) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {spacedRepQuizzes && spacedRepQuizzes.total_tracked > 0 && (
            <div className="flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-200/60 dark:border-blue-500/10 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-50 dark:bg-violet-955/40 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-violet-650 dark:text-violet-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Luyện tập ngắt quãng (SM-2 Quiz)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Học tập thông minh</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center mt-2">
                <div className="py-2 px-1">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Theo dõi</p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-205 mt-0.5">{spacedRepQuizzes.total_tracked}</p>
                </div>
                <div className="py-2 px-1 border-x border-slate-200/50 dark:border-blue-500/10">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Nhớ tốt</p>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{spacedRepQuizzes.mastered}</p>
                </div>
                <div className="py-2 px-1">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Điểm TB</p>
                  <p className="text-base font-extrabold text-violet-655 dark:text-violet-400 mt-0.5">{spacedRepQuizzes.avg_quality.toFixed(1)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hàng 3: Quiz results (Split Panel) */}
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/12 rounded-2xl p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-blue-500/25 transition-all duration-300">
        <div className="flex flex-col h-[320px] justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-955/40 rounded-xl">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-855 dark:text-slate-200 text-sm">
                Điểm thi & Quiz cao nhất đạt được
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kết quả tốt nhất của bạn qua các bài kiểm tra</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-6 items-stretch min-h-0">
            {/* Chart Area */}
            <div className="flex-1 min-h-0">
              {quizScores.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs text-slate-500">Chưa làm bài trắc nghiệm nào trong khóa học này.</p>
                </div>
              ) : (
                <div className="h-full overflow-auto pr-1 w-full relative scrollbar-thin">
                  {mounted && (
                    <ResponsiveContainer width="100%" height={Math.max(160, quizScores.length * 40)}>
                      <BarChart
                        layout="vertical"
                        data={quizScores.map((q) => ({
                          name: q.quiz_title,
                          "Điểm (%)": q.best_percentage || 0,
                        }))}
                        margin={{ left: 10, right: 10, top: 0, bottom: 0 }}
                      >
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#64748b" }} width={120} />
                        <Tooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: "11px", borderRadius: "16px", background: "rgba(15, 30, 53, 0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(59,130,246,0.2)", color: "#fff" }} />
                        <Bar dataKey="Điểm (%)" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>

            {/* List Detail Area */}
            {quizScores.length > 0 && (
              <div className="w-full md:w-[280px] flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-200/60 dark:border-blue-500/10 pt-3 md:pt-0 md:pl-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 block uppercase">Chi tiết điểm trắc nghiệm</span>
                <div className="space-y-1.5 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
                  {quizScores.slice(0, 4).map((q) => (
                    <div key={q.quiz_id} className="group flex items-center justify-between text-[11px] py-1.5 px-2 border-b border-slate-200/40 dark:border-blue-500/5 transition-colors hover:bg-slate-100/30 dark:hover:bg-[#12223a]/25 rounded-lg">
                      <span className="font-semibold text-slate-700 dark:text-slate-350 truncate max-w-[140px] group-hover:text-amber-600 dark:group-hover:text-cyan-405 transition-colors" title={q.quiz_title}>{q.quiz_title}</span>
                      <span className={`font-bold text-xs ${
                        q.best_percentage === null 
                          ? "text-slate-400 dark:text-slate-550" 
                          : q.is_passed 
                            ? "text-emerald-605 dark:text-emerald-400" 
                            : "text-red-500 dark:text-red-450"
                      }`}>
                        {q.best_percentage !== null ? `${Math.round(q.best_percentage)}%` : "Chưa làm"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
