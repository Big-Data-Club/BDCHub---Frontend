"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationPopover } from "@/components/lms/notifications/NotificationPopover";
import { SecondaryBtn, GhostBtn } from "@/components/lms/shared/Button";

interface NavItem {
  href: string;
  label: string;
}

interface LmsHeaderProps {
  roleTitle: string;
  navItems: NavItem[];
  userName?: string;
  handleChangeRole: () => void;
  basePath: string;
}

export function LmsHeader({
  roleTitle,
  navItems,
  userName,
  handleChangeRole,
  basePath,
}: LmsHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="bg-white dark:bg-[#070E1C] border-b border-slate-200/80 dark:border-blue-500/12 shadow-sm sticky top-0 z-40 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
              {roleTitle}
            </span>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== basePath && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-250 ${isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-cyan-400 font-bold border border-blue-100 dark:border-blue-500/15"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {typeof userName === "string" && userName.trim().length > 0 && (
              <span className="hidden md:inline-block text-xs text-slate-500 dark:text-slate-400 max-w-[120px] truncate" title={`Xin chào, ${userName}`}>
                Xin chào, <strong className="font-semibold text-slate-700 dark:text-slate-200">{userName.split(" ").pop()}</strong>
              </span>
            )}
            <ThemeToggle />
            <div className="h-4 w-px bg-slate-200 dark:bg-blue-500/15 hidden sm:block" />
            <GhostBtn
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/">Trang chủ</Link>
            </GhostBtn>
            <SecondaryBtn
              size="sm"
              onClick={handleChangeRole}
              className="text-blue-600 dark:text-cyan-400 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-500/20"
            >
              Đổi vai trò
            </SecondaryBtn>
            <NotificationPopover />
          </div>
        </div>

        <nav className="lg:hidden flex items-center space-x-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== basePath && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-cyan-400 font-bold border border-blue-100 dark:border-blue-500/15"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
