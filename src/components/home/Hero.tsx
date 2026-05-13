"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <section className="relative min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center mt-8">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Title — solid color, no gradient text */}
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Big Data Club
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Câu lạc bộ học thuật hàng đầu tại HCMUT chuyên nghiên cứu và phát triển trong lĩnh vực Dữ liệu lớn, Trí tuệ nhân tạo, Điện toán đám mây và Điện toán lượng tử.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <a
            href="#about"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm dark:shadow-blue-900/30 active:scale-95 transition-all duration-200 flex items-center gap-2"
          >
            Tìm hiểu thêm <ArrowRight className="w-4 h-4" />
          </a>
          {isAuthenticated && (
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-3.5 bg-white dark:bg-[#0F1E35] text-slate-800 dark:text-slate-300 font-medium rounded-xl border border-slate-200 dark:border-blue-500/20 hover:bg-slate-50 dark:hover:bg-[#162644] hover:border-slate-300 dark:hover:border-blue-500/40 active:scale-95 transition-all duration-200"
            >
              Bảng quản trị
            </button>
          )}
        </div>

        {/* Stats — glassmorphic cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 mt-12">
          {[
            { label: "Kết nối", value: "100+" },
            { label: "Năm hoạt động", value: "4" },
            { label: "Dự án NCKH", value: "10+" },
            { label: "Giải thưởng", value: "5+" }
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-2xl
                                    bg-white/60 dark:bg-[#0F1E35]/50
                                    backdrop-blur-sm
                                    border border-slate-200/80 dark:border-blue-500/10
                                    hover:border-slate-300 dark:hover:border-blue-500/25
                                    transition-all duration-300">
              <div className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="pt-8 flex justify-center">
          <a href="#about" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
            <span className="text-xs font-medium uppercase tracking-widest">Khám phá</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}