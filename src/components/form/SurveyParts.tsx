"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

export const SurveyHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/10 shadow-sm dark:shadow-none p-8 mb-8 text-center sm:text-left">
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">{title}</h1>
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{description}</p>
    <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-[#0A1628] px-3 py-1.5 rounded-lg border border-slate-100 dark:border-blue-500/15">
      <span className="text-red-500 dark:text-red-400">*</span> Câu hỏi bắt buộc
    </div>
  </div>
);

export const SurveyProgress = ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => {
  if (totalPages <= 1) return null;
  const progress = ((currentPage + 1) / totalPages) * 100;

  return (
    <div className="bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/10 shadow-sm dark:shadow-none p-6 mb-8">
      <div className="flex justify-between items-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
        <span>Tiến độ</span>
        <span>Trang {currentPage + 1} / {totalPages}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-[#0A1628] rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-blue-600 dark:bg-gradient-to-r dark:from-blue-500 dark:to-cyan-400 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export const SurveyFooter = () => (
  <div className="text-center mt-12 pb-8 text-sm text-slate-400 dark:text-slate-500 font-medium">
    <p>Dữ liệu được mã hóa và bảo mật tuyệt đối bởi hệ thống</p>
    <p className="mt-1">© {new Date().getFullYear()} BDC Platform • Chuyên nghiệp &amp; Tận tâm</p>
  </div>
);

export const SurveySuccess = ({ 
  formData, 
  hasSubmitted, 
  handleReset 
}: { 
  formData: any; 
  hasSubmitted: boolean; 
  handleReset: () => void; 
}) => {
  const isRegistration = formData.formType === 'registration';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-[#0F1E35] rounded-3xl border border-slate-200 dark:border-blue-500/10 shadow-sm dark:shadow-none p-10 text-center">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 border border-transparent dark:border-green-500/15">✓</div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          {formData.thankYouMessage || 'Cảm ơn bạn!'}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          {hasSubmitted && !formData.allowMultipleSubmissions 
            ? (isRegistration 
                ? 'Bạn đã nộp đơn đăng ký trước đó. Thông tin của bạn đã được ghi nhận.'
                : 'Bạn đã hoàn thành khảo sát này trước đó. Thông tin của bạn đã được ghi nhận.')
            : (isRegistration
                ? 'Đơn đăng ký của bạn đã được lưu trữ an toàn trên hệ thống.'
                : 'Câu trả lời của bạn đã được lưu trữ an toàn trên hệ thống.')}
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 text-left border border-blue-200 dark:border-blue-500/15 mb-8">
          <p className="font-semibold text-slate-900 dark:text-white mb-2">
            {isRegistration ? '📋 Các bước tiếp theo:' : '📊 Thông tin sẽ được sử dụng để:'}
          </p>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
            {isRegistration ? (
              <>
                <li>Ban tổ chức sẽ xem xét đơn đăng ký của bạn</li>
                <li>Kết quả sẽ được thông báo qua email trong 3-5 ngày</li>
                <li>Theo dõi fanpage Big Data Club để cập nhật thông tin</li>
              </>
            ) : (
              <>
                <li>Xác định lộ trình phát triển tính năng</li>
                <li>Phân tích nhu cầu theo nhóm đối tượng</li>
                <li>Cải thiện trải nghiệm học tập số</li>
              </>
            )}
          </ul>
        </div>

        {formData.allowMultipleSubmissions && (
          <Button onClick={handleReset} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl active:scale-95 transition-all duration-200">
            {isRegistration ? 'Gửi đơn mới' : 'Gửi câu trả lời mới'}
          </Button>
        )}
      </div>
    </div>
  );
};