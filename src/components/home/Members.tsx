"use client";
import { Users } from "lucide-react";
import clubData from "@/data/clubData.json";
import SectionHeader from "../common/SectionHeader";
import SafeImage from "../common/SafeImage";
import { motion } from "framer-motion";

export default function Members() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section id="members" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#070E1C]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader icon={Users} title="Đội Ngũ BDC" centered />

        <div className="space-y-16 mt-16">
          {['council', 'research', 'engineer', 'media', 'event', 'alumni'].map((teamKey) => {
            const teamData = clubData.members[teamKey as keyof typeof clubData.members];
            if (!teamData || teamData.length === 0) return null;
            const teamName = teamKey.charAt(0).toUpperCase() + teamKey.slice(1);

            return (
              <div key={teamKey}>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8
                                border-b border-slate-200 dark:border-blue-500/10 pb-2">
                  {teamName} Team <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">({teamData.length})</span>
                </h3>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6"
                >
                  {teamData.map((member) => (
                    <motion.div key={member.id} variants={itemVariants} className="text-center group">
                      <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden
                                      bg-slate-200 dark:bg-[#0F1E35]
                                      border-2 border-transparent
                                      group-hover:border-blue-500 dark:group-hover:border-cyan-400
                                      transition-all duration-300">
                        <SafeImage 
                          src={member.imageUrl} 
                          alt={member.name} 
                          fill 
                          className="object-cover" 
                          sizes="(max-width: 768px) 100px, 150px"
                        />
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate px-2">{member.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{member.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}