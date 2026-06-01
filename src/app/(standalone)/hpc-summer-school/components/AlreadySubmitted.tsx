import React from "react";
import { Lang, ALREADY_MSG } from "../types";

interface AlreadySubmittedProps {
  lang: Lang;
  name: string;
  onClear: () => void;
}

export function AlreadySubmitted({ lang, name, onClear }: AlreadySubmittedProps) {
  const m = ALREADY_MSG[lang];
  return (
    <div className="py-14 text-center space-y-7">
      <div className="relative inline-flex">
        <div className="w-24 h-24 rounded-full border-2 border-amber-400 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
          <svg className="w-12 h-12 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full bg-amber-400/15 dark:bg-amber-400/10 animate-ping" />
      </div>
      <div className="space-y-2">
        <p className="text-amber-600 dark:text-amber-400 uppercase tracking-[0.25em] text-xs font-bold">{m.tag}</p>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-snug">
          {m.title1}<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{name || "Applicant"}</span>
          {" "}{m.title2}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">{m.desc}</p>
      </div>
      <div className="border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 space-y-2.5 max-w-xs mx-auto">
        <p className="text-slate-400 dark:text-slate-500 text-xs">{m.contact}</p>
        <div className="flex flex-col gap-1.5 items-center">
          <a href="mailto:bdc@hcmut.edu.vn" className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
            bdc@hcmut.edu.vn
          </a>
          <a href="https://www.facebook.com/BDCofHCMUT" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
            Facebook Big Data Club
          </a>
        </div>
      </div>
      <button
        onClick={onClear}
        className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 underline underline-offset-2 transition-colors"
      >
        {m.clearBtn}
      </button>
    </div>
  );
}
