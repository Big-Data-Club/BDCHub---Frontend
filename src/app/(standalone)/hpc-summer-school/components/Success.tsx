import React from "react";
import Image from "next/image";
import { Translation, ORGANIZERS } from "../types";

interface SuccessProps {
  t: Translation;
  name: string;
}

export function Success({ t, name }: SuccessProps) {
  return (
    <div className="py-16 text-center space-y-8">
      <div className="relative inline-flex">
        <div className="w-24 h-24 rounded-full border-2 border-cyan-400 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center">
          <svg className="w-12 h-12 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 dark:bg-cyan-400/10 animate-ping" />
      </div>
      <div className="space-y-2">
        <p className="text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.25em] text-xs font-bold">{t.successTag}</p>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
          {t.successTitle1}<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">{name || "Applicant"}</span>
          {" "}{t.successTitle2}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">{t.successDesc}</p>
      </div>
      <div className="border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 space-y-3 max-w-sm mx-auto">
        <p className="text-slate-500 dark:text-slate-400 text-xs">{t.followUs}</p>
        <div className="flex flex-wrap justify-center gap-5">
          {t.links.map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={`text-sm font-semibold transition-colors ${l.color}`}>{l.label} →</a>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {ORGANIZERS.map(o => (
          <div key={o.alt} className="relative w-9 h-9">
            <Image src={o.src} alt={o.alt} fill className="object-contain opacity-50 dark:opacity-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
