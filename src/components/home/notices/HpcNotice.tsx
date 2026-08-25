"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Bell } from "lucide-react";
import hpcLogo from "@/assets/hpc-school-logo.png";

export default function HpcNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem("hpc_school_notice_dismissed");
    if (!isDismissed) {
      // Show notice after a slight delay for a nice dynamic entry
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("hpc_school_notice_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl bg-white/90 dark:bg-[#070E1C]/90 backdrop-blur-xl border border-blue-500/20 dark:border-cyan-500/20 rounded-2xl p-3.5 sm:p-4 shadow-[0_10px_30px_rgba(30,58,138,0.15)] dark:shadow-[0_10px_30px_rgba(6,182,212,0.1)] flex items-center justify-between gap-3 sm:gap-4 pointer-events-auto motion-reduce:transform-none motion-reduce:transition-none"
        >

          {/* Left Side: Logo & Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* HPC Logo Icon Container */}
            <div className="relative w-12 h-12 flex-shrink-0 bg-white/70 dark:bg-white/10 p-1.5 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={hpcLogo}
                  alt="HPC School Logo"
                  fill
                  className="object-contain dark:brightness-110"
                />
              </div>
            </div>

            {/* Notice Message */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Bell className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Thông báo
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                Đăng ký HPC School 2026 đã đóng!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                Kiểm tra email của bạn trong 24h tới để nhận phản hồi từ BTC.
              </p>
            </div>
          </div>

          {/* Right Side: Action Buttons & Dismiss */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/hpc-summer-school"
              className="group flex items-center justify-center gap-1 min-h-[44px] px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              Chi tiết
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              aria-label="Đóng thông báo"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
