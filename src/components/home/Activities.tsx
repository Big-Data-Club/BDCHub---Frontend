"use client";
import { Activity } from "lucide-react";
import clubData from "@/data/clubData.json";
import { useScrollAnimation } from "@/hooks/animation/useScrollAnimation";
import SafeImage from "../common/SafeImage";

export default function Activities() {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section id="activities" ref={ref} className={`py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/50 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="text-blue-600" /> Hoạt Động Cốt Lõi
          </h2>
          <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubData.activities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <SafeImage src={activity.imageUrl} alt={activity.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 block">{activity.type}</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{activity.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-3">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}