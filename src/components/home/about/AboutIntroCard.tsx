"use client";

import { motion } from "framer-motion";
import TerminalCard from "../../common/TerminalCard";

export function AboutIntroCard() {
  return (
    <TerminalCard className="md:col-span-6 lg:col-span-5 p-8 sm:p-10 space-y-6 text-slate-700 dark:text-slate-200 leading-relaxed text-base sm:text-lg flex flex-col justify-center bg-white/90 dark:bg-[#0F1E35]/90 backdrop-blur-md">
      <p>
        <strong className="text-slate-900 dark:text-white font-extrabold">Big Data Club (BDC)</strong> là câu lạc bộ học thuật chuyên sâu tại ĐH Bách Khoa TP.HCM, được thành lập năm 2021 dưới sự hướng dẫn chuyên môn của PGS.TS Thoại Nam và phòng thí nghiệm HPC Lab.
      </p>
      <p>
        Với tinh thần <strong className="text-blue-600 dark:text-cyan-400 font-bold">Think Big • Speak Data</strong> và phương châm <strong className="text-blue-600 dark:text-cyan-400 font-bold">Learning by Doing</strong>, BDC xây dựng môi trường học thuật sáng tạo, kết nối tri thức và nghiên cứu ứng dụng.
      </p>
    </TerminalCard>
  );
}
