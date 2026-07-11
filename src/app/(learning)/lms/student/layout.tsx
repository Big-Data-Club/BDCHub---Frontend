"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || "";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selectedRole = sessionStorage.getItem("lms_selected_role");
    if (selectedRole !== "STUDENT") {
      router.push("/lms");
      return;
    }

    setLoading(false);
  }, [router]);

  const handleChangeRole = () => {
    sessionStorage.removeItem("lms_selected_role");
    router.push("/lms");
  };

  const navItems = [
    { href: "/lms/student", label: "Dashboard" },
    { href: "/lms/student/discover", label: "Khám phá" },
    { href: "/lms/student/ai-mentor", label: "AI Mentor" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-slate-100/80 dark:bg-[#050B18] overflow-hidden transition-colors duration-300">
        
        {/* Glow ambient background spots */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />



        {/* Smooth radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,#f1f5f9_95%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_60%,#050B18_95%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="bg-white/95 dark:bg-[#070E1C]/95 border-b border-slate-200/80 dark:border-blue-500/10 shadow-sm sticky top-0 z-50 backdrop-blur-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 truncate whitespace-nowrap">Học viên LMS</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[120px] sm:max-w-[200px] truncate whitespace-nowrap" title={`Xin chào, ${userName}`}>Xin chào, {userName}</p>
                  </div>
                </div>

                <nav className="hidden lg:flex items-center space-x-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== "/lms/student" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-50"
                          }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    Trang chủ
                  </Link>
                  <button
                    onClick={handleChangeRole}
                    className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium"
                  >
                    Đổi vai trò
                  </button>
                </div>
              </div>

              <nav className="lg:hidden flex items-center space-x-1 pb-3 overflow-x-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== "/lms/student" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <main className="w-full flex-grow flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
