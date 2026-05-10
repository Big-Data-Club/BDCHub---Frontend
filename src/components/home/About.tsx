"use client";
import { BookOpen } from "lucide-react";
import { useScrollAnimation } from "@/hooks/animation/useScrollAnimation";

export default function About() {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section id="about" ref={ref} className={`py-24 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="text-blue-600" /> Về Câu Lạc Bộ
          </h2>
          <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6 text-slate-600 leading-relaxed text-lg bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <p><strong className="text-slate-900">Big Data Club</strong> là câu lạc bộ học thuật tại ĐH Bách Khoa TP.HCM, được thành lập năm 2021 dưới sự hướng dẫn của PGS.TS Thoại Nam và HPC Lab.</p>
            <p>Với tinh thần <strong className="text-blue-600">Think Big - Speak Data</strong> và phương châm <strong className="text-blue-600">Learning by Doing</strong>, chúng tôi xây dựng một môi trường cởi mở để sinh viên rèn luyện thực chiến.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Học Hỏi Không Ngừng", desc: "Trân trọng điểm mạnh của từng cá nhân." },
              { title: "Dám Nghĩ Dám Làm", desc: "Tư duy đổi mới, không ngại thử nghiệm." },
              { title: "Chia Sẻ Cởi Mở", desc: "Open Learning - Open Sharing." },
              { title: "Học Qua Dự Án", desc: "Learning by Doing - Thực chiến." }
            ].map((val, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 mb-2">{val.title}</h3>
                <p className="text-sm text-slate-500">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}