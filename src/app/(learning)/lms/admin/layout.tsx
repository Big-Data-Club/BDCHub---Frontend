"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LmsHeader } from "@/components/layout/LmsHeader";
import lmsService from "@/services/lms/lmsService";
import { activateLmsRole, clearLmsRoleSession, hasLmsRole } from "@/lib/lms-navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || "";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const openAdminRoute = async () => {
      if (sessionStorage.getItem("lms_selected_role") === "ADMIN") {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const roles = await lmsService.getMyRoles();
        if (hasLmsRole(roles, "ADMIN")) {
          activateLmsRole("ADMIN");
          if (!cancelled) setLoading(false);
          return;
        }
      } catch {
        // Fall through to the role-selection/access-error view.
      }
      if (!cancelled) router.replace("/lms");
    };
    void openAdminRoute();
    return () => { cancelled = true; };
  }, [router]);

  const handleChangeRole = () => {
    clearLmsRoleSession();
    router.push("/lms?select=true");
  };

  const navItems = [
    { href: "/lms/admin", label: "Dashboard" },
    { href: "/lms/admin/organizations", label: "Organizations" },
    { href: "/lms/admin/competencies", label: "Khung năng lực" },
    { href: "/lms/admin/youtube-manage", label: "Quản lý video" },
    { href: "/lms/admin/llm-config", label: "Cấu hình LLM" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#050B18]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-[#050B18] transition-colors duration-300">
      <LmsHeader
        roleTitle="Admin LMS"
        navItems={navItems}
        userName={userName}
        handleChangeRole={handleChangeRole}
        basePath="/lms/admin"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
