"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";

export interface HeroDescriptionProps {
  descriptionDuration: number;
  descriptionYOffset: number;
  customTime?: number;
}

export function HeroDescription({
  descriptionDuration,
  descriptionYOffset,
  customTime,
}: HeroDescriptionProps) {
  const shouldReduceMotion = useReducedMotion();

  const descriptionLineVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : descriptionYOffset,
      filter: shouldReduceMotion ? "none" : "blur(6px)"
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      filter: "none",
      transition: {
        duration: descriptionDuration,
        ease: [0.22, 1, 0.36, 1], // Signature out-expo easing for mask-reveal-up spec
        delay: 0.7 + index * 0.08, // Rhythmic stagger immediately after title settle
      },
    }),
  };

  const descriptionLines = [
    "Câu lạc bộ học thuật hàng đầu tại HCMUT chuyên nghiên cứu",
    "và phát triển trong lĩnh vực Dữ liệu lớn, Trí tuệ nhân tạo,",
    "Điện toán đám mây và Điện toán lượng tử."
  ];

  const isScrubMode = typeof customTime === "number" && !isNaN(customTime);

  return (
    <div className="w-full text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl lg:max-w-xl leading-relaxed text-center lg:text-left transition-all duration-200">
      {descriptionLines.map((line, idx) => (
        <span 
          key={idx} 
          className="block overflow-hidden relative py-0.5"
        >
          <motion.span
            custom={idx}
            variants={descriptionLineVariants}
            animate={isScrubMode ? false : "visible"}
            initial={isScrubMode ? false : "hidden"}
            className="inline-block will-change-transform [backface-visibility:hidden]"
            style={isScrubMode ? { opacity: 1, transform: "none", filter: "none" } : undefined}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
