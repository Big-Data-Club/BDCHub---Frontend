"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { KeyRound, AlertCircle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { userService } from "@/services/userService";

interface ConfirmPasswordFormProps {
  token: string;
  /** "change" = đổi mật khẩu qua profile | "reset" = quên mật khẩu */
  type?: "change" | "reset";
}

const validatePassword = (password: string): string | null => {
  if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số.";
  }
  return null;
};

export default function ConfirmPasswordForm({ token, type = "change" }: ConfirmPasswordFormProps) {
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isReset = type === "reset";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      return setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      return setMessage({ type: "error", text: passwordError });
    }

    setLoading(true);
    try {
      const endpoint = isReset
        ? userService.resetPassword({ token, newPassword: formData.newPassword })
        : userService.confirmPasswordChange({ token, newPassword: formData.newPassword });

      const response = await endpoint;
      setSuccess(true);
      setMessage({
        type: "success",
        text: response.message || (isReset
          ? "Đặt lại mật khẩu thành công!"
          : "Đổi mật khẩu thành công!"),
      });

      // Sign out and redirect to login after 2s
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "Có lỗi xảy ra. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl p-8 mx-auto
                    bg-white/90 dark:bg-[#0F1E35]/80
                    backdrop-blur-xl
                    border border-slate-200 dark:border-blue-500/15
                    shadow-lg dark:shadow-[0_8px_40px_rgba(37,99,235,0.08)]
                    transition-all duration-300">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
          {isReset
            ? <RotateCcw className="w-8 h-8 text-blue-600 dark:text-cyan-400" />
            : <KeyRound className="w-8 h-8 text-blue-600 dark:text-cyan-400" />
          }
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {isReset ? "Đặt lại mật khẩu" : "Đổi mật khẩu mới"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isReset
            ? "Thiết lập mật khẩu mới cho tài khoản của bạn."
            : "Vui lòng thiết lập mật khẩu mới cho tài khoản của bạn."}
        </p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl flex items-start gap-3 text-sm font-medium border ${
          message.type === "success"
            ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30"
            : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30"
        }`}>
          {message.type === "success"
            ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          }
          <p>{message.text}</p>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu mới</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              disabled={loading}
              placeholder="Nhập mật khẩu mới"
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              * Tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              disabled={loading}
              placeholder="Nhập lại mật khẩu mới"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3.5 shadow-sm dark:shadow-blue-900/30 transition-all duration-200 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Đang cập nhật...</>
            ) : (
              isReset ? "Đặt lại mật khẩu" : "Xác nhận thay đổi"
            )}
          </button>
        </form>
      )}

      {success && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
          Đang chuyển hướng về trang đăng nhập...
        </p>
      )}
    </div>
  );
}