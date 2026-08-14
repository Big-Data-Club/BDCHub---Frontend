"use client";

import { useMemo } from "react";
import { Users, ShieldCheck } from "lucide-react";
import clubData from "@/data/clubData.json";
import SectionHeader from "../common/SectionHeader";
import SafeImage from "../common/SafeImage";
import { UserAvatar } from "@/components/user/UserAvatar";

interface MemberItem {
  id: string;
  name: string;
  desc: string;
  team: string;
  imageUrl?: string;
  role?: string;
}

export default function Members() {
  const mentorsList: MemberItem[] = useMemo(() => {
    return (clubData.mentors || []).map((m) => ({
      id: m.id,
      name: m.name,
      desc: m.description,
      team: "Mentors",
      imageUrl: m.imageUrl,
      role: m.role,
    }));
  }, []);

  return (
    <section id="members" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <SectionHeader icon={Users} title="Đội Ngũ Cố Vấn BDC" centered />

        {/* Featured Mentors Banner */}
        <div className="bg-gradient-to-r from-blue-900/10 via-slate-100 to-cyan-900/10 dark:from-blue-950/40 dark:via-[#0F1E35] dark:to-cyan-950/40 p-6 sm:p-8 rounded-3xl border border-blue-200/60 dark:border-blue-500/20 shadow-lg dark:shadow-[0_8px_32px_rgba(7,14,28,0.5)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-600/10 dark:bg-cyan-400/10 text-blue-600 dark:text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ban Cố Vấn & Giảng Viên Hướng Dẫn
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Bảo trợ chuyên môn và định hướng nghiên cứu khoa học cho BDC HCMUT
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mentorsList.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white/80 dark:bg-[#070E1C]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 flex items-center gap-3 hover:border-blue-400/60 dark:hover:border-cyan-400/40 transition-all duration-300 group"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-blue-400/40 dark:border-cyan-400/40">
                  {mentor.imageUrl ? (
                    <SafeImage
                      src={mentor.imageUrl}
                      alt={mentor.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <UserAvatar name={mentor.name} className="w-full h-full" fallbackClassName="text-sm font-semibold" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {mentor.name}
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-cyan-400 font-medium truncate">
                    {mentor.role}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {mentor.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
