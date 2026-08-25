"use client";

import { Activity } from "lucide-react";
import clubData from "@/data/clubData.json";
import SectionHeader from "../../common/SectionHeader";
import { ActivityCard } from "./ActivityCard";

export default function Activities() {
  return (
    <section id="activities" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader icon={Activity} title="Hoạt Động Cốt Lõi" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {clubData.activities.map((activity, idx) => (
            <ActivityCard key={activity.id} activity={activity} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
