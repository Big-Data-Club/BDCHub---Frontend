"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { logout } from "@/services/auth/logout";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, ChevronDown, CalendarDays, ExternalLink, Facebook, Mail, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHpcDropdownOpen, setIsHpcDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside for touch & mobile devices
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsHpcDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { href: "/#about", label: "Về CLB" },
    { href: "/#activities", label: "Hoạt Động" },
    { href: "/#projects", label: "Dự Án" },
    { href: "/instructions/student", label: "Hướng dẫn" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-[#070E1C]/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 dark:shadow-[0_4px_24px_rgba(7,14,28,0.8)] border-b border-slate-200/80 dark:border-blue-500/20 py-3"
          : "bg-white/70 dark:bg-[#070E1C]/70 backdrop-blur-md border-b border-slate-200/40 dark:border-white/5 py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <button 
            className="flex items-center gap-3 cursor-pointer text-left bg-transparent border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-cyan-400 rounded-xl group min-h-[44px]"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              if (window.location.hash) {
                window.history.replaceState(null, "", window.location.pathname);
              }
            }}
            aria-label="BDC Hub - Về đầu trang"
          >
            <div className="transition-transform duration-300 group-hover:scale-105">
              <Logo />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                BDC Hub
              </h2>
              <p className="text-xs text-blue-600 dark:text-cyan-400 font-bold tracking-wider uppercase">
                Think Big • Speak Data
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            {navItems.map((item, index) => (
              <a 
                key={index} 
                href={item.href} 
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors relative py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-cyan-400 rounded-md"
              >
                {item.label}
              </a>
            ))}

            {/* HPC School Dropdown */}
            <div 
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setIsHpcDropdownOpen(true)}
              onMouseLeave={() => setIsHpcDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsHpcDropdownOpen(!isHpcDropdownOpen)}
                aria-expanded={isHpcDropdownOpen}
                aria-haspopup="true"
                aria-controls="hpc-school-menu"
                aria-label="Danh mục HPC School 2026"
                className="flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-cyan-400 hover:opacity-90 transition-all py-2 px-3.5 min-h-[44px] bg-blue-50/80 dark:bg-cyan-500/10 rounded-xl border border-blue-200/60 dark:border-cyan-500/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-cyan-400"
              >
                <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse shrink-0" />
                <span>HPC School 2026</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHpcDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {isHpcDropdownOpen && (
                  <motion.div
                    id="hpc-school-menu"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-[#070E1C]/95 border border-slate-200 dark:border-blue-500/20 p-2.5 shadow-2xl shadow-slate-900/10 dark:shadow-[0_10px_30px_rgba(7,14,28,0.9)] backdrop-blur-2xl z-50"
                  >
                    <a
                      href="/hpc-summer-school"
                      className="flex items-center gap-3 px-3.5 py-3 min-h-[44px] rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#0F1E35] hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200"
                    >
                      <CalendarDays className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>Đăng ký School</span>
                    </a>
                    <a
                      href="https://hpcc.hcmut.edu.vn/hpc-school"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3.5 py-3 min-h-[44px] rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0F1E35] hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Trang thông tin School</span>
                    </a>
                    <div className="h-px bg-slate-100 dark:bg-blue-500/15 my-1.5" />
                    <div className="px-3.5 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Liên hệ BTC
                    </div>
                    <a
                      href="https://www.facebook.com/BDCofHCMUT"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F1E35] hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200"
                    >
                      <Facebook className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Qua Facebook</span>
                    </a>
                    <a
                      href="mailto:bdc@hcmut.edu.vn"
                      className="flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0F1E35] hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-200"
                    >
                      <Mail className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Qua Email</span>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-slate-700 dark:text-slate-200 border-slate-300 dark:border-blue-500/20 hover:bg-slate-100 dark:hover:bg-[#162644] rounded-xl min-h-[44px] active:scale-95 transition-all duration-200 font-semibold"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="px-5 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 dark:shadow-blue-900/40 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center"
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
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1E35] rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-white/98 dark:bg-[#070E1C]/98 border-b border-slate-200 dark:border-blue-500/15 overflow-hidden backdrop-blur-xl"
          >
            <div className="px-4 pt-3 pb-6 space-y-2">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center min-h-[44px] px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#0F1E35] rounded-xl transition-all duration-200"
                >
                  {item.label}
                </a>
              ))}

              {/* HPC School Mobile Section */}
              <div className="pt-3 border-t border-slate-100 dark:border-blue-500/15 mt-3">
                <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  HPC School 2026
                </div>
                <a
                  href="/hpc-summer-school"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center min-h-[44px] px-4 py-3 text-base font-bold text-blue-600 dark:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#0F1E35] rounded-xl transition-all duration-200"
                >
                  📝 Đăng ký School
                </a>
                <a
                  href="https://hpcc.hcmut.edu.vn/hpc-school"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center min-h-[44px] px-4 py-3 text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0F1E35] rounded-xl transition-all duration-200"
                >
                  🌐 Trang thông tin School
                </a>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-blue-500/15 mt-3 px-2">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-slate-100 dark:bg-[#0F1E35] text-slate-700 dark:text-slate-200 font-bold rounded-xl active:scale-[0.97] transition-all duration-200"
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
                    className="w-full py-3 min-h-[44px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg active:scale-[0.97] transition-all duration-200"
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



