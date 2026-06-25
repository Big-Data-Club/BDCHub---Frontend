import React from "react";

interface SuccessProps {
  name: string;
  studentId: string;
  score: number;
  onViewDetails: () => void;
  onRestart: () => void;
}

export function Success({ name, studentId, score, onViewDetails, onRestart }: SuccessProps) {
  return (
    <div className="text-center py-10 px-4 max-w-xl mx-auto space-y-6">
      {/* Animated Success Check */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-500/10 rounded-full animate-ping opacity-25" />
        <div className="relative w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <svg className="w-10 h-10 text-emerald-650 dark:text-emerald-450 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full border border-emerald-100 dark:border-emerald-900/60 uppercase tracking-widest">
          Gửi thành công
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
          Cảm ơn bạn, {name}!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          Đơn tự đánh giá điểm rèn luyện của sinh viên <strong className="text-slate-800 dark:text-slate-200">{name} ({studentId})</strong> đã được ghi nhận thành công trên Google Sheets của ban cán sự lớp.
        </p>
      </div>

      {/* Score Summary Box */}
      <div className="bg-gradient-to-br from-slate-50 to-emerald-50/10 dark:from-slate-900/40 dark:to-emerald-950/5 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tổng điểm tự đánh giá</p>
        <div className="flex items-baseline justify-center gap-1 mt-1">
          <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {score}
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-base font-bold">/100</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          onClick={onViewDetails}
          className="w-full sm:w-auto group relative flex items-center justify-center px-6 py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm border border-slate-200/50 dark:border-slate-800/50"
        >
          <svg className="w-4 h-4 mr-2 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-350 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Xem lại bản đánh giá
        </button>

        <button
          onClick={onRestart}
          className="w-full sm:w-auto group relative flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-cyan-900/10 dark:shadow-cyan-950/20"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
          </svg>
          Nộp mẫu mới
        </button>
      </div>
    </div>
  );
}
