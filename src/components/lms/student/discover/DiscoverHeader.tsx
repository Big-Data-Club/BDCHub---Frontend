import { Search, Sparkles } from "lucide-react";
import { Input, GridBackground } from "@/components/lms/shared";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/shared/BreadcrumbNav";

interface DiscoverHeaderProps {
  search: string;
  onSearchChange: (query: string) => void;
  onOpenPreferences: () => void;
}

export function DiscoverHeader({ search, onSearchChange, onOpenPreferences }: DiscoverHeaderProps) {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Học tập", href: "/lms/student" },
    { label: "Khám phá khóa học" },
  ];

  return (
    <div className="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-6 md:py-8">
      <GridBackground />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 space-y-4">
        <BreadcrumbNav items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Khám Phá Khóa Học
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Tìm kiếm và nâng cao kỹ năng với hàng loạt khóa học chất lượng từ giảng viên hàng đầu.
            </p>
          </div>

          <button
            onClick={onOpenPreferences}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mục tiêu học tập AI</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative max-w-xl">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên khóa học, danh mục, từ khóa..."
            className="pl-10"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}
