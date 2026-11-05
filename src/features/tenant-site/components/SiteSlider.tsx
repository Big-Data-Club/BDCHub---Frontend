"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  return <section aria-label="Thông tin nổi bật" aria-roledescription="carousel" className="relative overflow-hidden bg-slate-100 dark:bg-lms-card" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)}>
    <Link href={siteHref(slide.href, slug)} tabIndex={slide.href ? 0 : -1} className="block">
      <Image src={slide.image} alt={slide.alt || slide.title} width={1600} height={600} priority unoptimized className="aspect-[16/6] w-full object-cover" />
      {slide.title && <div className="absolute inset-x-0 bottom-0 bg-black/65 px-16 pb-12 pt-5 text-lg font-semibold text-white md:text-2xl">{slide.title}</div>}
    </Link>
    {slides.length > 1 && <>
      <button type="button" aria-label="Ảnh trước" onClick={() => setIndex(i => (i + slides.length - 1) % slides.length)} className="absolute left-3 top-1/2 rounded-full bg-black/60 px-3 py-2 text-white focus-visible:outline-2 focus-visible:outline-white">‹</button>
      <button type="button" aria-label="Ảnh tiếp theo" onClick={() => setIndex(i => (i + 1) % slides.length)} className="absolute right-3 top-1/2 rounded-full bg-black/60 px-3 py-2 text-white focus-visible:outline-2 focus-visible:outline-white">›</button>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">{slides.map((item, i) => <button key={i} type="button" aria-label={`Đến ảnh ${i + 1}`} aria-pressed={index % slides.length === i} onClick={() => setIndex(i)} className={`h-3 w-3 rounded-full border border-white ${index % slides.length === i ? "bg-white" : "bg-black/60"}`} />)}</div>
      {site.autoplay && <button type="button" onClick={() => setPaused(p => !p)} className="absolute right-3 top-3 rounded-xl bg-black/70 px-3 py-2 text-xs text-white">{paused ? "Tiếp tục" : "Dừng trình chiếu"}</button>}
    </>}
  </section>;
}
