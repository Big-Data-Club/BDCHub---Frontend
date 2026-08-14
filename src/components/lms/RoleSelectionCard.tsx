import { ComponentType } from "react";
import { Check } from "lucide-react";

export interface RoleSelectionCardProps {
  role: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  features: string[];
  onSelect: (role: string) => void;
  hotkey?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function RoleSelectionCard({
  role,
  label,
  description,
  icon: Icon,
  features,
  onSelect,
  hotkey,
  className,
  style,
}: RoleSelectionCardProps) {
  return (
    <div className={`relative group ${className || ""}`} style={style}>
      {/* Underlay / Offset Solid Background - Quieter translation offset (1 = 4px) */}
      <div className="absolute inset-0 bg-blue-600 dark:bg-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-x-0 translate-y-0 group-hover:translate-x-1 group-hover:translate-y-1 group-focus-within:translate-x-1 group-focus-within:translate-y-1" />

      {/* Main Interactive Card */}
      <button
        onClick={() => onSelect(role)}
        aria-keyshortcuts={hotkey}
        className="relative w-full h-full flex flex-col items-start bg-white dark:bg-[#0F1E35] border border-slate-200/80 dark:border-blue-500/20 rounded-2xl p-6 text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform translate-x-0 translate-y-0 group-hover:-translate-x-1 group-hover:-translate-y-1 group-focus-within:-translate-x-1 group-focus-within:-translate-y-1 hover:border-blue-600 dark:hover:border-cyan-400 hover:shadow-[0_4px_20px_rgba(37,99,235,0.04)] dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 z-10"
      >
        <div className="flex items-center gap-3 mb-4 w-full">
          {/* Brand Themed Icon Box */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50/80 dark:bg-blue-950/30 text-blue-600 dark:text-cyan-400 group-hover:-translate-y-0.5 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950 group-focus-within:-translate-y-0.5 group-focus-within:bg-blue-600 group-focus-within:text-white dark:group-focus-within:bg-cyan-500 dark:group-focus-within:text-slate-950 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border border-transparent dark:border-cyan-500/10 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400 transition-colors tracking-tight">
            {label}
          </h3>
          {hotkey && (
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-blue-500/20 bg-slate-50/50 dark:bg-blue-950/20 text-blue-500/80 dark:text-cyan-400/80 font-mono select-none">
              {hotkey}
            </span>
          )}
        </div>

        <p className="text-slate-600 dark:text-slate-200 text-base leading-relaxed tracking-tight mb-4 min-h-[40px]">
          {description}
        </p>

        <div className="w-full h-px bg-slate-100 dark:bg-blue-950/20 mb-4" />

        {/* Quieter Feature List (removed circular container background) */}
        <div className="space-y-2.5 w-full">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-500 dark:text-slate-300">
              <Check className="w-4 h-4 text-blue-500 dark:text-cyan-500/70 shrink-0 mt-0.5" />
              <span className="transition-colors group-hover:text-slate-800 dark:group-hover:text-white">{feature}</span>
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}
