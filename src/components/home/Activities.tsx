"use client";
import { Activity } from "lucide-react";
import clubData from "@/data/clubData.json";
import { useScrollAnimation } from "@/hooks/animation/useScrollAnimation";
import SafeImage from "../common/SafeImage";

export default function Activities() {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section id="activities" ref={ref} className={`py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/60 dark:bg-[#0A1628]/70 backdrop-blur-sm transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section header — pipeline style */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-2">
            <Activity className="text-blue-600 dark:text-cyan-400 w-6 h-6 shrink-0" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Hoạt Động Cốt Lõi</h2>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-12 h-1 bg-blue-600 dark:bg-cyan-400 rounded-full" />
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 dark:from-cyan-400/20 to-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubData.activities.map((activity) => (
            <div key={activity.id} className="bg-white/80 dark:bg-[#0F1E35]/70
                                              backdrop-blur-sm
                                              rounded-2xl
                                              border border-slate-200 dark:border-blue-500/10
                                              overflow-hidden
                                              shadow-sm dark:shadow-none
                                              hover:-translate-y-1.5
                                              hover:shadow-xl hover:shadow-blue-500/5
                                              dark:hover:shadow-[0_12px_40px_rgba(37,99,235,0.08)]
                                              hover:border-blue-300/60 dark:hover:border-blue-500/25
                                              transition-all duration-300 group">
              <div className="h-48 bg-slate-200 dark:bg-[#0A1628] relative overflow-hidden">
                <SafeImage src={activity.imageUrl} alt={activity.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 dark:group-hover:bg-cyan-400/5 transition-colors duration-300" />
              </div>
              <div className="p-6">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                 text-xs font-semibold uppercase tracking-wider mb-3 block w-fit
                                 bg-blue-50 dark:bg-blue-900/30
                                 text-blue-600 dark:text-cyan-400
                                 border border-blue-200 dark:border-blue-500/20">
                  {activity.type}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">{activity.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}