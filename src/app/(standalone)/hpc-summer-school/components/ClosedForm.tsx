import React from "react";
import Image from "next/image";
import { Lang, ORGANIZERS } from "../types";

interface ClosedFormProps {
  lang: Lang;
}

export function ClosedForm({ lang }: ClosedFormProps) {
  const content = {
    en: {
      tag: "Form Closed",
      title: "Registration is Closed",
      desc: "Please check your email in the next 24 hours. The organizing committee will send you an email.",
      contact: "For any inquiries, contact us at:",
    },
    vi: {
      tag: "Form đã đóng",
      title: "Đăng Ký Đã Đóng",
      desc: "Vui lòng kiểm tra email của bạn trong 24h tới, ban tổ chức sẽ gửi email.",
      contact: "Mọi thắc mắc vui lòng liên hệ:",
    },
  }[lang];

  return (
    <div className="py-14 text-center space-y-7 animate-fade-in">
      <div className="relative inline-flex">
        <div className="w-24 h-24 rounded-full border-2 border-rose-500/80 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
          <svg className="w-12 h-12 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full bg-rose-500/15 dark:bg-rose-550/10 animate-ping" />
      </div>
      <div className="space-y-3">
        <p className="text-rose-600 dark:text-rose-400 uppercase tracking-[0.25em] text-xs font-black">{content.tag}</p>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-snug">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">{content.title}</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-350 text-base font-semibold leading-relaxed max-w-md mx-auto">{content.desc}</p>
      </div>
      <div className="border border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-5 space-y-2.5 max-w-xs mx-auto">
        <p className="text-slate-400 dark:text-slate-500 text-xs">{content.contact}</p>
        <div className="flex flex-col gap-1.5 items-center">
          <a href="mailto:bdc@hcmut.edu.vn" className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
            bdc@hcmut.edu.vn
          </a>
          <a href="https://www.facebook.com/BDCofHCMUT" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
            Facebook Big Data Club
          </a>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        {ORGANIZERS.map(o => (
          <div key={o.alt} className="relative w-9 h-9">
            <Image src={o.src} alt={o.alt} fill className="object-contain opacity-40 dark:opacity-30" />
          </div>
        ))}
      </div>
    </div>
  );
}
