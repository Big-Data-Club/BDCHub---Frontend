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
  const descriptionLines = [
    "Câu lạc bộ học thuật hàng đầu tại HCMUT chuyên nghiên cứu",
    "và phát triển trong lĩnh vực Dữ liệu lớn, Trí tuệ nhân tạo,",
    "Điện toán đám mây và Điện toán lượng tử."
  ];

  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="w-full text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl lg:max-w-xl leading-relaxed text-center lg:text-left"
    >
      {descriptionLines.map((line, idx) => (
        <span key={idx} className="block">
          {line}
        </span>
      ))}
    </motion.p>
  );
}
