"use client";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  centered?: boolean;
}

export default function SectionHeader({ icon: Icon, title, centered = false }: SectionHeaderProps) {
  return (
    <div className={`mb-10 ${centered ? "text-center flex flex-col items-center" : ""}`}>
      <div className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        <Icon className="text-blue-600 dark:text-cyan-400 w-7 h-7 shrink-0" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">{title}</h2>
      </div>
    </div>
  );
}
