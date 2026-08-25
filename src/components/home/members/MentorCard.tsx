"use client";

import { motion } from "framer-motion";
import SafeImage from "../../common/SafeImage";
import { UserAvatar } from "@/components/user/UserAvatar";

export interface MentorItem {
  id: string;
  name: string;
  desc: string;
  team: string;
  imageUrl?: string;
  role?: string;
}

export interface MentorCardProps {
  mentor: MentorItem;
  idx: number;
}

export function MentorCard({ mentor, idx }: MentorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: 0.06 * idx, ease: [0.16, 1, 0.3, 1] }}
      className="bg-slate-50/80 dark:bg-[#070E1C]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 flex items-center gap-3.5 hover:border-blue-400/60 dark:hover:border-cyan-400/40 hover:shadow-md transition-all duration-300 group"
    >
      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-blue-500/20 dark:border-cyan-400/30 group-hover:border-blue-500 dark:group-hover:border-cyan-400 transition-colors">
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
      <div className="min-w-0 flex-1">
        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
          {mentor.name}
        </h4>
        <p className="text-xs text-blue-600 dark:text-cyan-400 font-bold truncate mt-0.5">
          {mentor.role}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5 font-normal">
          {mentor.desc}
        </p>
      </div>
    </motion.div>
  );
}
