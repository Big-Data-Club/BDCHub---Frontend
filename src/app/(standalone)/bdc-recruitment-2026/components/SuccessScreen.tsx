"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, ArrowRight, RotateCcw, Copy, Check, ExternalLink } from "lucide-react";
import { T, Lang } from "../types";
import { Button } from "@/components/ui/button";

interface SuccessScreenProps {
  fullName: string;
  email: string;
  lang: Lang;
  confirmationEmailQueued: boolean;
  onReset?: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  fullName,
  email,
  lang,
  confirmationEmailQueued,
  onReset,
}) => {
  const t = T[lang];
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date().toLocaleTimeString(lang === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B18] flex items-center justify-center px-4 py-16 transition-colors duration-300">
      <div className="w-full max-w-xl p-8 sm:p-10 bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-8 animate-in fade-in-50 duration-300">
        
        {/* Header & Status */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 stroke-[2.25]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t.successTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto font-normal">
            {t.successSubtitle}
          </p>
        </div>

        {/* Candidate & Confirmation Details (Clean Border Layout, No Heavy Cards) */}
        <div className="border-y border-slate-200/80 dark:border-slate-800/80 py-5 space-y-3 text-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{lang === "vi" ? "Ứng viên:" : "Applicant:"} <strong className="text-slate-900 dark:text-slate-100 font-semibold">{fullName}</strong></span>
            <span className="font-mono text-slate-400 dark:text-slate-500">{formattedTime}</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.successMsg}
          </p>

          {confirmationEmailQueued && (
            <div className="pt-2 flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">{t.successEmailNote} <strong className="text-slate-900 dark:text-slate-100 font-medium">{email}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{lang === "vi" ? "Đã chép" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === "vi" ? "Sao chép" : "Copy"}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Next Steps List (Clean Editorial Typography) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.successNextStepsTitle}
          </h3>
          <ul className="space-y-2.5">
            {t.successNextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-mono text-slate-400 dark:text-slate-500 text-xs font-semibold shrink-0 mt-0.5">
                  0{i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Channel Link */}
        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>{lang === "vi" ? "Cần hỗ trợ? Theo dõi thông tin tại " : "Need help? Follow updates on "}</span>
          <a
            href="https://facebook.com/bdchcmut"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Fanpage Big Data Club</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Action Buttons (Clean & Purposeful) */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onReset && (
            <Button
              type="button"
              onClick={onReset}
              variant="outline"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl px-5 py-2.5 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.btnFillNewForm}</span>
            </Button>
          )}

          <Button
            asChild
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5 text-xs transition-colors shadow-xs"
          >
            <Link href="/">
              <span>{t.btnReturnHome}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
};
