"use client";
import React from 'react';
import { Target, Lightbulb, Trophy } from 'lucide-react';
import { EventConfig } from '@/types/event';

export default function EventDetails({ event }: { event: EventConfig }) {
  return (
    <div className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Mục tiêu */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Target className="text-blue-600 w-6 h-6" /> Mục tiêu cuộc thi
            </h3>
            <ul className="space-y-4">
              {event.objectives.map((obj, idx) => (
                <li key={idx} className="flex gap-3 text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Thể lệ / Cấu trúc */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Lightbulb className="text-blue-600 w-6 h-6" /> Cấu trúc cuộc thi
            </h3>
            <div className="space-y-4">
              {event.structure.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="font-bold text-slate-900 mb-1">{item.phase}</p>
                  <p className="text-sm text-slate-600">{item.time} — {item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Giải thưởng */}
        <div className="text-center max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-10 shadow-lg">
          <Trophy className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-10">Cơ cấu giải thưởng</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {event.prizes.map((prize, idx) => (
              <div key={idx} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                <div className="text-4xl mb-3">{prize.icon}</div>
                <p className="text-lg font-medium text-slate-300 mb-1">{prize.title}</p>
                <p className="text-2xl font-bold text-white">{prize.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}