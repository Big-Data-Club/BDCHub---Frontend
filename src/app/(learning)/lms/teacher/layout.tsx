"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LmsHeader } from "@/components/layout/LmsHeader";
import lmsService from "@/services/lmsService";
import { activateLmsRole, hasLmsRole } from "@/lib/lms-navigation";
import { cn } from "@/lib/utils";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || "";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const openTeacherRoute = async () => {
      const selectedRole = sessionStorage.getItem("lms_selected_role");
      if (selectedRole === "TEACHER" || selectedRole === "ADMIN") {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const roles = await lmsService.getMyRoles();
        const role = hasLmsRole(roles, "TEACHER") ? "TEACHER" : hasLmsRole(roles, "ADMIN") ? "ADMIN" : null;
        if (role) {
          activateLmsRole(role);
          if (!cancelled) setLoading(false);
          return;
        }
      } catch {
        // Fall through to the role-selection/access-error view.
      }
      if (!cancelled) router.replace("/lms");
    };
    void openTeacherRoute();
    return () => { cancelled = true; };
  }, [router]);

  const handleChangeRole = () => {
    sessionStorage.removeItem("lms_selected_role");
    router.push("/lms");
  };

  const navItems = [
    { href: "/lms/teacher", label: "Dashboard" },
    { href: "/lms/teacher/courses", label: "Khóa học" },
    { href: "/lms/teacher/ai-assistant", label: "AI Assistant" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#050B18]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isFullHeightPage = pathname.includes("/ai-assistant");

  return (
    <>
      <div className={cn("relative bg-slate-100/80 dark:bg-[#050B18] transition-colors duration-300", isFullHeightPage ? "h-screen overflow-hidden" : "min-h-screen overflow-clip")}>
        
        {/* Glow ambient background spots */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Smooth radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,#f1f5f9_95%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_60%,#050B18_95%)] pointer-events-none" />

        <div className={cn("relative z-10 flex flex-col", isFullHeightPage ? "h-screen overflow-hidden" : "min-h-screen")}>
          <LmsHeader
            roleTitle="Giảng viên LMS"
            navItems={navItems}
            userName={userName}
            handleChangeRole={handleChangeRole}
            basePath="/lms/teacher"
          />

          <main className={cn("w-full flex-col", isFullHeightPage ? "flex-1 min-h-0 overflow-hidden flex" : "flex-grow flex")}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
