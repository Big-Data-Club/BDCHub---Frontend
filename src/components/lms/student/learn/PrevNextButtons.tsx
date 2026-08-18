import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Content, Section } from "@/types";

interface PrevNextButtonsProps {
  sections: Section[];
  sectionContents: Record<number, Content[]>;
  activeContent: Content;
  onSelect: (c: Content) => void;
}

export function PrevNextButtons({
  sections,
  sectionContents,
  activeContent,
  onSelect,
}: PrevNextButtonsProps) {
  const flat = sections.flatMap((s) => sectionContents[s.id] ?? []);
  const idx = flat.findIndex((c) => c.id === activeContent.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <>
      {prev ? (
        <button
          className="flex items-center gap-4 p-4 text-left bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#12223a]/50 hover:border-blue-500/30 dark:hover:border-cyan-500/35 transition-all duration-300 group active:scale-[0.98] shadow-xs cursor-pointer w-full"
          onClick={() => onSelect(prev)}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#0D192E] border border-slate-200/50 dark:border-blue-500/10 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 group-hover:border-blue-500/30 dark:group-hover:text-cyan-400 dark:group-hover:border-cyan-400/30 transition-all duration-300 flex-shrink-0">
            <ArrowLeft className="w-4 h-4 transition-transform duration-355 group-hover:-translate-x-0.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bài học trước</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{prev.title}</p>
          </div>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <button
          className="flex items-center justify-between gap-4 p-4 text-right bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#12223a]/50 hover:border-blue-500/30 dark:hover:border-cyan-500/35 transition-all duration-300 group active:scale-[0.98] shadow-xs cursor-pointer w-full"
          onClick={() => onSelect(next)}
        >
          <div className="min-w-0 flex-1 text-left sm:text-right">
            <p className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">Bài kế tiếp</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{next.title}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-100 dark:border-cyan-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-cyan-500/20 group-hover:border-blue-500/35 dark:group-hover:border-cyan-400/40 transition-all duration-300">
            <ChevronRight className="w-4 h-4 transition-transform duration-355 group-hover:translate-x-0.5" />
          </div>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}
    </>
  );
}
