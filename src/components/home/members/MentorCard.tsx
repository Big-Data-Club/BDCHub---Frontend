"use client";

import { motion } from "framer-motion";
import SafeImage from "../../common/SafeImage";
import { UserAvatar } from "@/components/user/UserAvatar";
import { BookOpen } from "lucide-react";

export interface MentorItem {
  id: string;
  name: string;
  desc: string;
  team: string;
  imageUrl?: string;
  role?: string;
  tags?: string[];
}

export interface MentorCardProps {
  mentor: MentorItem;
  idx: number;
  onSelectMentor?: (mentor: MentorItem) => void;
}

export function MentorCard({ mentor, idx, onSelectMentor }: MentorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: 0.05 * idx, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white dark:bg-[#0F1E35] p-5 rounded-xl border border-slate-200 dark:border-blue-500/20 hover:border-blue-500/50 dark:hover:border-cyan-400/50 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Header with Avatar & Basic Info */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            {mentor.imageUrl ? (
              <SafeImage
                src={mentor.imageUrl}
                alt={mentor.name}
                fill
                className="object-cover"
              />
            ) : (
              <UserAvatar name={mentor.name} className="w-full h-full" fallbackClassName="text-base font-bold" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
              {mentor.name}
            </h4>
            <p className="text-xs font-medium text-blue-600 dark:text-cyan-400 mt-0.5">
              {mentor.role}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {mentor.desc}
        </p>

        {/* Research Focus Tags */}
        {mentor.tags && mentor.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {mentor.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action button */}
      {onSelectMentor && (
        <button
          onClick={() => onSelectMentor(mentor)}
          className="inline-flex items-center justify-center gap-1.5 w-full text-xs font-semibold px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#070E1C] text-slate-700 dark:text-cyan-400 hover:bg-blue-600 hover:text-white dark:hover:bg-cyan-400 dark:hover:text-slate-950 border border-slate-200 dark:border-cyan-500/20 transition-all duration-200 mt-2"
        >
          <BookOpen className="w-3.5 h-3.5" /> Công trình NCKH
        </button>
      )}
    </motion.div>
  );
}



