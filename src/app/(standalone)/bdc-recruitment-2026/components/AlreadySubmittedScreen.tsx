"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, RotateCcw } from "lucide-react";
import { T, Lang } from "../types";
import { Button } from "@/components/ui/button";

interface AlreadySubmittedScreenProps {
  savedName: string;
  lang: Lang;
  onReset: () => void;
}

export const AlreadySubmittedScreen: React.FC<AlreadySubmittedScreenProps> = ({ savedName, lang, onReset }) => {
  const t = T[lang];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="relative z-10 min-h-screen bg-transparent flex items-center justify-center px-4 py-16 transition-colors duration-300">
      <div className="max-w-md w-full p-8 bg-white dark:bg-[#0A1325] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-6 animate-fade-in-delayed">
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.alreadySubmittedTitle}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.alreadySubmittedDesc}</p>
          {savedName && (
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 pt-1">
              {lang === "vi" ? "Ứng viên: " : "Applicant: "}{savedName}
            </p>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.btnFillNewForm}</span>
          </Button>

          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl px-5 py-2.5 shadow-xs active:scale-95 transition-all duration-200">
            <Link href="/" className="inline-flex items-center gap-1.5">
              <span>{t.btnReturnHome}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
