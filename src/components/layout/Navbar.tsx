"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const navItems = [
    { href: "/#about", label: "Về CLB" },
    { href: "/#activities", label: "Hoạt Động" },
    { href: "/#projects", label: "Dự Án" },
    { href: "/#members", label: "Thành Viên" }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <Logo />
            <div className="hidden sm:block">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">Big Data Club</h2>
              <p className="text-xs text-blue-600 font-semibold tracking-wide uppercase">Think Big • Speak Data</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <a key={index} href={item.href} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          <div>
            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="outline" className="text-slate-600 border-slate-300 hover:bg-slate-50">
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}