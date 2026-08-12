"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Mail, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { T, Lang } from "../types";

interface SuccessScreenProps {
  fullName: string;
  email: string;
  lang: Lang;
  confirmationEmailQueued: boolean;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ fullName, email, lang, confirmationEmailQueued }) => {
  const t = T[lang];

  return (
    <div className="relative z-10 min-h-screen bg-slate-50 dark:bg-[#050B18] flex items-center justify-center px-4 py-16 transition-colors duration-300">
      <div className="max-w-xl w-full p-8 sm:p-10 bg-white dark:bg-[#0F1E35] border border-slate-200/90 dark:border-blue-500/15 rounded-3xl shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-400">
        {/* Animated Success Badge */}
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] dark:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{t.successTitle}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t.successSubtitle}</p>
        </div>

        {/* Greeting card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60 pb-2">
            <span>Ứng viên: <strong className="text-slate-800 dark:text-slate-100">{fullName}</strong></span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Đã xác thực
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.successMsg}</p>
          {confirmationEmailQueued && (
            <div className="flex items-center space-x-2 text-xs text-blue-500 dark:text-blue-400 pt-1 font-mono">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.successEmailNote} {email}</span>
            </div>
          )}
        </div>

        {/* Next Steps List */}
        <div className="text-left bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-5 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t.successNextStepsTitle}
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {t.successNextSteps.map((step, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
          >
            <span>{t.btnReturnHome}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
