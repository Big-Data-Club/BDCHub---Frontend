"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import { solveBezier } from "./utils";

export interface HeroTitleProps {
  titleText: string;
  enableConfirm: boolean;
  confirmInitialScale: number;
  confirmDelay: number;
  confirmDuration: number;
  enableTitleFade: boolean;
  titleFadeDuration: number;
  totalStagger: number;
  p: number;
  yOffset: number;
  duration: number;
  ease: [number, number, number, number];
  customTime?: number;
}

export function HeroTitle({
  titleText,
  enableConfirm,
  confirmInitialScale,
  confirmDelay,
  confirmDuration,
  enableTitleFade,
  titleFadeDuration,
  totalStagger,
  p,
  yOffset,
  duration,
  ease,
  customTime,
}: HeroTitleProps) {
  const shouldReduceMotion = useReducedMotion();

  const titleContainerVariants: Variants = {
    hidden: { 
      opacity: 1, // Loại bỏ mờ tỏ kép từ khung cha để tránh xung đột stagger
      scale: enableConfirm ? confirmInitialScale : 1,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.1,
        ...(enableConfirm ? {
          scale: {
            delay: confirmDelay,
            duration: confirmDuration,
            ease: [0.16, 1, 0.3, 1], // Premium out-expo: zooms smoothly and locks at 1.0
          },
        } : {}),
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { 
      opacity: enableTitleFade ? 0 : 1, 
      y: shouldReduceMotion ? 0 : yOffset, // Tọa độ dịch chuyển động
    },
    visible: ({ index, total }: { index: number; total: number }) => {
      const x = total > 1 ? index / (total - 1) : 0;
      
      // Hàm S-Curve đối xứng tổng quát cho mọi số mũ p >= 1 (không lo NaN với cơ số âm)
      const diff = x - 0.5;
      const progress = 0.5 + Math.sign(diff) * Math.pow(Math.abs(diff), p) * Math.pow(2, p - 1);
      
      const delay = shouldReduceMotion ? 0.1 : 0.1 + progress * totalStagger;
      
      return {
        opacity: 1,
        y: 0,
        transition: {
          y: {
            duration,
            ease,
            delay,
          },
          opacity: {
            duration: titleFadeDuration,
            ease: "easeOut",
            delay,
          },
        },
      };
    },
  };

  const isScrubMode = typeof customTime === "number" && !isNaN(customTime);
  const confirmScale = (() => {
    if (!isScrubMode || !enableConfirm) return 1.0;
    if (customTime < confirmDelay) return confirmInitialScale;
    if (customTime >= confirmDelay && customTime <= confirmDelay + confirmDuration) {
      const linearProgress = (customTime - confirmDelay) / confirmDuration;
      const easedProgress = solveBezier(0.16, 1.0, 0.3, 1.0, linearProgress); // Khớp [0.16, 1, 0.3, 1]
      return confirmInitialScale + (1.0 - confirmInitialScale) * easedProgress;
    }
    return 1.0;
  })();

  // Tính toán chỉ số ký tự động dựa trên tổng thời gian trễ toàn cục
  const printableCharsCount = titleText.replace(/\s/g, "").length;
  let charIndex = 0;

  return (
    <motion.div 
      variants={titleContainerVariants}
      animate={isScrubMode ? false : undefined}
      style={isScrubMode ? { opacity: 1, scale: 1 } : undefined}
      className="will-change-transform [backface-visibility:hidden] w-full origin-center lg:origin-left"
    >
      {/* Title — bottom-up-letters per-character reveal (crisp edges, zero blur, Apple-style stagger) */}
      <h1 
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight pt-2 pb-4 pl-0 pr-1 leading-[1.15] block text-center lg:text-left"
        style={isScrubMode ? { transform: `scale(${confirmScale})` } : undefined}
      >
        {titleText.split(" ").map((word, wordIdx) => (
          <span key={wordIdx} className="inline-block overflow-hidden py-2 -my-2 whitespace-nowrap mr-[0.25em] last:mr-0">
            {Array.from(word).map((char, charIdx) => {
              const index = charIndex++;
              
              const bgSize = `${printableCharsCount * 100}% 100%`;
              const bgPosition = printableCharsCount > 1 
                ? `${(index / (printableCharsCount - 1)) * 100}% 0%`
                : "0% 0%";

              let letterStyleProps: any = {
                style: {
                  backgroundSize: bgSize,
                  backgroundPosition: bgPosition,
                }
              };

              if (isScrubMode) {
                const x = printableCharsCount > 1 ? index / (printableCharsCount - 1) : 0;
                const diff = x - 0.5;
                const progress = 0.5 + Math.sign(diff) * Math.pow(Math.abs(diff), p) * Math.pow(2, p - 1);
                const start = 0.1 + progress * totalStagger;
                const endY = start + duration;
                const endOpacity = start + titleFadeDuration;
                
                let opacity = 1;
                let y = 0;
                
                // 1. Calculate Y translation
                if (customTime < start) {
                  y = yOffset;
                } else if (customTime >= start && customTime <= endY) {
                  const linearFactor = (customTime - start) / duration;
                  const [eX1, eY1, eX2, eY2] = Array.isArray(ease) && ease.length === 4 ? ease : [0.1, 1, 0.5, 1.4];
                  const easedFactor = solveBezier(eX1, eY1, eX2, eY2, linearFactor);
                  y = yOffset * (1 - easedFactor);
                } else {
                  y = 0;
                }

                // 2. Calculate Opacity fade with its dedicated duration
                if (!enableTitleFade) {
                  opacity = 1;
                } else if (customTime < start) {
                  opacity = 0;
                } else if (customTime >= start && customTime <= endOpacity) {
                  const linearFactor = (customTime - start) / titleFadeDuration;
                  opacity = Math.min(1, Math.max(0, linearFactor));
                } else {
                  opacity = 1;
                }
                
                letterStyleProps = {
                  style: {
                    backgroundSize: bgSize,
                    backgroundPosition: bgPosition,
                    opacity,
                    transform: `translateY(${y}px)`,
                  }
                };
              }

              return (
                <motion.span
                  key={charIdx}
                  custom={{ index, total: printableCharsCount }}
                  variants={letterVariants}
                  animate={isScrubMode ? false : undefined}
                  className={`inline-block will-change-transform [backface-visibility:hidden] py-2 -my-2 ${index === 0 ? "ml-[-0.05em]" : ""} bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400`}
                  {...letterStyleProps}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        ))}
      </h1>
    </motion.div>
  );
}
