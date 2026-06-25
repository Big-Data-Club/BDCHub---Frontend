import React, { useState } from "react";
import { FormData, Errors } from "../types";
import { FL, FIn, FTa } from "./FormFields";

interface Step3Props {
  data: FormData;
  errors: Errors;
  onChange: (field: keyof FormData, val: string) => void;
  onToggleAgree: () => void;
}

export function Step3({ data, errors, onChange, onToggleAgree }: Step3Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          Hoàn thành tự đánh giá
        </h2>
        <p className="text-slate-500 dark:text-slate-450 text-sm">
          Thêm ý kiến thắc mắc, cam kết thông tin và đặt mật khẩu bảo mật cho dữ liệu tự đánh giá của bạn.
        </p>
      </div>

      {/* Inquiry */}
      <div>
        <FL>Thắc mắc hoặc Ý kiến của sinh viên (nếu có)</FL>
        <p className="text-xs text-slate-500 dark:text-slate-450 mb-1.5 font-medium">
          Mọi thắc mắc vui lòng điền ở đây, hoặc liên hệ cho ban cán sự lớp. Chúng tôi sẽ trả lời ngay khi có thể.
        </p>
        <FTa
          placeholder="Nhập ý kiến hoặc câu hỏi của bạn tại đây..."
          value={data.inquiry}
          onChange={(e) => onChange("inquiry", e.target.value)}
          error={errors.inquiry}
          rows={4}
        />
      </div>

      {/* Password Setup */}
      <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-5 space-y-4 shadow-inner-sm">
        <div>
          <FL req>Đặt mật khẩu cho submission (từ 8-12 ký tự)</FL>
          <p className="text-xs text-slate-500 dark:text-slate-450 mb-2 font-medium">
            Mật khẩu này dùng để bạn đăng nhập xem lại hoặc sửa đổi submission tự đánh giá sau này.
          </p>
          <div className="relative">
            <FIn
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu (8-12 ký tự)"
              value={data.password}
              onChange={(e) => onChange("password", e.target.value)}
              error={errors.password}
              maxLength={12}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-450 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-350 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="group">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={data.agreeTruth}
            onChange={onToggleAgree}
            className="mt-1 w-4.5 h-4.5 rounded-lg border-slate-300 text-cyan-600 focus:ring-cyan-500/20 transition-all cursor-pointer"
          />
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-205 transition-colors">
              Tôi cam đoan mọi thông tin khai báo đều là đúng sự thật. <span className="text-cyan-600 dark:text-cyan-400 font-bold">*</span>
            </p>
            <p className="text-xs text-slate-450 dark:text-slate-450 leading-relaxed font-medium">
              Bạn tự chịu mọi trách nhiệm với kết quả đánh giá và minh chứng của chính mình trước Ban chủ nhiệm Khoa và Nhà trường.
            </p>
          </div>
        </label>
        {errors.agreeTruth && (
          <p className="mt-2 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-fadeIn pl-7">
            ⚠ {errors.agreeTruth}
          </p>
        )}
      </div>
    </div>
  );
}
