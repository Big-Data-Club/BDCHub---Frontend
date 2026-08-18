import { Search, Sparkles } from "lucide-react";
import { Input, GridBackground } from "@/components/lms/shared";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/shared/BreadcrumbNav";
import { RefObject } from "react";

interface DiscoverHeaderProps {
  search: string;
  onSearchChange: (query: string) => void;
  onOpenPreferences: () => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}

export function DiscoverHeader({ search, onSearchChange, onOpenPreferences, searchInputRef }: DiscoverHeaderProps) {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Học tập", href: "/lms/student" },
    { label: "Khám phá khóa học" },
  ];

  return (
    <div className="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/40 dark:bg-[#070E1C]/60 backdrop-blur-md py-6 md:py-8">
      <GridBackground />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 space-y-4">
        <BreadcrumbNav items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Khám Phá Khóa Học
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Nâng cao kỹ năng chuyên môn với các khóa học chất lượng cao và lộ trình học tập được cá nhân hóa.
            </p>
          </div>

          <button
            onClick={onOpenPreferences}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer self-start md:self-auto border border-blue-500/30"
            aria-label="Cấu hình mục tiêu học tập AI"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Thiết lập Mục tiêu AI</span>
          </button>
        </div>

        {/* Search input with Kbd shortcut hint */}
        <div className="relative max-w-xl">
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên khóa học, danh mục, từ khóa..."
            className="pl-10 pr-12 bg-white dark:bg-[#0F1E35] border-slate-200 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm"
            aria-label="Tìm kiếm khóa học"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#0D192E] border border-slate-200 dark:border-slate-700/50 absolute right-3 top-1/2 -translate-y-1/2 select-none pointer-events-none">
            /
          </kbd>
        </div>
      </div>
    </div>
  );
}

