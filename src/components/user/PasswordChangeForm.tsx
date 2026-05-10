"use client";

import { useState } from "react";
import { userService } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordChangeForm() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    
    if (!hasUpper || !hasLower || !hasDigit) {
      return "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "Mật khẩu xác nhận không khớp!",
      });
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setMessage({
        type: "error",
        text: passwordError,
      });
      return;
    }

    if (!user?.email) {
      setMessage({
        type: "error",
        text: "Không tìm thấy thông tin người dùng",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await userService.requestPasswordChange({
        email: user.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMessage({
        type: "success",
        text: response.message,
      });

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Đổi mật khẩu
      </h2>
      
      {message && (
        <div
          className={`mb-4 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Nhập mật khẩu hiện tại"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200"
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Nhập mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200"
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200"
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 active:scale-95 ${
            loading
              ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang xử lý..." : "Gửi yêu cầu đổi mật khẩu"}
        </button>

        <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
            <strong>📧 Lưu ý:</strong> Sau khi gửi yêu cầu, bạn sẽ nhận được email xác nhận. 
            Vui lòng click vào link trong email để hoàn tất việc đổi mật khẩu.
          </p>
        </div>
      </form>
    </div>
  );
}