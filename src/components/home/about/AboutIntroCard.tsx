"use client";

const STATS_DATA = [
  { label: "Năm thành lập", value: "2021", sub: "Thành lập tại ĐH Bách Khoa TP.HCM" },
  { label: "Thành viên", value: "50+", sub: "Nghiên cứu & Thực chiến sản phẩm" },
  { label: "Dự án & HPC", value: "10+", sub: "Được bảo trợ bởi HPC Lab" },
];

export function AboutIntroCard() {

  return (
    <div className="md:col-span-6 lg:col-span-5 space-y-8 flex flex-col justify-between py-2">
      {/* Editorial Core Intro */}
      <div className="space-y-5">
        <p className="text-xs font-mono tracking-widest text-blue-600 dark:text-cyan-400 uppercase font-semibold">
          High Performance Computing & Data Lab
        </p>

        <p className="text-slate-800 dark:text-slate-100 text-lg sm:text-xl font-medium leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-bold">Big Data Club (BDC)</strong> là câu lạc bộ học thuật chuyên sâu tại ĐH Bách Khoa TP.HCM (HCMUT), hoạt động dưới sự hướng dẫn chuyên môn trực tiếp của phòng thí nghiệm <span className="text-blue-600 dark:text-cyan-400 font-semibold underline underline-offset-4 decoration-blue-500/30 dark:decoration-cyan-400/30">HPC Lab</span>.
        </p>

        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          Đồng hành cùng tinh thần <strong className="text-slate-900 dark:text-slate-200">Think Big • Speak Data</strong> và phương châm <strong className="text-blue-600 dark:text-cyan-400">Learning by Doing</strong>, BDC tập trung nghiên cứu ứng dụng Xử lý dữ liệu lớn, Trí tuệ nhân tạo và Tính toán hiệu năng cao.
        </p>
      </div>

      {/* Structured Stats Row (Clean lines without cards) */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-4">
        {STATS_DATA.map((stat, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {stat.label}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 leading-normal">
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


