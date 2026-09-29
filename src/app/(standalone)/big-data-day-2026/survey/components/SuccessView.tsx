"use client";

import React from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Lang, RoleTrack } from "../types";
import { T_DATA } from "../translations";
import { BDCHubOnboarding } from "./BDCHubOnboarding";

interface SuccessViewProps {
  lang: Lang;
  roleTrack: RoleTrack;
  onReset: () => void;
}

export function SuccessView({ lang, onReset }: SuccessViewProps) {
  const t = T_DATA[lang];

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 text-center">
      <div className="bg-white/95 dark:bg-[#0F1E35]/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 border border-emerald-200 dark:border-emerald-800/50 animate-bounce">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
          {t.successTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {t.successSubtitle}
        </p>

        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-5 text-left mb-6">
          <h4 className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-200 mb-2">
            {t.successNextStepsTitle}
          </h4>
          <ul className="text-xs sm:text-sm text-blue-900/80 dark:text-blue-300 space-y-2 list-disc list-inside leading-relaxed">
            {t.successNextSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>

        {/* BDCHub Onboarding section */}
        <BDCHubOnboarding lang={lang} />

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold active:scale-95 transition-all duration-150"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.successNewResponseBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
