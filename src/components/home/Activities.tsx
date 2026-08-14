"use client";
import { Activity } from "lucide-react";
import clubData from "@/data/clubData.json";
import SectionHeader from "../common/SectionHeader";
import SafeImage from "../common/SafeImage";
import TerminalCard from "../common/TerminalCard";
import CyberBadge from "../common/CyberBadge";

export default function Activities() {
  return (
    <section id="activities" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader icon={Activity} title="Hoạt Động Cốt Lõi" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubData.activities.map((activity) => (
            <TerminalCard
              key={activity.id} 
              className="overflow-hidden group flex flex-col"
            >
              <div className="h-48 bg-slate-200 dark:bg-[#0A1628] relative overflow-hidden">
                <SafeImage src={activity.imageUrl} alt={activity.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 dark:group-hover:bg-cyan-400/5 transition-colors duration-300" />
              </div>
              <div className="p-6">
                <CyberBadge variant="blue" className="mb-3">
                   {activity.type}
                </CyberBadge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">{activity.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">{activity.description}</p>
              </div>
            </TerminalCard>
          ))}
        </div>
      </div>
    </section>
  );
}
