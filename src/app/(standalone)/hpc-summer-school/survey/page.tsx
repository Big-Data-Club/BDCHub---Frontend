"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import SurveyForm from "@/components/form/SurveyForm";
import hpcLogo from "@/assets/hpc-school-logo.png";
import { ORGANIZERS } from "../types";
import formData from "@/data/forms/HPCSummerSchool2026Survey.json";

type Lang = "en" | "vi";

const T = {
  vi: {
    title: "HPC School Survey",
    tagline: "HPCC × CSE × Big Data Club - HCMUT",
    langToggle: "English",
    contact: (
      <span>
        Mọi thắc mắc vui lòng liên hệ{" "}
        <a href="mailto:bdc@hcmut.edu.vn" className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold">bdc@hcmut.edu.vn</a>
        {" "}hoặc qua Fanpage{" "}
        <a href="https://www.facebook.com/BDCofHCMUT" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold">Big Data Club</a>.
      </span>
    )
  },
  en: {
    title: "HPC School Survey",
    tagline: "HPCC × CSE × Big Data Club - HCMUT",
    langToggle: "Tiếng Việt",
    contact: (
      <span>
        For any inquiries, please contact{" "}
        <a href="mailto:bdc@hcmut.edu.vn" className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold">bdc@hcmut.edu.vn</a>
        {" "}or via{" "}
        <a href="https://www.facebook.com/BDCofHCMUT" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold">Big Data Club Fanpage</a>.
      </span>
    )
  }
};

export default function HPCSchoolSurveyPage() {
  const [lang, setLang] = useState<Lang>("vi");
  const [scrolled, setScrolled] = useState(false);
  const t = T[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full overflow-x-hidden pb-10 pt-20 sm:pt-24 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ── Fixed Sticky Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/50 shadow-sm py-3"
            : "bg-transparent py-3.5 sm:py-4.5"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="https://hpcc.hcmut.edu.vn/hpc-school"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-[90px] h-12 flex-shrink-0 transform hover:scale-[1.05] hover:rotate-1 transition-all duration-300 bg-white/60 dark:bg-white/60 backdrop-blur-md p-1.5 rounded-xl border border-slate-100 dark:border-white/20 shadow-sm block"
            >
              <div className="relative w-full h-full">
                <Image src={hpcLogo} alt="HCMUT HPC School" fill className="object-contain dark:brightness-110 dark:contrast-110" />
              </div>
            </a>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-tight truncate tracking-tight">
                HPC School <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-400">2026</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-semibold tracking-wide">{t.tagline}</p>
            </div>
          </div>

          {/* Right: org logos + theme + lang */}
          <div className="flex items-center gap-3.5 flex-shrink-0">
            {/* Org logos - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-3 bg-white/60 dark:bg-white/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-100 dark:border-white/20 shadow-sm">
              {ORGANIZERS.map(o => (
                <div key={o.alt} className={`relative flex-shrink-0 ${o.cls}`}>
                  <Image
                    src={o.src}
                    alt={o.alt}
                    fill
                    className="object-contain opacity-85 dark:brightness-110 dark:contrast-125"
                  />
                </div>
              ))}
            </div>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/60 hidden sm:block" />
            {/* Theme + Lang controls */}
            <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-100 dark:border-slate-800/50 rounded-full p-1 h-12 shadow-sm shadow-slate-100/50 dark:shadow-none">
              <ThemeToggle size={15} className="!rounded-full !p-2.5 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200" />
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/60" />
              <button
                onClick={() => setLang(l => l === "en" ? "vi" : "en")}
                className="relative overflow-hidden flex items-center justify-center w-14 h-8 rounded-full text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 active:scale-95"
                title={t.langToggle}
              >
                <span key={lang} className="flex items-center justify-center gap-1 animate-lang-slide">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                  </svg>
                  {lang === "en" ? "VI" : "EN"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 sm:py-3.5">
        <div className="relative z-20 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/50 rounded-3xl p-2 sm:p-6 shadow-xl shadow-slate-100/80 dark:shadow-none transition-all duration-300">
          <SurveyForm formData={formData} />
        </div>

        {/* Contact info / inquiries */}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/30 rounded-2xl py-3 px-4 max-w-md mx-auto shadow-sm">
          {t.contact}
        </div>

        {/* ── Footer ── */}
        <footer className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400/80 dark:text-slate-500/80">
          <div className="flex items-center gap-3.5">
            {ORGANIZERS.map(o => (
              <div key={o.alt} className={`relative flex-shrink-0 ${o.cls} transform hover:scale-110 transition-transform`}>
                <Image src={o.src} alt={o.alt} fill className="object-contain opacity-40 hover:opacity-75 transition-opacity" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a href="https://hpcc.hcmut.edu.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">hpcc.hcmut.edu.vn</a>
            <span>·</span>
            <a href="https://bdc.hpcc.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">bdc.hpcc.vn</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
