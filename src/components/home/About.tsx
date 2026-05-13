"use client";
import { BookOpen } from "lucide-react";
import { useScrollAnimation } from "@/hooks/animation/useScrollAnimation";

export default function About() {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section id="about" ref={ref} className={`py-24 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section header — pipeline style */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-2">
            <BookOpen className="text-blue-600 dark:text-cyan-400 w-6 h-6 shrink-0" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Về Câu Lạc Bộ</h2>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-12 h-1 bg-blue-600 dark:bg-cyan-400 rounded-full" />
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 dark:from-cyan-400/20 to-transparent" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg
                          bg-white/80 dark:bg-[#0F1E35]/70
                          backdrop-blur-sm
                          p-8 rounded-2xl
                          border border-slate-200 dark:border-blue-500/10
                          shadow-sm dark:shadow-none
                          hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5
                          dark:hover:shadow-[0_8px_30px_rgba(37,99,235,0.06)]
                          dark:hover:border-blue-500/20
                          transition-all duration-300">
            <p><strong className="text-slate-900 dark:text-white">Big Data Club</strong> là câu lạc bộ học thuật tại ĐH Bách Khoa TP.HCM, được thành lập năm 2021 dưới sự hướng dẫn của PGS.TS Thoại Nam và HPC Lab.</p>
            <p>Với tinh thần <strong className="text-blue-600 dark:text-cyan-400">Think Big - Speak Data</strong> và phương châm <strong className="text-blue-600 dark:text-cyan-400">Learning by Doing</strong>, chúng tôi xây dựng một môi trường cởi mở để sinh viên rèn luyện thực chiến.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Học Hỏi Không Ngừng", desc: "Trân trọng điểm mạnh của từng cá nhân." },
              { title: "Dám Nghĩ Dám Làm", desc: "Tư duy đổi mới, không ngại thử nghiệm." },
              { title: "Chia Sẻ Cởi Mở", desc: "Open Learning - Open Sharing." },
              { title: "Học Qua Dự Án", desc: "Learning by Doing - Thực chiến." }
            ].map((val, idx) => (
              <div key={idx} className="group bg-white/80 dark:bg-[#0F1E35]/70
                                        backdrop-blur-sm
                                        p-6 rounded-2xl
                                        border border-slate-200 dark:border-blue-500/10
                                        shadow-sm dark:shadow-none
                                        hover:-translate-y-1
                                        hover:shadow-lg hover:shadow-blue-500/5
                                        dark:hover:shadow-[0_8px_30px_rgba(37,99,235,0.06)]
                                        hover:border-blue-300/60 dark:hover:border-blue-500/25
                                        transition-all duration-300">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">{val.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}