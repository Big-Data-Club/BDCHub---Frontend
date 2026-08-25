"use client";

import { motion } from "framer-motion";
import SafeImage from "../../common/SafeImage";

export interface ActivityItem {
  id: string;
  title: string;
  type: string;
  description: string;
  imageUrl: string;
  frequency?: string;
}

export interface ActivityCardProps {
  activity: ActivityItem;
  idx: number;
}

export function ActivityCard({ activity, idx }: ActivityCardProps) {
  // Pad single digit numbers for editorial look (01, 02, etc.)
  const formattedIndex = String(idx + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: 0.05 * idx, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col h-full border-t border-slate-300 dark:border-slate-800 pt-6 pb-2"
    >
      {/* Editorial Header Line: Number & Category tag */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 tracking-wider">
          {formattedIndex} /
        </span>
        <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase text-right">
          {activity.type}
        </span>
      </div>

      {/* Image container: Clean rectangular aspect ratio */}
      <div className="w-full aspect-[16/9] relative overflow-hidden bg-slate-100 dark:bg-slate-900 mb-4">
        <SafeImage
          src={activity.imageUrl}
          alt={activity.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>

      {/* Content Block: Natural top-aligned flow without artificial min-height gaps */}
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-200 mb-2">
          {activity.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal line-clamp-3">
          {activity.description}
        </p>
      </div>
    </motion.div>
  );
}
