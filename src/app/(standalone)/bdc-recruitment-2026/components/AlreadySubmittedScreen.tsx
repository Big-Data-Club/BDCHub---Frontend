"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { T, Lang } from "../types";

import { Button } from "@/components/ui/button";

interface AlreadySubmittedScreenProps {
  savedName: string;
  lang: Lang;
  onReset: () => void;
}

export const AlreadySubmittedScreen: React.FC<AlreadySubmittedScreenProps> = ({ savedName, lang, onReset }) => {
  const t = T[lang];

  return (
    <div className="relative z-10 min-h-screen bg-slate-50 dark:bg-[#050B18] flex items-center justify-center px-4 py-16 transition-colors duration-300">
      <div className="max-w-md w-full p-8 bg-white dark:bg-[#0F1E35] border border-slate-200/90 dark:border-blue-500/15 rounded-3xl shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
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
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold active:scale-95 transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Điền lại đơn mới</span>
          </Button>

          <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl px-5 py-2.5 shadow-md active:scale-95 transition-all duration-200">
            <Link href="/">
              <span>Về trang chủ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
