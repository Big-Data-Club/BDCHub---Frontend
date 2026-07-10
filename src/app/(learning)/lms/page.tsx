"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import lmsService from "@/services/lmsService";
import { useSession } from "next-auth/react";
import { Shield, BookOpen, GraduationCap, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";

interface RoleOption {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_OPTIONS: Record<string, RoleOption> = {
  ADMIN: {
    value: "admin",
    label: "Quản trị viên",
    description: "Quản lý toàn bộ hệ thống LMS, người dùng và khóa học",
    icon: Shield,
  },
  TEACHER: {
    value: "teacher",
    label: "Giảng viên",
    description: "Tạo và quản lý khóa học, bài giảng, đánh giá học viên",
    icon: BookOpen,
  },
  STUDENT: {
    value: "student",
    label: "Học viên",
    description: "Học tập, làm bài tập và theo dõi tiến độ học tập",
    icon: GraduationCap,
  },
};

export default function LMSRoleSelection() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserRoles();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchUserRoles = async () => {
    try {
      const data = await lmsService.getMyRoles();
      const roles = data || [];

      if (roles.length === 0) {
        setError("Bạn chưa được cấp quyền sử dụng LMS. Vui lòng liên hệ quản trị viên.");
        setLoading(false);
        return;
      }

      if (roles.length === 1) {
        selectRole(roles[0]);
        return;
      }

      setUserRoles(roles);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải vai trò");
      setLoading(false);
    }
  };

  const selectRole = (role: string) => {
    sessionStorage.setItem("lms_selected_role", role);
    sessionStorage.setItem("lms_role_selected_at", new Date().toISOString());
    router.push(`/lms/${role.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#050B18]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Đang tải vai trò của bạn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#050B18] p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/10 shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Không thể truy cập LMS</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold active:scale-95 text-sm shadow-sm"
            >
              Quay lại trang chủ
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="px-5 py-2.5 bg-slate-100 dark:bg-blue-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-blue-900/30 rounded-xl hover:bg-slate-200 dark:hover:bg-blue-900/20 transition-all font-semibold active:scale-95 text-sm"
            >
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#050B18] flex items-center justify-center p-4 overflow-hidden transition-colors duration-300">
      {/* Glow ambient background spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Moving Grid Background */}
      <div className="absolute -inset-32 bg-grid-paper pointer-events-none opacity-80 dark:opacity-60 rotate-[10deg] animate-grid-slide" />
      
      {/* Soft overlay gradients to fade out the grid smoothly */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-15% via-transparent via-85% to-slate-50 dark:from-[#050B18] dark:via-15% dark:via-transparent dark:via-85% dark:to-[#050B18] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-15% via-transparent via-85% to-slate-50 dark:from-[#050B18] dark:via-15% dark:via-transparent dark:via-85% dark:to-[#050B18] pointer-events-none" />

      <div className="relative max-w-5xl w-full z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 rounded-2xl mb-6 shadow-sm">
            <GraduationCap className="w-7 h-7 text-blue-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Hệ thống học tập LMS
          </h1>
          {userName && (
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              Xin chào, <span className="font-bold text-blue-600 dark:text-cyan-400">{userName}</span>!
            </p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Tài khoản của bạn có <span className="font-semibold text-blue-600 dark:text-cyan-400">{userRoles.length} vai trò</span> trong hệ thống. Vui lòng chọn vai trò để tiếp tục.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {userRoles.map((role) => {
            const option = ROLE_OPTIONS[role];
            if (!option) return null;
            const Icon = option.icon;

            return (
              <div key={role} className="relative group">
                {/* Underlay / Offset Solid Background */}
                <div className="absolute inset-0 bg-blue-600 dark:bg-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 translate-y-0 group-hover:translate-x-1.5 group-hover:translate-y-1.5" />

                {/* Main Interactive Card */}
                <button
                  onClick={() => selectRole(role)}
                  className="relative w-full h-full flex flex-col items-start bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl p-8 text-left transition-all duration-300 transform translate-x-0 translate-y-0 group-hover:-translate-x-1 group-hover:-translate-y-1 hover:border-blue-500/40 dark:hover:border-cyan-400/30 dark:hover:bg-[#12223a] dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 z-10"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-cyan-400 mb-6 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950 transition-all duration-300 border border-transparent dark:border-cyan-500/10">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {option.label}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                    {option.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 mt-auto group-hover:gap-2.5 transition-all">
                    <span>Chọn vai trò này</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="text-center space-y-3">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors group font-semibold"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại trang chủ</span>
          </button>
          <div className="text-xs text-slate-500 dark:text-slate-500">
            Bạn có thể thay đổi vai trò bất cứ lúc nào từ menu trong dashboard
          </div>
        </div>
      </div>
    </div>
  );
}