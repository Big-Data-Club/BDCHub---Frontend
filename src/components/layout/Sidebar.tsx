"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { sidebarSections, LogoIcon } from "@/constants";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user/UserAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronsLeft, ChevronsRight, LogOut, Sun, Moon, Settings } from "lucide-react";
import { useUser } from "@/store/UserContext";
import { useNotifications } from "@/store/NotificationContext";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import SafeImage from "../common/SafeImage";
import lmsService from "@/services/lmsService";
import { logout } from "@/services/logout";
import { GhostBtn } from "@/components/lms/shared/Button";

const MIN_WIDTH = 64;
const MAX_WIDTH = 280;
const DEFAULT_WIDTH = 240;

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useUser();
  const { unreadAlertsCount, unreadChatCount } = useNotifications();
  const { isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [width, setWidth] = useState(MIN_WIDTH);
  const prevWidthRef = useRef(DEFAULT_WIDTH);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const [lmsRoles, setLmsRoles] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    if (user) {
      lmsService.getMyRoles()
        .then(roles => {
          if (roles) setLmsRoles(roles);
        })
        .catch(err => console.error("Error fetching LMS roles for Sidebar:", err));
    }
  }, [user]);

  const toggleSidebar = () => {
    if (!isCollapsed) {
      prevWidthRef.current = width;
      setWidth(MIN_WIDTH);
      setIsCollapsed(true);
    } else {
      const restore = Math.max(prevWidthRef.current, DEFAULT_WIDTH);
      setWidth(Math.min(restore, MAX_WIDTH));
      setIsCollapsed(false);
    }
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!resizeRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const next = Math.min(Math.max(resizeRef.current.startWidth + clientX - resizeRef.current.startX, MIN_WIDTH), MAX_WIDTH);
      setWidth(next);
      setIsCollapsed(next <= MIN_WIDTH + 4);
    };
    const onUp = () => {
      if (resizeRef.current) prevWidthRef.current = width;
      resizeRef.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [width]);

  const onResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    resizeRef.current = { startX: clientX, startWidth: width };
    document.body.style.userSelect = "none";
  };

  const handleLogout = async () => {
    setUser(null);
    await logout();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        style={{ width }}
        className="group relative hidden md:flex flex-col h-screen flex-shrink-0
                   bg-white dark:bg-[#070E1C]
                   border-r border-slate-200 dark:border-blue-500/10
                   transition-[width] duration-200 ease-in-out z-20"
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-2.5 px-4 py-5 border-b border-slate-200 dark:border-blue-500/10", isCollapsed && "justify-center px-2")}>
          <SafeImage src={LogoIcon} alt="BDC" width={48} height={48} priority className="flex-shrink-0" />
          {!isCollapsed && (
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50 leading-tight">Big Data Club</p>
            </div>
          )}
        </div>

        {/* User */}
        <div className={cn("px-3 py-3 border-b border-slate-200 dark:border-blue-500/10", isCollapsed && "px-2")}>
          <Link
            href="/myaccount"
            className={cn(
              "flex items-center gap-3 rounded-xl p-2 transition-colors duration-200",
              "hover:bg-slate-100 dark:hover:bg-[#162644]",
              isCollapsed && "justify-center"
            )}
          >
            <UserAvatar
              name={user?.name}
              src={mounted ? user?.profilePicture : undefined}
              className="h-8 w-8"
              fallbackClassName="text-xs"
            />
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.name || "Guest"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user?.role?.replace("ROLE_", "") || "Member"}</p>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-4">
          {sidebarSections
            .map((section) => {
              const filteredLinks = section.links.filter((link) => {
                if (isAdmin) return true;
                
                const selectedRole = typeof window !== "undefined" ? sessionStorage.getItem("lms_selected_role") : null;
                const isTeacher = user?.role === "ROLE_TEACHER" || user?.role === "ROLE_MANAGER" || lmsRoles.includes("TEACHER") || selectedRole === "TEACHER";
                
                if (link.label === "Hướng dẫn Học viên") {
                  return true;
                }
                if (link.label === "Hướng dẫn Giảng viên") {
                  return isTeacher;
                }
                return (
                  link.label === "BDCourse" ||
                  link.label === "Virtual Lab" ||
                  link.label === "Chat" ||
                  link.label === "Data Hackathon" ||
                  link.label === "HCMUT HPC School"
                );
              });
              return { ...section, links: filteredLinks };
            })
            .filter((section) => section.links.length > 0)
            .map((section, i) => (
            <div key={section.title}>
              {i > 0 && <div className="border-t border-slate-200 dark:border-blue-500/10 mb-3" />}
              {!isCollapsed && (
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-3 mb-1.5">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.links.map((link) => {
                  const isActive = pathname === link.route;
                  const Icon = link.icon;
                  const isExternal = link.route.startsWith("http");
                  const hasBadge = link.route === "/lms" && unreadAlertsCount > 0;
                  const hasChatBadge = link.label === "Chat" && unreadChatCount > 0;
                  const item = (
                    <Link
                      href={link.route}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#162644] hover:text-slate-900 dark:hover:text-slate-100",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <div className="relative">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {isCollapsed && (hasBadge || hasChatBadge) && (
                          <span className="absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white dark:ring-slate-900 animate-pulse" />
                        )}
                      </div>
                      {!isCollapsed && (
                        <>
                          {link.label === "BDCourse" ? (
                            <span>
                              BD<span className={cn(isActive ? "text-white" : "text-blue-600 dark:text-cyan-400")}>Course</span>
                            </span>
                          ) : (
                            <span>{link.label}</span>
                          )}
                          {hasBadge && (
                            <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs scale-90 font-bold text-white leading-none">
                              {unreadAlertsCount > 9 ? "9+" : unreadAlertsCount}
                            </span>
                          )}
                          {hasChatBadge && (
                            <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs scale-90 font-bold text-white leading-none animate-pulse">
                              {unreadChatCount > 9 ? "9+" : unreadChatCount}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                  return (
                    <li key={link.route}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{item}</TooltipTrigger>
                          <TooltipContent side="right">{link.label}</TooltipContent>
                        </Tooltip>
                      ) : item}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-slate-200 dark:border-blue-500/10 p-2 space-y-0.5">
          {isAdmin && (
            <Link
              href="/settings"
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                pathname.startsWith("/settings")
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#162644] hover:text-slate-900 dark:hover:text-slate-100",
                isCollapsed && "justify-center"
              )}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && "Settings"}
            </Link>
          )}

          <GhostBtn
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium justify-start h-auto",
              "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#162644] hover:text-slate-900 dark:hover:text-slate-100",
              isCollapsed && "justify-center px-0"
            )}
          >
            {mounted && (theme === "dark" ? <Sun className="h-4 w-4 flex-shrink-0" /> : <Moon className="h-4 w-4 flex-shrink-0" />)}
            {!isCollapsed && mounted && (theme === "dark" ? "Light mode" : "Dark mode")}
          </GhostBtn>

          <GhostBtn
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium justify-start h-auto",
              "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && "Logout"}
          </GhostBtn>

          <GhostBtn
            onClick={toggleSidebar}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium justify-start h-auto",
              "text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-[#162644]",
              isCollapsed && "justify-center px-0"
            )}
          >
            {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /><span>Collapse</span></>}
          </GhostBtn>
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={onResizeStart}
          onTouchStart={onResizeStart}
          className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     hover:bg-blue-500/20"
          aria-hidden
        />
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
