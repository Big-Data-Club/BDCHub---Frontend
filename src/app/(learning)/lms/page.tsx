"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import lmsService from "@/services/lmsService";
import { useSession } from "next-auth/react";

interface RoleOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

const ROLE_OPTIONS: Record<string, RoleOption> = {
  ADMIN: {
    value: "admin",
    label: "Quản trị viên",
    description: "Quản lý toàn bộ hệ thống LMS, người dùng và khóa học",
    icon: "👑",
  },
  TEACHER: {
    value: "teacher",
    label: "Giảng viên",
    description: "Tạo và quản lý khóa học, bài giảng, đánh giá học viên",
    icon: "📚",
  },
  STUDENT: {
    value: "student",
    label: "Học viên",
    description: "Học tập, làm bài tập và theo dõi tiến độ học tập",
    icon: "🎓",
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 dark:text-slate-300 text-lg">Đang tải vai trò của bạn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">Không có quyền truy cập</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center flex-col sm:flex-row">
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
            >
              Quay lại trang chủ
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-3">
            Chào mừng đến với LMS
          </h1>
          {userName && (
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-2">
              Xin chào, <span className="font-semibold text-slate-900 dark:text-slate-50">{userName}</span>!
            </p>
          )}
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Bạn có <span className="font-semibold text-blue-600 dark:text-blue-400">{userRoles.length}</span> vai trò trong hệ thống. 
            Vui lòng chọn vai trò bạn muốn sử dụng.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {userRoles.map((role) => {
            const option = ROLE_OPTIONS[role];
            if (!option) return null;

            return (
              <button
                key={role}
                onClick={() => selectRole(role)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-left hover:shadow-md dark:hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 group"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {option.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                  {option.label}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 min-h-[3rem]">
                  {option.description}
                </p>
                <div className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl transition-all inline-flex items-center gap-2 font-medium text-sm group-hover:shadow-md">
                  <span>Chọn vai trò</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="text-center space-y-3">
          <button
            onClick={() => router.push("/")}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 font-medium underline underline-offset-4 transition-colors"
          >
            ← Quay lại trang chủ
          </button>
          <div className="text-sm text-slate-500 dark:text-slate-500">
            Bạn có thể thay đổi vai trò bất cứ lúc nào từ menu trong dashboard
          </div>
        </div>
      </div>
    </div>
  );
}