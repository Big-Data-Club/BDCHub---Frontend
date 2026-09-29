"use client";

import React, { memo } from "react";
import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { Lang, RoleTrack } from "../types";
import { T_DATA } from "../translations";
import { BDCHubOnboarding } from "./BDCHubOnboarding";

interface SuccessViewProps {
  lang: Lang;
  roleTrack: RoleTrack;
  onReset: () => void;
}

export const SuccessView = memo(function SuccessView({ lang, onReset }: SuccessViewProps) {
  const t = T_DATA[lang] || T_DATA.vi;

  const nextSteps = t.successNextSteps || [
    "Tổng hợp và công bố kỷ yếu, tư liệu học thuật từ các phiên trình bày của sự kiện.",
    "Đối chiếu phản hồi để nâng cao chất lượng các chuỗi sinh hoạt học thuật và workshop chuyên sâu.",
    "Mở các cơ hội kết nối đề tài nghiên cứu khoa học và thực tập tại các phòng thí nghiệm liên kết.",
  ];

  return (
    <div className="relative z-10 max-w-3xl mx-auto py-4 sm:py-8 text-center animate-fadeIn">
      <div className="bg-white dark:bg-[#0D192E] border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-xl shadow-emerald-500/5">
        {/* Animated Check Icon */}
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-emerald-200 dark:border-emerald-700/60 shadow-inner">
          <CheckCircle2 className="w-11 h-11" />
        </div>

        {/* Success Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === "vi" ? "Đã ghi nhận phản hồi thành công" : "Response recorded successfully"}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
          {t.successTitle || "Gửi khảo sát thành công!"}
        </h2>

        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-8 max-w-xl mx-auto font-medium">
          {t.successSubtitle || "Chân thành cảm ơn bạn đã dành thời gian đóng góp ý kiến quý báu cho Big Data Day 2026."}
        </p>

        {/* Next Steps Box */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 text-left mb-8 shadow-sm">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{t.successNextStepsTitle || "Các hoạt động tiếp nối từ Big Data Club:"}</span>
          </h4>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2.5 list-disc list-inside leading-relaxed">
            {nextSteps.map((step, idx) => (
              <li key={idx} className="pl-1">
                <span className="text-slate-700 dark:text-slate-200">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* BDCHub Onboarding section */}
        <BDCHubOnboarding lang={lang} />

        {/* Action Button: Start a new response */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-center">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold active:scale-95 transition-colors duration-75 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.successNewResponseBtn || "Điền một biểu mẫu mới"}</span>
          </button>
        </div>
      </div>
    </div>
  );
});
