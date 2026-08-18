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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {prev ? (
        <button
          className="flex items-center gap-3.5 p-4 text-left bg-white dark:bg-[#0F1E35] border border-slate-200/80 dark:border-blue-500/15 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#12223a]/60 hover:border-blue-500/30 dark:hover:border-cyan-500/35 transition-all duration-300 group active:scale-[0.98] shadow-xs cursor-pointer w-full"
          onClick={() => onSelect(prev)}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0D192E] border border-slate-200/60 dark:border-blue-500/10 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 group-hover:border-blue-500/30 dark:group-hover:text-cyan-400 dark:group-hover:border-cyan-400/30 transition-all duration-300 flex-shrink-0">
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Bài học trước</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5" title={prev.title}>
              {prev.title}
            </p>
          </div>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <button
          className="flex items-center justify-between gap-3.5 p-4 text-right bg-white dark:bg-[#0F1E35] border border-slate-200/80 dark:border-blue-500/15 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#12223a]/60 hover:border-blue-500/30 dark:hover:border-cyan-500/35 transition-all duration-300 group active:scale-[0.98] shadow-xs cursor-pointer w-full"
          onClick={() => onSelect(next)}
        >
          <div className="min-w-0 flex-1 text-left sm:text-right">
            <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider block">Bài tiếp theo</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5" title={next.title}>
              {next.title}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200/60 dark:border-cyan-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-cyan-500/20 group-hover:border-blue-500/35 dark:group-hover:border-cyan-400/40 transition-all duration-300">
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  );
}
