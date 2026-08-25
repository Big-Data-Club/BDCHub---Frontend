"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={scrollToTop}
          aria-label="Về đầu trang"
          title="Về đầu trang"
          className="fixed bottom-6 right-6 z-40 p-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-white/90 dark:bg-[#070E1C]/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-blue-500/20 shadow-xl shadow-slate-900/10 dark:shadow-[0_8px_30px_rgba(7,14,28,0.8)] backdrop-blur-xl hover:bg-blue-600 hover:text-white dark:hover:bg-cyan-400 dark:hover:text-slate-950 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
