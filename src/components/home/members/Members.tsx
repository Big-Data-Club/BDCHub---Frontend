"use client";

import { useMemo } from "react";
import { Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import clubData from "@/data/clubData.json";
import SectionHeader from "../../common/SectionHeader";
import { MentorCard, MentorItem } from "./MentorCard";

export default function Members() {
  const mentorsList: MentorItem[] = useMemo(() => {
    return (clubData.mentors || []).map((m) => ({
      id: m.id,
      name: m.name,
      desc: m.description,
      team: "Mentors",
      imageUrl: m.imageUrl,
      role: m.role,
    }));
  }, []);

  return (
    <section id="members" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <SectionHeader icon={Users} title="Đội Ngũ Cố Vấn BDC" centered />

        {/* Featured Mentors Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/90 dark:bg-[#0F1E35]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-blue-500/20 shadow-xl dark:shadow-[0_8px_32px_rgba(7,14,28,0.5)]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-cyan-400/10 text-blue-600 dark:text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Ban Cố Vấn & Giảng Viên Hướng Dẫn
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                Bảo trợ chuyên môn và định hướng nghiên cứu khoa học cho BDC HCMUT
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mentorsList.map((mentor, idx) => (
              <MentorCard key={mentor.id} mentor={mentor} idx={idx} />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
