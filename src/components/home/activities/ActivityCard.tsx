"use client";

import { motion } from "framer-motion";
import TerminalCard from "../../common/TerminalCard";
import SafeImage from "../../common/SafeImage";
import CyberBadge from "../../common/CyberBadge";

export interface ActivityItem {
  id: string;
  title: string;
  type: string;
  description: string;
  imageUrl: string;
}

export interface ActivityCardProps {
  activity: ActivityItem;
  idx: number;
}

export function ActivityCard({ activity, idx }: ActivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: 0.08 * idx, ease: [0.16, 1, 0.3, 1] }}
    >
      <TerminalCard className="overflow-hidden group flex flex-col h-full bg-white/90 dark:bg-[#0F1E35]/90 backdrop-blur-md">
        <div className="h-52 bg-slate-200 dark:bg-[#0A1628] relative overflow-hidden">
          <SafeImage 
            src={activity.imageUrl} 
            alt={activity.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
          />
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-blue-600/10 dark:group-hover:bg-cyan-400/10 transition-colors duration-300" />
        </div>
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-center">
              <CyberBadge 
                variant={
                  idx % 4 === 0 ? "cyan" :
                  idx % 4 === 1 ? "emerald" :
                  idx % 4 === 2 ? "violet" : "amber"
                }
              >
                {activity.type}
              </CyberBadge>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2.5 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300 leading-snug">
              {activity.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
              {activity.description}
            </p>
          </div>
        </div>
      </TerminalCard>
    </motion.div>
  );
}
