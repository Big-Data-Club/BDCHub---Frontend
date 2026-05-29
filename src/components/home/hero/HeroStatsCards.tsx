"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, animate } from "framer-motion";

export interface StatItem {
  label: string;
  value: string;
  floatClasses: string;
  duration: number;
}

export const statsData: StatItem[] = [
  { label: "Kết nối", value: "100+", floatClasses: "top-[6%] left-[2%]", duration: 4.2 },
  { label: "Năm hoạt động", value: "4", floatClasses: "top-[22%] right-[0%]", duration: 4.8 },
  { label: "Dự án NCKH", value: "10+", floatClasses: "bottom-[22%] left-[2%]", duration: 5.2 },
  { label: "Giải thưởng", value: "5+", floatClasses: "bottom-[6%] right-[2%]", duration: 4.5 }
];

// High-performance direct-DOM Animated Counter for the stats values
function StatCounter({ value, delay = 0 }: { value: string; delay?: number }) {
  const numericPart = parseInt(value.replace(/[^0-9]/g, "")) || 0;
  const suffix = value.replace(/[0-9]/g, "");
  
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, numericPart, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1], // Elegant out-exponential easing
      delay: delay + 0.25,     // Offset to start during card spring bounce
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = String(Math.round(latest));
        }
      }
    });
    return controls.stop;
  }, [numericPart, delay]);

  return (
    <div className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400 group-hover:scale-105 transition-transform duration-300">
      <span ref={ref}>0</span>
      <span>{suffix}</span>
    </div>
  );
}

// Apple Signature Soft Blur In Text Effect for stats labels
function SoftBlurInText({ text, delay = 0 }: { text: string; delay?: number }) {
  const shouldReduceMotion = useReducedMotion();
  const characters = Array.from(text);

  if (shouldReduceMotion) {
    return (
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1.5 text-center">
        {text}
      </div>
    );
  }

  return (
    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1.5 text-center flex justify-center flex-wrap gap-x-[1px]">
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],       // Apple Signature easing
            delay: delay + index * 0.035,   // Tight staggered entry
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
}

export interface HeroStatsCardsProps {
  statsDuration: number;
  statsYOffset: number;
}

export function HeroStatsCards({
  statsDuration,
  statsYOffset,
}: HeroStatsCardsProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {statsData.map((stat, i) => {
        const cardDelay = 0.5 + i * 0.22;
        return (
          /* 1. Outer Wrapper - Handles the spring-bounce entry transition in pure CSS */
          <div
            key={i}
            className={`absolute ${stat.floatClasses} w-[170px] z-20 animate-entrance-${i}`}
          >
            {/* 2. Middle Floating Wrapper - Handles the continuous y-bobbing in pure CSS */}
            <div className={`animate-float-${i}`}>
              {/* 3. Innermost Visual Wrapper - Handles glass design & hover zoom/spring-lift */}
              <div
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl cursor-default
                           bg-white/40 dark:bg-[#0F1E35]/40 backdrop-blur-md overflow-hidden
                           border border-slate-200/50 dark:border-blue-500/10
                           hover:border-blue-300/60 dark:hover:border-blue-500/30
                           hover:scale-[1.04] hover:-translate-y-1
                           hover:shadow-lg hover:shadow-blue-500/5
                           dark:hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)]
                           transition-all duration-500 ease-out"
              >
                {/* Diagonal Glass Shimmer Sweep (Pure CSS animation on mount) */}
                {!shouldReduceMotion && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
                    <div
                      style={{
                        animation: "shimmer-sweep 1.4s cubic-bezier(0.16, 1, 0.3, 1) both",
                        animationDelay: `${cardDelay + 0.6}s`,
                      }}
                      className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 dark:via-blue-400/15 to-transparent skew-x-12"
                    />
                  </div>
                )}

                {/* 1. Numerical Count-Up Animation (JS/Framer dynamic counter) */}
                <StatCounter value={stat.value} delay={cardDelay} />

                {/* 2. Apple Signature Soft Blur Staggered Text Animation (JS/Framer staggered entry) */}
                <SoftBlurInText text={stat.label} delay={cardDelay + 0.1} />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
