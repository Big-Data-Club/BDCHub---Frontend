import React from "react";
import { Logo } from "@/components/layout/Logo";
import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-row items-center justify-center gap-4">
        <Logo />
        <div className="flex flex-col items-start">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            BDC Hub
          </h2>
          <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">
            Think Big • Speak Data
          </p>
        </div>
      </div>

      <div className="w-full max-w-md rounded-2xl p-8 mx-auto text-center
                      bg-white/90 dark:bg-[#0F1E35]/80
                      backdrop-blur-xl
                      border border-slate-200 dark:border-blue-500/15
                      shadow-lg dark:shadow-[0_8px_40px_rgba(37,99,235,0.08)]
                      transition-all duration-300">
        {/* Clock icon */}
        <div className="mx-auto w-16 h-16 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/30 rounded-full flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Chờ duyệt tài khoản
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
          Đăng ký thành công! Tài khoản của bạn đang chờ admin duyệt.
          Bạn sẽ nhận được email thông báo khi tài khoản được kích hoạt.
        </p>

        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700 dark:text-cyan-400 font-medium">
            📧 Hãy kiểm tra email khi admin duyệt tài khoản. Email sẽ kèm mật khẩu để đăng nhập.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 font-semibold text-sm transition-colors active:scale-95"
        >
          ← Quay lại trang đăng nhập
        </Link>
      </div>
    </div>
  );
}
