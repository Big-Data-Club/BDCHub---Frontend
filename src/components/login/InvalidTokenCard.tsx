"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function InvalidTokenCard() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mx-auto text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-3">
        Phiên bản không hợp lệ
      </h2>
      <p className="text-slate-600 mb-8 leading-relaxed">
        Đường dẫn đổi mật khẩu của bạn không chính xác hoặc đã hết hạn. Vui lòng yêu cầu cấp lại từ trang cài đặt.
      </p>
      <button
        onClick={() => router.push("/settings")}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl px-6 py-3.5 shadow-sm transition-all active:scale-95"
      >
        Quay lại trang cài đặt
      </button>
    </div>
  );
}