"use client";
import { BookOpen } from "lucide-react";
import SectionHeader from "../common/SectionHeader";

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

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div
            className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg
                          bg-white dark:bg-[#0F1E35]
                          p-8 rounded-2xl
                          border border-slate-200 dark:border-blue-500/20
                          shadow-md dark:shadow-[0_4px_24px_rgba(7,14,28,0.5)]
                          hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10
                          dark:hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)]
                          dark:hover:border-blue-500/40
                          transition-transform transition-shadow transition-colors duration-300 flex flex-col justify-center"
          >
            <p><strong className="text-slate-900 dark:text-white font-bold">Big Data Club</strong> là câu lạc bộ học thuật tại ĐH Bách Khoa TP.HCM, được thành lập năm 2021 dưới sự hướng dẫn của PGS.TS Thoại Nam và HPC Lab.</p>
            <p>Với tinh thần <strong className="text-blue-600 dark:text-cyan-400 font-semibold">Think Big - Speak Data</strong> và phương châm <strong className="text-blue-600 dark:text-cyan-400 font-semibold">Learning by Doing</strong>, chúng tôi xây dựng một môi trường cởi mở để sinh viên rèn luyện thực chiến.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((val, idx) => (
              <div
                key={idx} 
                className="group bg-white dark:bg-[#0F1E35]
                           p-6 rounded-2xl
                           border border-slate-200 dark:border-blue-500/20
                           shadow-md dark:shadow-[0_4px_20px_rgba(7,14,28,0.4)]
                           hover:-translate-y-1
                           hover:shadow-xl hover:shadow-blue-500/10
                           dark:hover:shadow-[0_8px_30px_rgba(34,211,238,0.12)]
                           hover:border-blue-400/60 dark:hover:border-cyan-400/40
                           transition-transform transition-shadow transition-colors duration-300 flex flex-col justify-center"
              >
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                  {val.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
