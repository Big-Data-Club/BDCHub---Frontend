"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, Spinner } from "@/components/icons/Icons";
import { validatePassword } from "@/utils/utils";
import ForgotPasswordModal from "./ForgotPasswordModal";
import Mascot from "./Mascot";
import { GoogleLoginButton } from "./GoogleLoginButton";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validatePassword(email, password);
    if (v) return setError(v);

    setLoading(true);
    try {
      const result = await (await import("next-auth/react")).signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Email hoặc mật khẩu không chính xác.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ForgotPasswordModal open={isForgotOpen} onClose={() => setIsForgotOpen(false)} />

      <div className="w-full max-w-md rounded-2xl p-8 mx-auto
                      bg-white/90 dark:bg-[#0F1E35]/80
                      backdrop-blur-xl
                      border border-slate-200 dark:border-blue-500/15
                      shadow-lg dark:shadow-[0_8px_40px_rgba(37,99,235,0.08)]
                      hover:shadow-xl hover:shadow-blue-500/5
                      dark:hover:shadow-[0_12px_50px_rgba(37,99,235,0.12)]
                      dark:hover:border-blue-500/25
                      hover:-translate-y-0.5
                      transition-all duration-300">
        <Mascot isBlindfolded={isPasswordFocused && !showPassword} />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chào mừng trở lại!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Đăng nhập vào hệ thống quản trị BDC</p>
        </div>

        {error && (
          <div className="mb-6 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/30 px-4 py-3 rounded-xl flex items-start gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsPasswordFocused(false)}
              placeholder="nguyenvana@hcmut.edu.vn"
              className="w-full rounded-xl px-4 py-3.5
                         bg-slate-50 dark:bg-[#0D192E]
                         border border-slate-300 dark:border-blue-500/20
                         text-slate-900 dark:text-slate-100
                         placeholder:text-slate-400 dark:placeholder:text-slate-500
                         focus:bg-white dark:focus:bg-[#0A1628]
                         focus:outline-none
                         focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20
                         focus:border-blue-500 dark:focus:border-cyan-400/50
                         transition-all duration-200"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-3.5 pr-12
                         bg-slate-50 dark:bg-[#0D192E]
                         border border-slate-300 dark:border-blue-500/20
                         text-slate-900 dark:text-slate-100
                         placeholder:text-slate-400 dark:placeholder:text-slate-500
                         focus:bg-white dark:focus:bg-[#0A1628]
                         focus:outline-none
                         focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20
                         focus:border-blue-500 dark:focus:border-cyan-400/50
                         transition-all duration-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none active:scale-95"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-blue-500/30 accent-blue-600 cursor-pointer" />
              <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Ghi nhớ đăng nhập</span>
            </label>
            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              className="font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors active:scale-95"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3.5 shadow-sm dark:shadow-blue-900/30 transition-all duration-200 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Spinner /> : "Đăng nhập"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <hr className="border-slate-200 dark:border-blue-500/10" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-3 bg-white/90 dark:bg-[#0F1E35]/80 text-xs text-slate-400 dark:text-slate-500 font-medium">
            hoặc
          </span>
        </div>

        {/* Google Login */}
        <GoogleLoginButton onError={setError} />
      </div>
    </>
  );
}