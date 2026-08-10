"use client";

import React from "react";
import { CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { T, Lang } from "../types";

interface AlreadySubmittedScreenProps {
  savedName: string;
  lang: Lang;
  onReset: () => void;
}

export const AlreadySubmittedScreen: React.FC<AlreadySubmittedScreenProps> = ({ savedName, lang, onReset }) => {
  const t = T[lang];

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
      <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
        <CheckCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-100">{t.alreadySubmittedTitle}</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{t.alreadySubmittedDesc}</p>
        {savedName && (
          <p className="text-sm font-semibold text-blue-300 pt-1">
            Ứng viên: {savedName}
          </p>
        )}
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Điền lại đơn mới</span>
        </button>

        <a
          href="/"
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
        >
          <span>Về trang chủ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
