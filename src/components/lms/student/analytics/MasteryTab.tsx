"use client";

import { Award, CheckSquare, TrendingUp } from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface MasteryTabProps {
  quizScores: any[];
  microInteractions: any;
  spacedRepQuizzes: any;
  mounted: boolean;
}

export function MasteryTab({
  quizScores,
  microInteractions,
  spacedRepQuizzes,
  mounted,
}: MasteryTabProps) {
  const showStatsRow = (microInteractions && microInteractions.total_interactions > 0) || (spacedRepQuizzes && spacedRepQuizzes.total_tracked > 0);

  return (
    <div className="space-y-6" role="tabpanel">
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Số câu</p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{microInteractions.total_interactions}</p>
                </div>
                <div className="py-2 px-1 border-x border-slate-200/50 dark:border-blue-500/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đúng</p>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{microInteractions.total_correct}</p>
                </div>
                <div className="py-2 px-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tỷ lệ</p>
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Theo dõi</p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-205 mt-0.5">{spacedRepQuizzes.total_tracked}</p>
                </div>
                <div className="py-2 px-1 border-x border-slate-200/50 dark:border-blue-500/10">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nhớ tốt</p>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{spacedRepQuizzes.mastered}</p>
                </div>
                <div className="py-2 px-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Điểm TB</p>
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
                        <Tooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: "12px", borderRadius: "16px", background: "rgba(15, 30, 53, 0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(59,130,246,0.2)", color: "#fff" }} />
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
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 block uppercase">Chi tiết điểm trắc nghiệm</span>
                <div className="space-y-1.5 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
                  {quizScores.slice(0, 4).map((q) => (
                    <div key={q.quiz_id} className="group flex items-center justify-between text-xs py-1.5 px-2 border-b border-slate-200/40 dark:border-blue-500/5 transition-colors hover:bg-slate-100/30 dark:hover:bg-[#12223a]/25 rounded-lg">
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
