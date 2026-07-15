"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import lmsService from "@/services/lmsService";
import { useSession } from "next-auth/react";
import { Shield, BookOpen, GraduationCap, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import bdcLogo from "@/assets/bdclogo.png";

import { RoleSelectionCard } from "@/components/lms/RoleSelectionCard";
import { GridBackground } from "@/components/lms/shared";

interface RoleOption {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

const ROLE_OPTIONS: Record<string, RoleOption> = {
  ADMIN: {
    value: "admin",
    label: "Quản trị viên",
    description: "Quản lý toàn bộ hệ thống, phân quyền và cấu hình các thông số LMS.",
    icon: Shield,
    features: ["Quản lý người dùng", "Thiết lập hệ thống", "Xem báo cáo tổng quan"],
  },
  TEACHER: {
    value: "teacher",
    label: "Giảng viên",
    description: "Thiết kế các khóa học, quản lý bài giảng và đánh giá kết quả học tập.",
    icon: BookOpen,
    features: ["Quản lý bài giảng & khóa học", "Tạo câu hỏi & quiz bằng AI", "Theo dõi & đánh giá kết quả"],
  },
  STUDENT: {
    value: "student",
    label: "Học viên",
    description: "Tham gia các khóa học, hoàn thành bài tập và theo dõi tiến độ học tập.",
    icon: GraduationCap,
    features: ["Khám phá & tham gia khóa học", "Học tập cùng Trợ lý AI Mentor", "Luyện tập trắc nghiệm & đề thi"],
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
      {/* Reusable Grid Background */}
      <GridBackground gridOpacity="opacity-80 dark:opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(248,250,252,0.7)_80%,#f8fafc_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,11,24,0.7)_80%,#050B18_100%)] pointer-events-none" />
      </GridBackground>

      <div className="relative max-w-5xl w-full z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-6">
            <Image src={bdcLogo} alt="BDC Logo" className="object-contain" width={56} height={56} priority />
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-white mb-2">
            Hệ thống học tập <span className="font-extrabold text-slate-950 dark:text-slate-50">BD<span className="text-blue-600 dark:text-cyan-400">Course</span></span>
          </h1>
          {userName && (
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              Xin chào, <span className="font-bold text-blue-600 dark:text-cyan-400">{userName}</span>!
            </p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
            Chọn một trong <span className="font-semibold text-blue-600 dark:text-cyan-400">{userRoles.length} vai trò</span> dưới đây để tiếp tục.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {userRoles.map((role) => {
            const option = ROLE_OPTIONS[role];
            if (!option) return null;

            return (
              <RoleSelectionCard
                key={role}
                role={role}
                label={option.label}
                description={option.description}
                icon={option.icon}
                features={option.features}
                onSelect={selectRole}
              />
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