"use client";

import React from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4 py-16 transition-colors duration-300">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-2xl dark:backdrop-blur-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/40 text-blue-500 dark:text-blue-400 flex items-center justify-center">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.alreadySubmittedTitle}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.alreadySubmittedDesc}</p>
          {savedName && (
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-300 pt-1">
              Ứng viên: {savedName}
            </p>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Điền lại đơn mới</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
          >
            <span>Về trang chủ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
