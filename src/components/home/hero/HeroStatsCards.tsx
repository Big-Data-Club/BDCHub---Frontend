"use client";


export interface StatItem {
  label: string;
  value: string;
  floatClasses: string;
  duration: number;
}

export const statsData: StatItem[] = [
  { label: "Kết nối", value: "100+", floatClasses: "top-[12%] left-[4%]", duration: 4.2 },
  { label: "Năm hoạt động", value: "4", floatClasses: "top-[26%] right-[0%]", duration: 4.8 },
  { label: "Dự án NCKH", value: "10+", floatClasses: "bottom-[26%] left-[4%]", duration: 5.2 },
  { label: "Giải thưởng", value: "5+", floatClasses: "bottom-[12%] right-[0%]", duration: 4.5 }
];

export interface HeroStatsCardsProps {
  statsDuration: number;
  statsYOffset: number;
}

export function HeroStatsCards({
  statsDuration: _statsDuration,
  statsYOffset: _statsYOffset,
}: HeroStatsCardsProps) {
  void _statsDuration;
  void _statsYOffset;
  return (
    <>
      {statsData.map((stat, i) => {
        return (
          <div
            key={i}
            className={`absolute ${stat.floatClasses} w-[170px] z-20`}
          >
            <div className="relative group">
              <div
                className="relative flex flex-col items-center justify-center p-5 rounded-2xl cursor-default bg-white dark:bg-[#0F1E35] overflow-hidden
                           border border-white/60 dark:border-blue-500/10
                           shadow-sm dark:shadow-none"
              >
                <div className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400">{stat.value}</div>
                <div className="mt-1.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
