"use client";

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

/** Landing titles are intentionally static: content is visible before hydration. */
export function HeroTitle({ titleText }: HeroTitleProps) {
  return (
    <div className="w-full">
      <h1 className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text pb-4 pt-2 text-center text-5xl font-black leading-[1.15] tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-left lg:text-8xl dark:from-blue-400 dark:to-cyan-400">
        {titleText}
      </h1>
    </div>
  );
}
