"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { logout } from "@/services/auth/logout";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, ChevronDown, CalendarDays, ExternalLink, Facebook, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHpcDropdownOpen, setIsHpcDropdownOpen] = useState(false);
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { href: "/#about", label: "Về CLB" },
    { href: "/#activities", label: "Hoạt Động" },
    { href: "/#projects", label: "Dự Án" },
    { href: "/#members", label: "Thành Viên" },
    { href: "/instructions/student", label: "Hướng dẫn" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-[#070E1C]/95 backdrop-blur-xl shadow-md dark:shadow-[0_4px_20px_rgba(7,14,28,0.7)] border-b border-slate-200/80 dark:border-blue-500/20 py-3"
          : "bg-white/80 dark:bg-[#070E1C]/80 backdrop-blur-md border-b border-slate-200/40 dark:border-white/5 py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button 
            className="flex items-center gap-3 cursor-pointer text-left bg-transparent border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-cyan-400 rounded-xl"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              if (window.location.hash) {
                window.history.replaceState(null, "", window.location.pathname);
              }
            }}
            aria-label="BDC Hub - Về đầu trang"
          >
            <Logo />
            <div className="hidden sm:block">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">BDC Hub</h2>
              <p className="text-xs text-blue-600 dark:text-cyan-400 font-semibold tracking-wide uppercase">Think Big • Speak Data</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <a 
                key={index} 
                href={item.href} 
                className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
              >
                {item.label}
              </a>
            ))}

            {/* HPC School Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsHpcDropdownOpen(true)}
              onMouseLeave={() => setIsHpcDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsHpcDropdownOpen(!isHpcDropdownOpen)}
                aria-expanded={isHpcDropdownOpen}
                aria-haspopup="true"
                aria-label="Danh mục HPC School 2026"
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:opacity-85 transition-all py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-cyan-400 rounded-lg"
              >
                HPC School 2026
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHpcDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {isHpcDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-1 w-56 rounded-2xl bg-white dark:bg-[#070E1C] border border-slate-200 dark:border-blue-500/20 p-2 shadow-xl backdrop-blur-xl z-50"
                  >
                    <a
                      href="/hpc-summer-school"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#0F1E35] hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200"
                    >
                      <CalendarDays className="w-4 h-4 text-cyan-500" />
                      Đăng ký School
                    </a>
                    <a
                      href="https://hpcc.hcmut.edu.vn/hpc-school"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0F1E35] hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                      Đi đến School
                    </a>
                    <div className="h-px bg-slate-100 dark:bg-blue-500/10 my-1" />
                    <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Liên hệ BTC
                    </div>
                    <a
                      href="https://www.facebook.com/BDCofHCMUT"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F1E35] hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200"
                    >
                      <Facebook className="w-4 h-4 text-sky-600" />
                      Qua Facebook
                    </a>
                    <a
                      href="mailto:bdc@hcmut.edu.vn"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F1E35] hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200"
                    >
                      <Mail className="w-4 h-4 text-rose-500" />
                      Qua Email
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-slate-700 dark:text-slate-200 border-slate-300 dark:border-blue-500/20 hover:bg-slate-50 dark:hover:bg-[#162644] rounded-xl active:scale-95 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm dark:shadow-blue-900/30 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1E35] rounded-lg transition-colors cursor-pointer"
                aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white dark:bg-[#070E1C] border-b border-slate-200 dark:border-blue-500/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#0F1E35] rounded-xl transition-all"
                >
                  {item.label}
                </a>
              ))}

              {/* HPC School Section for Mobile */}
              <div className="pt-2 border-t border-slate-100 dark:border-blue-500/10 mt-2">
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider dark:text-slate-400">
                  HPC School 2026
                </div>
                <a
                  href="/hpc-summer-school"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-semibold text-blue-600 dark:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#0F1E35] rounded-xl transition-all"
                >
                  📝 Đăng ký School
                </a>
                <a
                  href="https://hpcc.hcmut.edu.vn/hpc-school"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0F1E35] rounded-xl transition-all"
                >
                  🌐 Đi đến School
                </a>
                <a
                  href="https://www.facebook.com/BDCofHCMUT"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F1E35] rounded-xl transition-all"
                >
                  🔵 Liên hệ qua Facebook
                </a>
                <a
                  href="mailto:bdc@hcmut.edu.vn"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F1E35] rounded-xl transition-all"
                >
                  ✉️ Liên hệ qua Email
                </a>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-blue-500/10 mt-2 px-4">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-[#0F1E35] text-slate-700 dark:text-slate-200 font-semibold rounded-xl active:scale-95 transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    Đăng xuất
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push("/login");
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md active:scale-95 transition-all"
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
