"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export interface HeroActionsProps {
  actionsDuration?: number;
  actionsYOffset?: number;
}

export function HeroActions({
  actionsDuration: _actionsDuration,
  actionsYOffset: _actionsYOffset,
}: HeroActionsProps = {}) {
  void _actionsDuration;
  void _actionsYOffset;
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleScrollToElement = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2 w-full sm:w-auto"
    >
      {isAuthenticated ? (
        <>
          <button
            onClick={() => router.push("/dashboard")}
            aria-label="Đi đến Bảng quản trị"
            className="group px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl w-full sm:w-auto
                       shadow-xs active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Bảng quản trị</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <a
            href="#about"
            onClick={(e) => handleScrollToElement(e, "about")}
            aria-label="Tìm hiểu thêm về Big Data Club"
            className="px-7 py-3 bg-white dark:bg-[#0F1E35] text-slate-800 dark:text-slate-200 font-medium rounded-xl w-full sm:w-auto text-center
                       border border-slate-200 dark:border-slate-800
                       hover:bg-slate-50 dark:hover:bg-[#162644] hover:border-slate-300 dark:hover:border-slate-700
                       active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Về BDC Hub
          </a>
        </>
      ) : (
        <>
          <button
            onClick={() => router.push("/login")}
            aria-label="Bắt đầu ngay tại BDC Hub"
            className="group px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl w-full sm:w-auto
                       shadow-xs active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Bắt đầu ngay</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <a
            href="#projects"
            onClick={(e) => handleScrollToElement(e, "projects")}
            aria-label="Khám phá các dự án nổi bật của BDC"
            className="px-7 py-3 bg-white dark:bg-[#0F1E35] text-slate-800 dark:text-slate-200 font-medium rounded-xl w-full sm:w-auto text-center
                       border border-slate-200 dark:border-slate-800
                       hover:bg-slate-50 dark:hover:bg-[#162644] hover:border-slate-300 dark:hover:border-slate-700
                       active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Xem dự án
          </a>
        </>
      )}
    </motion.div>
  );
}


