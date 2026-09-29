"use client";

import React from "react";
import Link from "next/link";
import { Lang } from "../types";
import { T_DATA } from "../translations";
import {
  Sparkles,
  Presentation,
  FileText,
  ExternalLink,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

interface BDCHubOnboardingProps {
  lang: Lang;
}

export function BDCHubOnboarding({ lang }: BDCHubOnboardingProps) {
  const t = T_DATA[lang];

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>BDCHub Ecosystem</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight leading-snug mb-2">
            {t.bdcHubTitle}
          </h3>
          <p className="text-xs sm:text-sm text-blue-50 leading-relaxed max-w-xl">
            {t.bdcHubDesc}
          </p>
        </div>
      </div>

      {/* Two Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Card 1: Slide giới thiệu BDCHub */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm group">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Presentation className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <span>{t.bdcHubSlideTitle}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {t.bdcHubSlideDesc}
            </p>
          </div>
          <a
            href={t.bdcHubSlideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 transition-all duration-150"
          >
            <span>{t.bdcHubSlideBtn}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Card 2: Hướng dẫn đăng ký User BDCHub */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm group">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <span>{t.bdcHubGuideTitle}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {t.bdcHubGuideDesc}
            </p>
          </div>
          <a
            href={t.bdcHubGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-cyan-600 hover:text-white dark:bg-slate-800 dark:hover:bg-cyan-600 text-slate-700 dark:text-slate-200 transition-all duration-150"
          >
            <span>{t.bdcHubGuideBtn}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Direct Call to Action */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            {lang === "vi"
              ? "Bắt đầu hành trình học tập cùng hệ thống bài giảng và lab tương tác ngay hôm nay."
              : "Kickstart your learning path with interactive labs and learning materials today."}
          </p>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex-shrink-0 w-full sm:w-auto"
        >
          <span>{t.bdcHubRegisterBtn}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
