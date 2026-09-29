"use client";

import React from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Lang } from "../types";
import { T_DATA } from "../translations";
import { RotateCcw, Sparkles } from "lucide-react";

import bdcLogo from "@/assets/bdclogo.png";
import hcmutLogo from "@/assets/hcmut.png";
import hpccLogo from "@/assets/hpcc-logo.png";
import cseLogo from "@/assets/CSE_logo.png";

interface HeaderProps {
  lang: Lang;
  onToggleLang: () => void;
  scrolled: boolean;
  onReset: () => void;
  draftRestored: boolean;
  onClearDraft: () => void;
}

export function SurveyHeader({
  lang,
  onToggleLang,
  scrolled,
  onReset,
  draftRestored,
  onClearDraft,
}: HeaderProps) {
  const t = T_DATA[lang];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-200 ${
          scrolled
            ? "bg-white dark:bg-[#071325] border-b border-slate-200 dark:border-slate-800 shadow-md shadow-slate-900/10 dark:shadow-black/40 py-2.5 sm:py-3"
            : "bg-white/95 dark:bg-[#071325]/95 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 shadow-sm py-3 sm:py-4"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Brand & Logos */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center">
              <Image
                src={bdcLogo}
                alt="Big Data Club"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                  Big Data Day <span className="text-blue-600 dark:text-cyan-400">2026</span>
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-cyan-300">
                  From Data to Decisions
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Right: Partner Logos & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Logos on larger screens */}
            <div className="hidden lg:flex items-center gap-2.5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/70 dark:border-slate-800/60">
              <div className="relative w-6 h-6">
                <Image src={hcmutLogo} alt="HCMUT" fill className="object-contain" />
              </div>
              <div className="relative w-6 h-6">
                <Image src={hpccLogo} alt="HPCC" fill className="object-contain" />
              </div>
              <div className="relative w-6 h-6">
                <Image src={cseLogo} alt="CSE" fill className="object-contain" />
              </div>
            </div>

            {/* Quick Reset Form */}
            <button
              onClick={onReset}
              title={t.resetForm}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetForm}</span>
            </button>

            {/* Theme & Lang Container */}
            <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/60 rounded-full p-1 shadow-sm">
              <ThemeToggle
                size={16}
                className="!rounded-full !p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              />
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/60" />
              <button
                onClick={onToggleLang}
                className="flex items-center justify-center w-12 h-7 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-cyan-400 transition-all active:scale-95"
                title={lang === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
              >
                {lang === "vi" ? "EN" : "VI"}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
