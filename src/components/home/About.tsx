"use client";

import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "../common/SectionHeader";
import TerminalCard from "../common/TerminalCard";

export default function About() {
  const values = [
    { title: "Học Hỏi Không Ngừng", desc: "Trân trọng điểm mạnh của từng cá nhân." },
    { title: "Dám Nghĩ Dám Làm", desc: "Tư duy đổi mới, không ngại thử nghiệm." },
    { title: "Chia Sẻ Cởi Mở", desc: "Open Learning - Open Sharing." },
    { title: "Học Qua Dự Án", desc: "Learning by Doing - Thực chiến." }
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader icon={BookOpen} title="Về Câu Lạc Bộ" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-2 gap-8 items-stretch"
        >
          <TerminalCard className="p-8 space-y-6 text-slate-600 dark:text-slate-200 leading-relaxed text-lg flex flex-col justify-center">
            <p><strong className="text-slate-900 dark:text-white font-bold">Big Data Club</strong> là câu lạc bộ học thuật tại ĐH Bách Khoa TP.HCM, được thành lập năm 2021 dưới sự hướng dẫn của PGS.TS Thoại Nam và HPC Lab.</p>
            <p>Với tinh thần <strong className="text-blue-600 dark:text-cyan-400 font-semibold">Think Big - Speak Data</strong> và phương châm <strong className="text-blue-600 dark:text-cyan-400 font-semibold">Learning by Doing</strong>, chúng tôi xây dựng một môi trường cởi mở để sinh viên rèn luyện thực chiến.</p>
          </TerminalCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * idx, ease: [0.16, 1, 0.3, 1] }}
              >
                <TerminalCard className="group p-6 flex flex-col justify-center h-full">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                    {val.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
                    {val.desc}
                  </p>
                </TerminalCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
