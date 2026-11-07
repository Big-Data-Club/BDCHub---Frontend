"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { SiteDocument } from "../types";
import { siteHref } from "../links";

export function SiteSlider({ site, slug }: { site: SiteDocument; slug: string }) {
  const slides = site.slides.filter(slide => slide.enabled && slide.image);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!site.autoplay || slides.length < 2 || paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % slides.length), site.slideInterval * 1000);
    return () => clearInterval(timer);
  }, [site.autoplay, site.slideInterval, slides.length, paused]);

  if (!slides.length) return null;
  const slide = slides[index % slides.length];

  return (
    <section
      aria-label="Thông tin nổi bật"
      aria-roledescription="carousel"
      className="group relative overflow-hidden bg-slate-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
    >
      <Link href={siteHref(slide.href, slug)} tabIndex={slide.href ? 0 : -1} className="block">
        <Image
          src={slide.image}
          alt={slide.alt || slide.title}
          width={1600}
          height={600}
          priority
          unoptimized
          className="aspect-[16/7] w-full object-cover md:aspect-[21/8]"
        />
        {slide.title && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-8 pb-10 pt-16 text-lg font-bold text-white md:px-16 md:pb-14 md:text-2xl">
            <div className="mx-auto max-w-6xl">
              <span className="line-clamp-2 drop-shadow-md">{slide.title}</span>
            </div>
          </div>
        )}
      </Link>

      {slides.length > 1 && (
        <>
          {/* Previous / Next Arrow buttons */}
          <button
            type="button"
            aria-label="Ảnh trước"
            onClick={() => setIndex(i => (i + slides.length - 1) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md opacity-80 transition-all hover:bg-black/70 hover:opacity-100 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Ảnh tiếp theo"
            onClick={() => setIndex(i => (i + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md opacity-80 transition-all hover:bg-black/70 hover:opacity-100 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Indicators bar */}
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {slides.map((item, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Đến ảnh ${i + 1}`}
                aria-pressed={index % slides.length === i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index % slides.length === i ? "w-7 bg-white shadow-xs" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* Autoplay Pause / Play Pill */}
          {site.autoplay && (
            <button
              type="button"
              onClick={() => setPaused(p => !p)}
              className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/70"
            >
              {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              <span>{paused ? "Tiếp tục" : "Tạm dừng"}</span>
            </button>
          )}
        </>
      )}
    </section>
  );
}
