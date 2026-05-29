import React from "react";
import { Translation } from "../types";

interface Step1Props {
  t: Translation;
  agreed: boolean;
  onToggle: () => void;
  error?: string;
}

export function Step1({ t, agreed, onToggle, error }: Step1Props) {
  return (
    <div className="space-y-4 sm:space-y-4.5">
      <div className="text-center space-y-1 sm:space-y-1.5">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 mb-0.5">
          <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">{t.privacyTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs max-w-xl mx-auto leading-relaxed">{t.privacyDesc}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5">
        {t.privacyCommitments.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/40 rounded-xl p-3 hover:border-cyan-300 dark:hover:border-cyan-700/50 transition-colors">
            <div className="mt-0.5 flex-shrink-0 w-4.5 h-4.5 rounded-lg bg-cyan-100 dark:bg-cyan-500/15 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{item}</p>
          </div>
        ))}
      </div>

      <div className="border border-cyan-200/60 dark:border-cyan-800/40 bg-cyan-50/30 dark:bg-cyan-900/5 rounded-xl p-3">
        <h3 className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 mb-2 uppercase tracking-wider">{t.privacyCollectedTitle}</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {t.privacyCollected.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="w-1 h-1 rounded-full bg-cyan-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div
        onClick={onToggle}
        className={`flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all duration-200 select-none border
          ${agreed
            ? "border-cyan-400 dark:border-cyan-600 bg-cyan-50/60 dark:bg-cyan-900/10"
            : "border-slate-300/80 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 hover:border-cyan-300 dark:hover:border-cyan-700"}
          ${error ? "border-red-400 dark:border-red-600 bg-red-50/60 dark:bg-red-950/10" : ""}`}
      >
        <div className={`mt-0.5 flex-shrink-0 w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${agreed ? "bg-cyan-500 dark:bg-cyan-500 border-cyan-500" : "border-slate-400 dark:border-slate-600"}`}>
          {agreed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{t.privacyCheckLabel}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t.privacyCheckDesc}</p>
          {error && <p className="mt-1 text-[10px] sm:text-xs text-red-500 dark:text-red-400">⚠ {error}</p>}
        </div>
      </div>
    </div>
  );
}
