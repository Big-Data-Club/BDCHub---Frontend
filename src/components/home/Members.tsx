"use client";
import Image from "next/image";
import { Users } from "lucide-react";
import clubData from "@/data/clubData.json";
import { useScrollAnimation } from "@/hooks/animation/useScrollAnimation";
import SafeImage from "../common/SafeImage";

export default function Members() {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section id="members" ref={ref} className={`py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/50 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
            <Users className="text-blue-600" /> Đội Ngũ BDC
          </h2>
          <div className="w-12 h-1 bg-blue-600 mt-4 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-16">
          {['council', 'research', 'engineer', 'media', 'event', 'alumni'].map((teamKey) => {
            const teamData = clubData.members[teamKey as keyof typeof clubData.members];
            if (!teamData || teamData.length === 0) return null;
            const teamName = teamKey.charAt(0).toUpperCase() + teamKey.slice(1);

            return (
              <div key={teamKey}>
                <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">
                  {teamName} Team <span className="text-sm font-normal text-slate-500 ml-2">({teamData.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                  {teamData.map((member) => (
                    <div key={member.id} className="text-center group">
                      <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden bg-slate-200 border-2 border-transparent group-hover:border-blue-500 transition-colors">
                        <SafeImage src={member.imageUrl} alt={member.name} fill className="object-cover" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm truncate px-2">{member.name}</h4>
                      <p className="text-xs text-slate-500">{member.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}