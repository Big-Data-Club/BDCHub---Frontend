"use client";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  centered?: boolean;
}

export default function SectionHeader({ icon: Icon, title, centered = false }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? "text-center flex flex-col items-center" : ""}`}>
      <div className={`flex items-center gap-4 mb-2 ${centered ? "justify-center" : ""}`}>
        <Icon className="text-blue-600 dark:text-cyan-400 w-8 h-8 shrink-0" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      
      <div className={`flex items-center gap-4 mt-4 ${centered ? "w-full justify-center" : ""}`}>
        <div className="w-12 h-1.5 bg-blue-600 dark:bg-cyan-400 rounded-full" />
        <div className={`h-px bg-gradient-to-r from-blue-500/30 dark:from-cyan-400/20 to-transparent ${centered ? "w-32" : "flex-1"}`} />
      </div>
    </div>
  );
}
