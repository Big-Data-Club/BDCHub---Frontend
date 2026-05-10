"use client";
import React from 'react';
import { TimelineDay } from '@/types/event';

export default function EventTimeline({ timelines }: { timelines: TimelineDay[] }) {
  return (
    <div className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">Lịch Trình Chi Tiết</h2>
        
        <div className="space-y-16">
          {timelines.map((day) => (
            <div key={day.id}>
              <h3 className="text-xl font-bold text-blue-600 mb-8 border-b border-slate-200 pb-2 flex items-center justify-between">
                {day.title}
                <span className="text-sm font-normal text-slate-500">
                  {day.date.toLocaleDateString('vi-VN')}
                </span>
              </h3>
              
              <div className="relative border-l-2 border-slate-200 ml-3 md:ml-6 space-y-8">
                {day.events.map((event, idx) => (
                  <div key={idx} className="relative pl-8 md:pl-10">
                    {/* Nút mốc thời gian */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-blue-500"></div>
                    
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded mb-2">
                        {event.time}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">{event.title}</h4>
                      <p className="text-slate-600 text-sm">{event.description}</p>
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