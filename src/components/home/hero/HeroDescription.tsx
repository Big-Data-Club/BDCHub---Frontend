"use client";

import { motion } from "framer-motion";

export interface HeroDescriptionProps {
  descriptionDuration?: number;
  descriptionYOffset?: number;
  customTime?: number;
}

export function HeroDescription({
  descriptionDuration: _descriptionDuration,
  descriptionYOffset: _descriptionYOffset,
  customTime: _customTime,
}: HeroDescriptionProps) {
  void _descriptionDuration;
  void _descriptionYOffset;
  void _customTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col items-center lg:items-start gap-4"
    >
      <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl lg:max-w-xl leading-relaxed text-center lg:text-left font-normal">
        Câu lạc bộ học thuật chuyên sâu tại HCMUT chuyên nghiên cứu và phát triển trong các lĩnh vực Dữ liệu lớn, Trí tuệ nhân tạo, Điện toán đám mây và Điện toán lượng tử.
      </p>

      {/* Structural horizontal divider */}
      <div className="w-full flex items-center justify-center lg:justify-start gap-3 pt-1">
        <div className="w-12 h-1 bg-blue-600 dark:bg-cyan-400 rounded-full" />
        <div className="h-px bg-slate-200 dark:bg-slate-800 w-full max-w-md" />
      </div>
    </motion.div>
  );
}


