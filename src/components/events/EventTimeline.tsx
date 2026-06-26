"use client";
import React from 'react';
import { TimelineDay } from '@/types/event';

export default function EventTimeline({ timelines }: { timelines: TimelineDay[] }) {
  return (
    <div className="py-20 bg-slate-50 dark:bg-[#0A1628] border-b border-slate-200 dark:border-blue-500/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header - pipeline style */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-blue-500/30 dark:to-cyan-400/20" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-cyan-400 whitespace-nowrap">
            Lịch Trình Chi Tiết
          </h2>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-blue-500/30 dark:to-cyan-400/20" />
        </div>
        
        <div className="space-y-16">
          {timelines.map((day) => (
            <div key={day.id}>
              <h3 className="text-xl font-bold text-blue-600 dark:text-cyan-400 mb-8
                             border-b border-slate-200 dark:border-blue-500/10 pb-2
                             flex items-center justify-between">
                {day.title}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                  {day.date.toLocaleDateString('vi-VN')}
                </span>
              </h3>
              
              <div className="relative border-l-2 border-slate-200 dark:border-blue-500/20 ml-3 md:ml-6 space-y-8">
                {day.events.map((event, idx) => (
                  <div key={idx} className="relative pl-8 md:pl-10">
                    {/* Nút mốc thời gian */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full
                                    bg-white dark:bg-[#0A1628]
                                    border-4 border-blue-500 dark:border-cyan-400" />
                    
                    <div className="bg-white dark:bg-[#0F1E35]
                                    p-5 rounded-xl
                                    border border-slate-200 dark:border-blue-500/10
                                    shadow-sm dark:shadow-none
                                    hover:shadow-md dark:hover:border-blue-500/25
                                    transition-all duration-300">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full
                                       bg-blue-50 dark:bg-blue-900/30
                                       text-blue-600 dark:text-cyan-400
                                       border border-blue-200 dark:border-blue-500/20
                                       text-xs font-mono font-bold mb-2">
                        {event.time}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{event.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}