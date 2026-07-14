"use client";

import React, { useMemo } from "react";
import { Brain, TrendingUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface FlashcardTabProps {
  flashcardStats: any;
  mounted: boolean;
}

export function FlashcardTab({ flashcardStats, mounted }: FlashcardTabProps) {
  const pieData = useMemo(() => {
    if (!flashcardStats) return [];
    return [
      { name: "Đã nhuần nhuyễn", value: flashcardStats.total_mastered || 0 },
      { name: "Đang học", value: flashcardStats.total_learning || 0 },
      { name: "Thẻ mới chưa ôn", value: flashcardStats.total_new || 0 },
    ].filter((d) => d.value > 0);
  }, [flashcardStats]);

  const hasNoCards = !flashcardStats || flashcardStats.total_active === 0;

  return (
    <div className="space-y-6" role="tabpanel">
      {hasNoCards ? (
        <div className="p-8 text-center border border-dashed border-slate-250 dark:border-blue-500/20 rounded-2xl flex flex-col items-center justify-center min-h-[250px] bg-slate-50/40 dark:bg-[#0D192E]/30">
          <Brain className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Chưa có flashcard nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Mở bài học và tạo flashcard để bắt đầu ôn tập thông minh.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/12 rounded-2xl p-6 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-blue-500/25 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Cột 1: Tỷ lệ ghi nhớ (Pie Chart) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-[280px]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-50 dark:bg-violet-955/40 rounded-xl">
                  <Brain className="w-4 h-4 text-violet-650 dark:text-violet-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-855 dark:text-slate-200 text-sm">
                    Tỷ lệ ghi nhớ thẻ
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phân bố thẻ Flashcard theo mức độ nhớ</p>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center relative min-h-0">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={45}
                        outerRadius={62}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => {
                          const colorMap: Record<string, string> = {
                            "Đã nhuần nhuyễn": "#10b981",
                            "Đang học": "#3b82f6",
                            "Thẻ mới chưa ôn": "#64748b",
                          };
                          return <Cell key={`cell-${index}`} fill={colorMap[entry.name] || "#3b82f6"} />;
                        })}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} thẻ`} contentStyle={{ fontSize: "11px", borderRadius: "12px", background: "rgba(15, 30, 53, 0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(59,130,246,0.2)", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{flashcardStats.total_active}</span>
                  <span className="text-[9px] text-slate-550 dark:text-slate-400 uppercase font-semibold">TỔNG THẺ</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-blue-500/10 flex justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" />Nhuần nhuyễn: {flashcardStats.total_mastered ?? 0}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" />Đang học: {flashcardStats.total_learning ?? 0}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#64748b]" />Mới: {flashcardStats.total_new ?? 0}</span>
              </div>
            </div>

            {/* Cột 2: Stats Grid */}
            <div className="lg:col-span-7 lg:border-l lg:border-slate-200/60 lg:dark:border-blue-500/10 lg:pl-8 flex flex-col justify-between h-[280px]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-50 dark:bg-violet-955/40 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-violet-650 dark:text-violet-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-855 dark:text-slate-200 text-sm">
                    Chỉ số ôn tập
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hiệu năng học và ghi nhớ định kỳ</p>
                </div>
              </div>

              {/* Minimal Left Accent Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 flex-grow my-auto items-center mt-4">
                {/* 1. Cần ôn hôm nay */}
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-red-500/70 dark:border-red-550/70">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest">Cần ôn hôm nay</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {flashcardStats.total_due ?? 0} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">thẻ</span>
                  </span>
                </div>

                {/* 2. Đã ôn hôm nay */}
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-emerald-500/70 dark:border-emerald-550/70">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest">Đã ôn hôm nay</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {flashcardStats.reviews_today ?? 0} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">thẻ</span>
                  </span>
                </div>

                {/* 3. Độ dễ trung bình */}
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-violet-500/70 dark:border-violet-550/70">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-widest">Độ dễ TB (EF)</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {(flashcardStats.avg_easiness ?? 2.5).toFixed(2)}
                  </span>
                </div>

                {/* 4. Tổng lượt ôn */}
                <div className="flex flex-col gap-1 pl-4 border-l-2 border-blue-500/70 dark:border-blue-550/70">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest">Tổng lượt ôn</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {flashcardStats.total_reviews ?? 0} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">lượt</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
