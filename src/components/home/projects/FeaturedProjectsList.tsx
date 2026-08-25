"use client";

import Link from "next/link";
import { Briefcase, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import clubData from "@/data/clubData.json";
import SectionHeader from "../../common/SectionHeader";
import TerminalCard from "../../common/TerminalCard";

export function FeaturedProjectsList() {
  return (
    <motion.div
      className="lg:col-span-7"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <SectionHeader icon={Briefcase} title="Dự Án Nổi Bật" />
      
      <div className="space-y-4">
        {clubData.projects.map((project, idx) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.35, delay: 0.06 * idx, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={project.projectShowcaseUrl} className="block group">
              <TerminalCard className="p-6 bg-white/90 dark:bg-[#0F1E35]/90 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                    {project.projectName}
                  </h3>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#070E1C] text-blue-600 dark:text-cyan-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-400 dark:group-hover:text-black shrink-0 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                  {project.desc}
                </p>
              </TerminalCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
