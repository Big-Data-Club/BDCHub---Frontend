"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SiteBrand, SiteDocument, SitePage } from "../types";
import { siteHref } from "../links";
import { SiteSlider } from "./SiteSlider";
import { SiteSections } from "./SiteSections";

export function SiteView({ site, brand, page, preview = false }: { site: SiteDocument; brand: SiteBrand; page?: SitePage; preview?: boolean }) {
  return <div lang="vi" style={{ "--tenant-primary": site.primaryColor } as CSSProperties} className="min-h-screen bg-white text-slate-900 dark:bg-lms-bg dark:text-slate-100" onClickCapture={event => { if (preview && (event.target as Element).closest("a")) event.preventDefault(); }}>
    {preview && <div className="bg-amber-100 px-6 py-3 text-center font-semibold text-amber-950">Bản xem trước — chưa phải nội dung công khai</div>}
    <a href="#site-main" className="sr-only focus:not-sr-only">Đến nội dung chính</a>
    <div className="border-b border-slate-200 bg-slate-50 px-6 py-2 text-sm dark:border-blue-500/15 dark:bg-lms-card"><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2"><span>{site.tagline}</span><span>{site.contact.hotline && <>Hotline (Zalo): <a className="font-bold" href={`tel:${site.contact.hotline.replace(/[^+0-9]/g, "")}`}>{site.contact.hotline}</a></>}</span></div></div>
    <header className={`border-b border-slate-200 px-6 dark:border-blue-500/15 ${site.template === "modern" ? "py-8" : "py-5"}`}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
        <Link href={`/${brand.slug}`} className="flex items-center gap-4">{brand.logo && <Image src={brand.logo} alt={brand.name} width={72} height={72} unoptimized className="h-18 w-18 rounded-full bg-white object-contain" />}<span className="max-w-xl text-xl font-bold md:text-2xl">{brand.name}</span></Link>
        <Link href={`/${brand.slug}/login?callbackUrl=${encodeURIComponent(`/${brand.slug}/lms`)}`} className="rounded-xl bg-[var(--tenant-primary)] px-5 py-3 font-semibold text-white">Đăng nhập học tập</Link>
      </div>
    </header>
    <nav aria-label="Điều hướng website" className="border-b border-slate-200 bg-slate-50 px-4 dark:border-blue-500/15 dark:bg-lms-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start gap-1 py-2">{site.menu.map((item, i) => item.children.length ? <details key={i} className="group relative">
        <summary className="cursor-pointer list-none rounded-xl px-4 py-3 font-semibold hover:bg-slate-200 dark:hover:bg-blue-950">{item.label} ▾</summary>
        <div className="absolute left-0 z-30 min-w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-blue-500/20 dark:bg-lms-card"><Link href={siteHref(item.href, brand.slug)} className="block rounded-lg px-4 py-2 font-bold">{item.label}</Link>{item.children.map((child, j) => <Link key={j} href={siteHref(child.href, brand.slug)} className="block rounded-lg px-4 py-3 hover:bg-slate-100 dark:hover:bg-blue-950">{child.label}</Link>)}</div>
      </details> : <Link key={i} href={siteHref(item.href, brand.slug)} className="rounded-xl px-4 py-3 font-semibold hover:bg-slate-200 dark:hover:bg-blue-950">{item.label}</Link>)}</div>
    </nav>
    <main id="site-main">
      {!page && <SiteSlider site={site} slug={brand.slug} />}
      {page && <div className="mx-auto max-w-6xl px-6 py-8"><Link href={`/${brand.slug}`} className="text-sm underline">Trang chủ</Link><h1 className="mt-4 text-3xl font-bold">{page.title}</h1></div>}
      <SiteSections sections={page?.sections || site.sections} site={site} slug={brand.slug} />
    </main>
    <footer className="border-t border-slate-200 bg-slate-50 px-6 py-10 dark:border-blue-500/15 dark:bg-lms-card"><div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2"><div><p className="font-bold">{brand.name}</p><p className="mt-3 whitespace-pre-line text-sm">{site.footerText}</p></div><div className="space-y-2 text-sm"><p className="whitespace-pre-line">{site.contact.address}</p><p>{site.contact.email}</p><p>{site.contact.hotline}</p><p className="text-slate-500 dark:text-slate-400">Nền tảng BDC Hub</p></div></div></footer>
  </div>;
}
