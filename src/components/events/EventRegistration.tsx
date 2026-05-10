"use client";
import React from 'react';
import { EventConfig } from '@/types/event';

export default function EventRegistration({ event }: { event: EventConfig }) {
  const isRegistrationOpen = new Date() <= event.registrationEnd;

  if (!isRegistrationOpen) return null;

  return (
    <div className="py-20 bg-slate-50 text-center">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Sẵn sàng tham gia?</h2>
        <p className="text-slate-600 mb-8">
          Hạn chót đăng ký: <strong className="text-slate-900">{event.registrationEnd.toLocaleDateString('vi-VN')}</strong>
        </p>
        <a 
          href={event.registrationLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-10 py-4 rounded-xl transition-colors shadow-sm"
        >
          Đăng ký ngay
        </a>
      </div>
    </div>
  );
}