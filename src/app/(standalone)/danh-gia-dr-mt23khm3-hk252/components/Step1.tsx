import React from "react";
import { FormData, Errors } from "../types";
import { FL, FIn } from "./FormFields";

interface Step1Props {
  data: FormData;
  errors: Errors;
  onChange: (field: keyof FormData, val: string) => void;
}

export function Step1({ data, errors, onChange }: Step1Props) {
  // Automatically concatenate Họ lót & Tên when either changes
  const handleLastNameChange = (val: string) => {
    onChange("lastName", val);
    const combined = `${val.trim()} ${data.firstName.trim()}`.trim();
    onChange("fullName", combined);
  };

  const handleFirstNameChange = (val: string) => {
    onChange("firstName", val);
    const combined = `${data.lastName.trim()} ${val.trim()}`.trim();
    onChange("fullName", combined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          Thông tin sinh viên
        </h2>
        <p className="text-slate-500 dark:text-slate-450 text-sm">
          Vui lòng cung cấp chính xác các thông tin cơ bản để ban cán sự lớp đối chiếu với danh sách sinh viên.
        </p>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-5 space-y-4 shadow-inner-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FL req>Họ và Tên lót</FL>
            <FIn
              type="text"
              placeholder="VD: Nguyễn Văn"
              value={data.lastName}
              onChange={(e) => handleLastNameChange(e.target.value)}
              error={errors.lastName}
            />
          </div>
          <div>
            <FL req>Tên</FL>
            <FIn
              type="text"
              placeholder="VD: A"
              value={data.firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              error={errors.firstName}
            />
          </div>
        </div>

        <div>
          <FL>Họ và Tên đầy đủ (Tự động)</FL>
          <FIn
            type="text"
            readOnly
            disabled
            className="w-full rounded-xl px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-450 cursor-not-allowed select-none"
            value={data.fullName}
            placeholder="Họ và tên đầy đủ hiển thị tại đây"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FL req>Mã số sinh viên (MSSV)</FL>
            <FIn
              type="text"
              placeholder="VD: 2319999"
              value={data.studentId}
              onChange={(e) => onChange("studentId", e.target.value)}
              error={errors.studentId}
            />
          </div>
          <div>
            <FL req>Email sinh viên (@hcmut.edu.vn)</FL>
            <FIn
              type="email"
              placeholder="VD: ten.hokey@hcmut.edu.vn"
              value={data.email}
              onChange={(e) => onChange("email", e.target.value)}
              error={errors.email}
            />
          </div>
        </div>
      </div>

      <div className="border border-cyan-500/20 dark:border-cyan-400/20 bg-cyan-50/10 dark:bg-cyan-950/5 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.028M12 20.25a8.25 8.25 0 110-16.5 8.25 8.25 0 010 16.5z" />
          </svg>
          <span className="font-bold text-sm">Hướng dẫn tự đánh giá</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
          Căn cứ vào điều 16, quyết định số 925/QĐ-ĐHBK-CTCT-SV, ban cán sự lớp MT23KHM3 đưa ra thang điểm để sinh viên tự đánh giá kết quả rèn luyện học kỳ HK252.
        </p>
        <ul className="list-disc pl-4 text-xs text-slate-550 dark:text-slate-400 space-y-1">
          <li>Sinh viên điền điểm tự đánh giá cho mỗi mục.</li>
          <li>Đối với các mục đạt trên <strong>90% điểm tối đa</strong>, hệ thống yêu cầu nộp minh chứng (File PDF hoặc hình ảnh chứng nhận) để BCS lớp phê duyệt.</li>
          <li>Vui lòng kiểm tra kỹ tất cả thông tin trước khi chuyển sang bước tiếp theo.</li>
        </ul>
      </div>
    </div>
  );
}
