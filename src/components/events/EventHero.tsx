"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, MapPin, Clock } from 'lucide-react';
import { EventConfig } from '@/types/event';

export default function EventHero({ event }: { event: EventConfig }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatus = () => {
    if (currentTime > event.registrationEnd) return { label: "Đã đóng đăng ký", color: "bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700" };
    if (currentTime >= event.registrationStart && currentTime <= event.registrationEnd) return { label: "Đang mở đăng ký", color: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/20" };
    return { label: "Sắp diễn ra", color: "bg-slate-50 dark:bg-[#0A1628] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-blue-500/10" };
  };

  const status = getStatus();

  return (
    <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-blue-500/10 bg-white dark:bg-[#070E1C]">
      <div className="max-w-4xl mx-auto text-center">
        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${status.color}`}>
          {status.label}
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          {event.title}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">{event.subtitle}</p>
        
        <div className="flex justify-center items-center gap-2 text-slate-500 dark:text-slate-400 mb-10">
          <Clock className="w-5 h-5" />
          <span className="font-mono">{currentTime.toLocaleString('vi-VN')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-slate-50 dark:bg-[#0F1E35] p-6 rounded-2xl border border-slate-200 dark:border-blue-500/10 flex flex-col items-center shadow-sm dark:shadow-none">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-cyan-400 mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Thời gian</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{event.registrationStart.toLocaleDateString('vi-VN')} - {event.registrationEnd.toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="bg-slate-50 dark:bg-[#0F1E35] p-6 rounded-2xl border border-slate-200 dark:border-blue-500/10 flex flex-col items-center shadow-sm dark:shadow-none">
            <Trophy className="w-6 h-6 text-blue-600 dark:text-cyan-400 mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Tổng giải thưởng</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{event.totalPrizePool}</p>
          </div>
          <div className="bg-slate-50 dark:bg-[#0F1E35] p-6 rounded-2xl border border-slate-200 dark:border-blue-500/10 flex flex-col items-center shadow-sm dark:shadow-none">
            <MapPin className="w-6 h-6 text-blue-600 dark:text-cyan-400 mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Địa điểm</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{event.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}