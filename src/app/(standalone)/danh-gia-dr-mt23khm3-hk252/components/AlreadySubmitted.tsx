import React, { useState } from "react";
import { FormData } from "../types";
import { FIn, FL } from "./FormFields";
import { Step4 } from "./Step4";

interface AlreadySubmittedProps {
  onClear: () => void;
}

export function AlreadySubmitted({ onClear }: AlreadySubmittedProps) {
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const handleVerify = () => {
    try {
      const saved = localStorage.getItem("mt23khm3_hk252_submitted_data");
      if (saved) {
        const parsed: FormData = JSON.parse(saved);
        if (parsed.password === passwordInput.trim()) {
          setSubmittedData(parsed);
          setIsAuthenticated(true);
          setError("");
        } else {
          setError("Mật khẩu không chính xác. Vui lòng kiểm tra lại.");
        }
      } else {
        setError("Không tìm thấy dữ liệu đã nộp. Vui lòng tạo bản nộp mới.");
      }
    } catch {
      setError("Có lỗi xảy ra khi đọc dữ liệu cũ.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isAuthenticated && submittedData) {

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-0.5">
              Bản tự đánh giá đã nộp
            </h2>
            <p className="text-slate-500 dark:text-slate-450 text-xs">
              Xem lại toàn bộ thông tin bạn đã gửi cho ban cán sự lớp.
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In / Xuất PDF
            </button>
            <button
              onClick={onClear}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa lịch sử nộp
            </button>
          </div>
        </div>

        {/* Read-only Review step */}
        <Step4 data={submittedData} onEditStep={() => {}} />

        <div className="text-center pt-4">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Quay lại cổng tra cứu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-8 space-y-6">
      <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-950/10 border-2 border-cyan-500 flex items-center justify-center mx-auto shadow-md">
        <svg className="w-8 h-8 text-cyan-650 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Bạn đã nộp biểu mẫu rèn luyện
        </h2>
        <p className="text-slate-555 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
          Trình duyệt này ghi nhận bạn đã nộp đánh giá rèn luyện HK252. Vui lòng nhập mật khẩu bạn đã thiết lập lúc nộp để kiểm tra lại hoặc in bản minh chứng.
        </p>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-5 space-y-4 shadow-inner-sm text-left">
        <div>
          <FL req>Nhập mật khẩu submission của bạn</FL>
          <FIn
            type="password"
            placeholder="Nhập từ 8 đến 12 ký tự"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            error={error}
            maxLength={12}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleVerify();
            }}
          />
        </div>

        <button
          onClick={handleVerify}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-cyan-900/10 dark:shadow-cyan-950/20"
        >
          Xác thực & Xem lại
        </button>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-850/30">
        <button
          onClick={onClear}
          className="text-red-500 hover:text-red-650 dark:text-red-400 dark:hover:text-red-300 text-xs font-bold transition-colors"
        >
          Xóa lịch sử nộp trên trình duyệt này
        </button>
      </div>
    </div>
  );
}
