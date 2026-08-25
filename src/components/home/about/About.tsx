"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { AboutIntroCard } from "./AboutIntroCard";
import { AboutValueGrid } from "./AboutValueGrid";

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-mono tracking-widest text-blue-600 dark:text-cyan-400 uppercase font-semibold">
              01 // GIỚI THIỆU
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Về Câu Lạc Bộ
            </h2>
          </div>
          
          <a 
            href="#projects"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:underline underline-offset-4 group shrink-0"
          >
            <span>Khám phá các dự án nghiên cứu</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </a>
        </div>

        {/* Content Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-12 gap-10 lg:gap-16 items-start"
        >
          <AboutIntroCard />
          <AboutValueGrid />
        </motion.div>
      </div>
    </section>
  );
}


