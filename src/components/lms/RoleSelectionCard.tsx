import { ReactNode } from "react";

export interface RoleSelectionCardProps {
  role: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  onSelect: (role: string) => void;
}

export function RoleSelectionCard({
  role,
  label,
  description,
  icon: Icon,
  features,
  onSelect,
}: RoleSelectionCardProps) {
  return (
    <div className="relative group">
      {/* Underlay / Offset Solid Background */}
      <div className="absolute inset-0 bg-blue-600 dark:bg-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 translate-y-0 group-hover:translate-x-1.5 group-hover:translate-y-1.5" />

      {/* Main Interactive Card */}
      <button
        onClick={() => onSelect(role)}
        className="relative w-full h-full flex flex-col items-start bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl p-6 text-left transition-all duration-300 transform translate-x-0 translate-y-0 group-hover:-translate-x-1 group-hover:-translate-y-1 hover:border-blue-600 dark:hover:border-cyan-500 dark:hover:bg-[#12223a] dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 z-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-cyan-400 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950 transition-all duration-300 border border-transparent dark:border-cyan-500/10 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
            {label}
          </h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
          {description}
        </p>
        <div className="w-full h-px bg-slate-100 dark:bg-blue-900/20 mb-4" />
        <div className="space-y-2 w-full">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600/70 dark:bg-cyan-400/70 group-hover:bg-blue-600 dark:group-hover:bg-cyan-400 group-hover:scale-125 transition-all" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}
