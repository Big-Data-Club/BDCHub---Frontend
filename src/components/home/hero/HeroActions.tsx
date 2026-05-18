"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, Variants } from "framer-motion";

export interface HeroActionsProps {
  actionsDuration: number;
  actionsYOffset: number;
}

export function HeroActions({
  actionsDuration,
  actionsYOffset,
}: HeroActionsProps) {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const shouldReduceMotion = useReducedMotion();

  const handleScrollToElement = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
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

  const actionsVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : actionsYOffset,
      filter: shouldReduceMotion ? "none" : "blur(4px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "none",
      transition: {
        duration: actionsDuration,
        ease: [0.16, 1, 0.3, 1], // Premium out-expo easing
        delay: 1.65, // Staggered to cascade gracefully after description reveal
      },
    },
  };

  return (
    <motion.div 
      variants={actionsVariants}
      className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2 w-full sm:w-auto transition-all duration-200"
    >
      {isAuthenticated ? (
        <>
          <button
            onClick={() => router.push("/dashboard")}
            aria-label="Đi đến Bảng quản trị"
            className="group px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl w-full sm:w-auto
                       shadow-sm hover:shadow-lg hover:shadow-blue-600/20
                       dark:shadow-blue-900/30 dark:hover:shadow-blue-500/20
                       active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Bảng quản trị <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <a
            href="#about"
            onClick={(e) => handleScrollToElement(e, "about")}
            aria-label="Tìm hiểu thêm về Big Data Club"
            className="px-8 py-3.5 bg-white dark:bg-[#0F1E35] text-slate-800 dark:text-slate-300 font-medium rounded-xl w-full sm:w-auto text-center
                       border border-slate-200 dark:border-blue-500/20
                       hover:bg-slate-50 dark:hover:bg-[#162644]
                       hover:border-slate-300 dark:hover:border-blue-500/40
                       hover:-translate-y-1 hover:shadow-md
                       active:scale-95 transition-all duration-300"
          >
            Về BDC Hub
          </a>
        </>
      ) : (
        <>
          <button
            onClick={() => router.push("/login")}
            aria-label="Bắt đầu ngay tại BDC Hub"
            className="group px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl w-full sm:w-auto
                       shadow-sm hover:shadow-lg hover:shadow-blue-600/20
                       dark:shadow-blue-900/30 dark:hover:shadow-blue-500/20
                       active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Bắt đầu ngay <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <a
            href="#projects"
            onClick={(e) => handleScrollToElement(e, "projects")}
            aria-label="Khám phá các dự án nổi bật của BDC"
            className="px-8 py-3.5 bg-white dark:bg-[#0F1E35] text-slate-800 dark:text-slate-300 font-medium rounded-xl w-full sm:w-auto text-center
                       border border-slate-200 dark:border-blue-500/20
                       hover:bg-slate-50 dark:hover:bg-[#162644]
                       hover:border-slate-300 dark:hover:border-blue-500/40
                       hover:-translate-y-1 hover:shadow-md
                       active:scale-95 transition-all duration-300"
          >
            Xem dự án
          </a>
        </>
      )}
    </motion.div>
  );
}
