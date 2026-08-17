"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function InvalidTokenCard() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md rounded-2xl p-8 mx-auto text-center
                    bg-white/90 dark:bg-[#0F1E35]/80
                    backdrop-blur-xl
                    border border-slate-200 dark:border-blue-500/15
                    shadow-lg dark:shadow-[0_8px_40px_rgba(37,99,235,0.08)]
                    transition-all duration-300">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert className="w-8 h-8 text-red-500 dark:text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        Phiên bản không hợp lệ
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        Đường dẫn đổi mật khẩu của bạn không chính xác hoặc đã hết hạn. Vui lòng yêu cầu cấp lại từ trang cài đặt.
      </p>
      <button
        onClick={() => router.push("/settings")}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3.5 shadow-sm dark:shadow-blue-900/30 transition-all duration-200 active:scale-95"
      >
        Quay lại trang cài đặt
      </button>
    </div>
  );
}