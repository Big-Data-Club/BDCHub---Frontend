"use client";

import { useState } from "react";
import { BookOpen, Sparkles, Copy, Check } from "lucide-react";
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
      className="lg:col-span-5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <SectionHeader icon={BookOpen} title="Công Bố Khoa Học" />
      
      <div className="space-y-4">
        {clubData.publications.map((pub, idx) => (
          <motion.div
            key={pub.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.35, delay: 0.06 * idx, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 rounded-2xl bg-white/90 dark:bg-[#0F1E35]/90 backdrop-blur-md border border-slate-200 dark:border-blue-500/20 shadow-md hover:border-blue-400/60 dark:hover:border-cyan-400/40 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse" />
                <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
                  {pub.year} • {pub.publisher}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCitation(pub, pub.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-cyan-300 hover:text-white bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 dark:hover:bg-cyan-500 rounded-lg transition-all border border-blue-200/60 dark:border-blue-500/20 cursor-pointer active:scale-95"
                title="Sao chép trích dẫn"
              >
                {copiedPubId === pub.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Trích dẫn</span>
                  </>
                )}
              </button>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
              {pub.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
              {pub.authors}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
