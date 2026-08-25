"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import clubData from "@/data/clubData.json";
import SectionHeader from "../../common/SectionHeader";
import { MentorCard, MentorItem } from "./MentorCard";
import MentorModal, { PublicationItem } from "./MentorModal";

export default function Members() {
  const [selectedMentor, setSelectedMentor] = useState<MentorItem | null>(null);

  const mentorsList: MentorItem[] = useMemo(() => {
    return (clubData.mentors || []).map((m) => ({
      id: m.id,
      name: m.name,
      desc: m.description,
      team: "Mentors",
      imageUrl: m.imageUrl,
      role: m.role,
      tags: m.tags,
    }));
  }, []);

  const publicationsList: PublicationItem[] = useMemo(() => {
    return (clubData.publications || []).map((p) => ({
      id: p.id,
      title: p.title,
      authors: p.authors,
      publisher: p.publisher,
      year: p.year,
      url: p.url,
      doi: p.doi,
    }));
  }, []);

  return (
    <section id="members" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader icon={Users} title="Ban Cố Vấn & Giảng Viên Hướng Dẫn" />

        <p className="-mt-4 mb-8 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Đội ngũ Thầy/Cô bảo trợ chuyên môn, định hướng nghiên cứu khoa học và đồng hành cùng các hoạt động dự án tại BDC HCMUT.
        </p>

        {/* Mentors Clean Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentorsList.map((mentor, idx) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              idx={idx}
              onSelectMentor={(m) => setSelectedMentor(m)}
            />
          ))}
        </div>

        {/* Modal công trình NCKH của Cố vấn */}
        <MentorModal
          mentor={selectedMentor}
          publications={publicationsList}
          onClose={() => setSelectedMentor(null)}
        />
      </div>
    </section>
  );
}



