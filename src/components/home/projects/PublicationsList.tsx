"use client";

import { useState } from "react";
import { BookOpen, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import clubData from "@/data/clubData.json";
import SectionHeader from "../../common/SectionHeader";

export function PublicationsList() {
  const [copiedPubId, setCopiedPubId] = useState<string | null>(null);

  const handleCopyCitation = (pub: { title: string; authors: string; publisher: string; year: string | number }, id: string) => {
    const citationText = `${pub.authors}. "${pub.title}." ${pub.publisher} (${pub.year}).`;
    navigator.clipboard.writeText(citationText);
    setCopiedPubId(id);
    setTimeout(() => {
      setCopiedPubId(null);
    }, 2000);
  };

  return (
    <motion.div
      className="lg:col-span-5 flex flex-col h-full justify-between"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <div>
        <SectionHeader icon={BookOpen} title="Công Bố Khoa Học" />
        
        <div className="divide-y divide-slate-300 dark:divide-slate-800">
          {clubData.publications.map((pub, idx) => (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.35, delay: 0.06 * idx, ease: [0.16, 1, 0.3, 1] }}
              className="py-5 first:pt-0 last:pb-0 group"
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 border border-blue-200/80 dark:border-blue-500/30">
                    {pub.year}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[260px]">
                    {pub.publisher}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCitation(pub, pub.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/60"
                  title="Sao chép trích dẫn"
                >
                  {copiedPubId === pub.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-xs">Trích dẫn</span>
                    </>
                  )}
                </button>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                {pub.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                {pub.authors}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
