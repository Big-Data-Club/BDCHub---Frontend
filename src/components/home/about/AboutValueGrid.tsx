"use client";

import { GraduationCap, Lightbulb, Share2, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import TerminalCard from "../../common/TerminalCard";

export const aboutValues = [
  { 
    title: "Học Hỏi Không Ngừng", 
    desc: "Trân trọng tiềm năng và phát triển kĩ năng cho từng cá nhân.", 
    icon: GraduationCap,
    color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 border-blue-200/60 dark:border-blue-500/25"
  },
  { 
    title: "Dám Nghĩ Dám Làm", 
    desc: "Tư duy đổi mới sáng tạo, không ngại thử nghiệm công nghệ mới.", 
    icon: Lightbulb,
    color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/25"
  },
  { 
    title: "Chia Sẻ Cởi Mở", 
    desc: "Tinh thần Open Learning - Open Sharing cùng phát triển.", 
    icon: Share2,
    color: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-500/25"
  },
  { 
    title: "Học Qua Dự Án", 
    desc: "Phương châm Learning by Doing - Thực chiến qua dự án thực tế.", 
    icon: Code2,
    color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/25"
  }
];

export function AboutValueGrid() {
  return (
    <div className="md:col-span-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {aboutValues.map((val, idx) => {
        const Icon = val.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.08 * idx, ease: [0.16, 1, 0.3, 1] }}
          >
            <TerminalCard className="group p-6 flex flex-col justify-between h-full bg-white/90 dark:bg-[#0F1E35]/90 backdrop-blur-md">
              <div>
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 ${val.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                  {val.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {val.desc}
                </p>
              </div>
            </TerminalCard>
          </motion.div>
        );
      })}
    </div>
  );
}
