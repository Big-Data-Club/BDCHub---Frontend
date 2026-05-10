"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

export const SurveyHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8 text-center sm:text-left">
    <h1 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">{title}</h1>
    <p className="text-slate-600 leading-relaxed mb-6">{description}</p>
    <div className="inline-flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
      <span className="text-red-500">*</span> Câu hỏi bắt buộc
    </div>
  </div>
);

export const SurveyProgress = ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => {
  if (totalPages <= 1) return null;
  const progress = ((currentPage + 1) / totalPages) * 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center text-sm font-medium text-slate-500 mb-3">
        <span>Tiến độ khảo sát</span>
        <span>Trang {currentPage + 1} / {totalPages}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export const SurveyFooter = () => (
  <div className="text-center mt-12 pb-8 text-sm text-slate-400 font-medium">
    <p>Dữ liệu được mã hóa và bảo mật tuyệt đối bởi hệ thống</p>
    <p className="mt-1">© {new Date().getFullYear()} BDC Platform • Chuyên nghiệp & Tận tâm</p>
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
}) => (
  <div className="min-h-[70vh] flex items-center justify-center p-4">
    <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center">
      <div className="w-20 h-20 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">
        {formData.thankYouMessage || 'Cảm ơn bạn!'}
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        {hasSubmitted && !formData.allowMultipleSubmissions 
          ? 'Bạn đã hoàn thành khảo sát này trước đó. Thông tin của bạn đã được ghi nhận.'
          : 'Câu trả lời của bạn đã được lưu trữ an toàn trên hệ thống.'}
      </p>
      
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 text-left border border-blue-200 dark:border-blue-800 mb-8">
        <p className="font-semibold text-slate-900 dark:text-slate-50 mb-2">📊 Thông tin sẽ được sử dụng để:</p>
        <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
          <li>Xác định lộ trình phát triển tính năng</li>
          <li>Phân tích nhu cầu theo nhóm đối tượng</li>
          <li>Cải thiện trải nghiệm học tập số</li>
        </ul>
      </div>

      {formData.allowMultipleSubmissions && (
        <Button onClick={handleReset} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
          Gửi câu trả lời mới
        </Button>
      )}
    </div>
  </div>
);