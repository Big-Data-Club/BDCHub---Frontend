"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";

export interface ScrollIndicatorProps {
  actionsDuration: number;
  actionsYOffset: number;
}

export function ScrollIndicator({
  actionsDuration,
  actionsYOffset,
}: ScrollIndicatorProps) {
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
      initial="hidden"
      animate="visible"
      className="hidden lg:flex absolute bottom-6 left-0 right-0 mx-auto justify-center transition-all duration-200 w-fit z-20"
    >
      <a 
        href="#about" 
        onClick={(e) => handleScrollToElement(e, "about")}
        aria-label="Cuộn xuống để xem thêm"
        className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors group cursor-pointer"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] opacity-60 group-hover:opacity-100 transition-opacity">Tiếp tục</span>
        <div className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-start justify-center p-1.5 group-hover:border-blue-500 dark:group-hover:border-cyan-400 transition-colors">
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-1 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 group-hover:bg-blue-600 dark:group-hover:bg-cyan-400 transition-colors"
          />
        </div>
      </a>
    </motion.div>
  );
}
