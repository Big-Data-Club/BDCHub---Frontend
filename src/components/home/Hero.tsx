"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function Hero() {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleScrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("about");
    if (element) {
      const offset = 80; // Offset for Navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 1.4,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="hero" className="relative min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center mt-8">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          {/* Title — gradient in dark mode. Added pb-2 to prevent clipping of descenders like 'g' */}
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 
                         dark:bg-gradient-to-r dark:from-blue-400 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent
                         pb-2 px-1 leading-tight">
            Big Data Club
          </h1>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }} // Shifted from 0.2
          className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
        >
          Câu lạc bộ học thuật hàng đầu tại HCMUT chuyên nghiên cứu và phát triển trong lĩnh vực Dữ liệu lớn, Trí tuệ nhân tạo, Điện toán đám mây và Điện toán lượng tử.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }} // Shifted from 0.4
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
        >
          <a
            href="#about"
            onClick={handleScrollToAbout}
            aria-label="Tìm hiểu thêm về Big Data Club"
            className="group px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl
                       shadow-sm hover:shadow-lg hover:shadow-blue-600/20
                       dark:shadow-blue-900/30 dark:hover:shadow-blue-500/20
                       active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            Tìm hiểu thêm <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          {isAuthenticated && (
            <button
              onClick={() => router.push("/dashboard")}
              aria-label="Đi đến Bảng quản trị"
              className="px-8 py-3.5 bg-white dark:bg-[#0F1E35] text-slate-800 dark:text-slate-300 font-medium rounded-xl
                         border border-slate-200 dark:border-blue-500/20
                         hover:bg-slate-50 dark:hover:bg-[#162644]
                         hover:border-slate-300 dark:hover:border-blue-500/40
                         hover:-translate-y-1 hover:shadow-md
                         active:scale-95 transition-all duration-300"
            >
              Bảng quản trị
            </button>
          )}
        </motion.div>

        {/* Stats — solid cards with staggered reveal */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 mt-12"
        >
          {[
            { label: "Kết nối", value: "100+" },
            { label: "Năm hoạt động", value: "4" },
            { label: "Dự án NCKH", value: "10+" },
            { label: "Giải thưởng", value: "5+" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="group text-center p-5 rounded-2xl cursor-default
                                     bg-white dark:bg-[#0F1E35]
                                     border border-slate-200 dark:border-blue-500/10
                                     hover:border-blue-300/60 dark:hover:border-blue-500/30
                                     hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5
                                     dark:hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)]
                                     transition-all duration-300"
            >
              <div className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400 group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.0 }} // Shifted from 1
          className="pt-8 flex justify-center"
        >
          <a 
            href="#about" 
            onClick={handleScrollToAbout}
            aria-label="Cuộn xuống để xem thêm"
            className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
          >
            <span className="text-xs font-medium uppercase tracking-widest">Khám phá</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}